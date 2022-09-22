import db from "../db";
import loggerHandler from "../utils/logger-handler";
import BlockChainService from "./block-chain-service";
import {EventsQuery} from "../interfaces/block-chain-service";
import {BlockProcessor} from "../interfaces/block-processor";
import {Network_v2, NetworkRegistry, Web3Connection,} from "@taikai/dappkit";
import {Log} from "web3-core";
import {networksAttributes} from "../db/models/networks";

const {NEXT_PUBLIC_WEB3_CONNECTION: web3Host, NEXT_WALLET_PRIVATE_KEY: privateKey,} = process.env;

type EventsPerNetwork<T = any> = {[networkAddress: string]: {info: networksAttributes, returnValues: T[]}}

export class EventService<E = any> {
  #lastFromBlock: number = 0;
  #Actor: Network_v2|NetworkRegistry;
  get Actor() { return this.#Actor; }

  constructor(readonly name: string,
              readonly query?: EventsQuery,
              readonly fromRegistry = false,
              readonly chainService = new BlockChainService(),
              readonly web3Connection = new Web3Connection({web3Host, privateKey})) {}

  async getAllNetworks() {
    const allNetworks = await db.networks.findAll({where: {isRegistered: true}, raw: true});
    if (!allNetworks.length) {
      loggerHandler.warn(`${this.name} No networks found`);
      return []
    }

    return allNetworks;
  }

  async saveLastFromBlock() {
    const dbEvent = await db.chain_events.findOne({where: {name: this.name}});
    if (!this.#lastFromBlock) {
      loggerHandler.warn(`${this.name} had no #lastFromBlock`);
      return false;
    }

    if (!dbEvent) {
      loggerHandler.warn(`${this.name} not found on db`);
      return false;
    }

    dbEvent.lastBlock = this.#lastFromBlock;
    await dbEvent.save();
    loggerHandler.log(`${this.name} saved #lastFromBlock: ${this.#lastFromBlock}`);
    return true;
  }

  async _getEventsOfNetworks(): Promise<EventsPerNetwork> {

    this.web3Connection.start();

    const allNetworks = await this.getAllNetworks();
    if (!allNetworks.length)
      return {};

    const lastReadBlock = await db.chain_events.findOne({where: {name: this.name}});
    if (!lastReadBlock) {
      loggerHandler.warn(`${this.name} had no entry on chain_events`)
      return {};
    }

    if (this.fromRegistry)
      this.#Actor = new NetworkRegistry(this.web3Connection);
    else
      this.#Actor = new Network_v2(this.web3Connection);

    const event = this.Actor.abi.find(item => item.type === "event" && item.name === this.name);
    if (!event) {
      loggerHandler.error(`event ${this.name} not found on actor ABI`, {fromRegistry: this.fromRegistry});
      return {};
    }

    const eth = this.web3Connection.eth;
    const toBlock = await eth.getBlockNumber();
    const topics = [eth.abi.encodeEventSignature(event)];
    const events: Log[] = [];
    const perRequest = +(process.env.EVENTS_PER_REQUEST || 1500);
    const networkMap = allNetworks.reduce((prev, curr) => prev = {...prev, [curr.networkAddress!]: curr}, {})

    for (let fromBlock = lastReadBlock.lastBlock || 0; fromBlock <= toBlock; fromBlock += perRequest) {
      if (fromBlock + perRequest >= toBlock)
        fromBlock = toBlock;

      loggerHandler.log(`${this.name} Fetching events from ${fromBlock} to ${toBlock}`);

      events.push(...await eth.getPastLogs({fromBlock, toBlock, topics}));

      this.#lastFromBlock = fromBlock;
    }

    const mapEvent = ({address, data, topics}) =>
      ({address, returnValues: eth.abi.decodeLog(event.inputs || [], data, event.anonymous ? topics : topics.slice(1))})

    const reduceEvents = (previous, {address, returnValues: event}) => {
      if (!previous[address])
        previous[address] = {info: networkMap[address]};

      return ({...previous, [address]: {...previous[address], returnValues: [...previous[address].returnValues, event]}})
    }

    const eventsToParse = events.filter(({address}) => networkMap[address]);

    loggerHandler.log(`${this.name} Got ${eventsToParse.length} events with matching topics`);

    return eventsToParse.map(mapEvent).reduce(reduceEvents, {})
  }

  async _processEvents(blockProcessor: BlockProcessor<E>) {
    loggerHandler.info(`${this.name} start`);

    for (const [networkAddress, {info, returnValues}] of Object.entries(await this._getEventsOfNetworks()))
      await Promise.all(
        returnValues.map(event => {
          loggerHandler.log(`${this.name} (${networkAddress}) processing`, event);
          return blockProcessor(event, info);
        }));

    if (!this.query || !this.query?.networkName)
      await this.saveLastFromBlock();

    loggerHandler.info(`${this.name} finished`);
  }

  async getEvents() {
    loggerHandler.info(`${this.name} start`);
    if (!this.chainService._eventName)
      await this.chainService.init(this.name);

    return this.chainService.getEvents(this.query, this.fromRegistry);
  }

  async processEvents<T = any>(blockProcessor: BlockProcessor<T>) {
    try {
      const events = await this.getEvents();
      const eventsLength = events.map(({eventsOnBlock}) => eventsOnBlock).filter(v => !!v).flat(1).length;

      if (!eventsLength)
        return loggerHandler.info(`${this.name} has no events to be parsed`);

      for (const event of events) {
        const {network, eventsOnBlock} = event;
        if (!eventsOnBlock.length) {
          loggerHandler.info(`${this.name} Network ${network.networkAddress} has no events`);
          continue;
        }

        if (!(await this.chainService.networkService.loadNetwork(network.networkAddress))) {
          loggerHandler.error(`${this.name} Failed to load network ${network.networkAddress}`, network);
          continue;
        }

        await Promise.all(eventsOnBlock.map(block => blockProcessor(block, network)));

        loggerHandler.info(`${this.name} Parsed ${network.networkAddress}`);
      }

      if (!this.query || !this.query?.networkName)
        await this.chainService.saveLastBlock()

      loggerHandler.info(`${this.name} finished`);

    } catch (e: any) {
      loggerHandler.error(`${this.name} Error, ${e?.message}`, e)
    }
  }


}
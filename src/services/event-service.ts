import db from "../db";
import loggerHandler from "../utils/logger-handler";
import BlockChainService from "./block-chain-service";
import {EventsQuery} from "../interfaces/block-chain-service";
import {BlockProcessor} from "../interfaces/block-processor";
import {Network_v2, NetworkRegistry, Web3Connection,} from "@taikai/dappkit";
import {Log} from "web3-core";
import {networksAttributes} from "../db/models/networks";

const {NEXT_PUBLIC_WEB3_CONNECTION: web3Host, NEXT_WALLET_PRIVATE_KEY: privateKey,} = process.env;

type EventsPerNetwork<T = any> = {[networkAddress: string]: {info: networksAttributes, returnValues: T[]}[]}

export class EventService<E = any> {
  #Actor: Network_v2|NetworkRegistry;
  get Actor() { return this.#Actor; }

  constructor(readonly name: string,
              readonly query?: EventsQuery,
              readonly fromRegistry = false,
              readonly chainService = new BlockChainService(),
              readonly web3Connection = new Web3Connection({web3Host, privateKey})) {}

  async _getEventsOfNetworks(): Promise<EventsPerNetwork> {

    const warn = (text, ret = {}) => {
      loggerHandler.warn(text);
      return ret;
    }

    this.web3Connection.start();

    const allNetworks = await db.networks.findAll({where: {isRegistered: true}, raw: true});
    if (!allNetworks.length)
      return warn(`${this.name} No networks found when`);

    const lastReadBlock = await db.chain_events.findOne({where: {name: this.name}});
    if (!lastReadBlock)
      return warn(`${this.name} had no entry on chain_events`);


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

    for (let fromBlock = lastReadBlock.lastBlock!; fromBlock <= toBlock; fromBlock += perRequest) {
      if (fromBlock + perRequest >= toBlock)
        fromBlock = toBlock;

      loggerHandler.log(`${this.name} Fetching events from ${fromBlock} to ${toBlock}`);

      events.push(...await eth.getPastLogs({fromBlock, toBlock, topics}))
    }

    loggerHandler.log(`${this.name} Got ${events.length} events`);

    const _networks = allNetworks.map(({networkAddress}) => networkAddress);

    const mapEvent = ({address, data, topics}) =>
      ({address, returnValues: eth.abi.decodeLog(event.inputs || [], data, event.anonymous ? topics : topics.slice(1))})

    const reduceEvents = (previous, {address, returnValues: event}) => {
      if (!previous[address])
        previous[address] = {info: allNetworks.find(({networkAddress}) => networkAddress === address)};

      return ({...previous, [address]: {...previous[address], returnValues: [...previous[address].returnValues, event]}})
    }

    return events
        .filter(({address}) => _networks.includes(address))
        .map(mapEvent)
        .reduce(reduceEvents, {});
  }

  async _processEvents(blockProcessor: BlockProcessor<E>) {
    const eventsPerNetwork = await this._getEventsOfNetworks();
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
import db from "../db";
import loggerHandler from "../utils/logger-handler";

import {EventsQuery} from "../interfaces/block-chain-service";
import {BlockProcessor} from "../interfaces/block-processor";
import {Network_v2, NetworkRegistry, Web3Connection,} from "@taikai/dappkit";
import {Log} from "web3-core";
import {networksAttributes} from "../db/models/networks";
import {EventNameActionsMap} from "../utils/event-name-actions-map";

const {PUBLIC_WEB3_CONNECTION: web3Host, WALLET_PRIVATE_KEY: privateKey, EVENTS_CHAIN_ID: chainId } = process.env;

type EventsPerNetwork<T = any> = {[networkAddress: string]: {info: networksAttributes, returnValues: T[]}}

export class EventService<E = any> {
  #lastFromBlock: number = 0;
  #Actor: Network_v2|NetworkRegistry;
  get Actor() { return this.#Actor; }

  constructor(readonly name: string,
              readonly query?: EventsQuery,
              readonly fromRegistry = false,
              readonly web3Connection = new Web3Connection({web3Host, privateKey}),
              readonly onlyRegisteredNetworks = true,
              readonly customActor: any = null) {}

  async loadActorWithAddress(address: string) {
    try {
      this.#Actor = new (this.fromRegistry ? NetworkRegistry : Network_v2)(this.web3Connection, address);
      await this.#Actor.loadContract();
      loggerHandler.log(`${this.name} loaded contract (${address})`);
    } catch (e) {
      loggerHandler.error(`${this.name} failed to load actor`, {address, isRegistry: this.fromRegistry});
    }
  }

  async getAllNetworks() {
    const where = {
      ...this.onlyRegisteredNetworks ? {isRegistered: true} : {},
      chain_id: chainId,
    };

    const allNetworks = await db.networks.findAll({where, raw: true});
    if (!allNetworks.length) {
      loggerHandler.warn(`${this.name} No networks found for ${chainId}`);
      return []
    }

    return allNetworks;
  }

  async getRegistryAddress() {
    return (await db.chains.findOne({where: {chainId}, raw: true}))?.registryAddress;
  }

  async saveLastFromBlock() {
    const [dbEvent, created] =
      await db.chain_events.findOrCreate({
        where: {name: this.name, chain_id: chainId},
        defaults: {name: this.name, chain_id: +chainId!, lastBlock: 0}
      });

    if (!this.#lastFromBlock) {
      loggerHandler.log(`${this.name} had no #lastFromBlock`);
      return false;
    }

    if (created)
      loggerHandler.warn(`Created ${this.name} entry with id ${chainId}`);

    dbEvent.lastBlock = this.#lastFromBlock;
    await dbEvent.save();
    loggerHandler.log(`${this.name} saved #lastFromBlock: ${this.#lastFromBlock}`);
    return true;
  }

  async _getEventsOfNetworks(): Promise<EventsPerNetwork> {
    this.web3Connection.start();

    const allNetworks = await this.getAllNetworks();
    const registryAddress = this.fromRegistry ? await this.getRegistryAddress() : undefined;

    if (!allNetworks.length && !this.fromRegistry)
      return {};

    if (this.query?.networkName) {
      const _network = allNetworks.find(({name: n}) => n === this.query?.networkName);
      if (_network)
        allNetworks.splice(0, allNetworks.length, _network);
      else {
        loggerHandler.warn(`${this.name} found no network ${this.query?.networkName}`, allNetworks);
        return {}
      }
    }

    let lastReadBlock = await db.chain_events.findOne({where: {name: this.name, chain_id: chainId}});
    if (!lastReadBlock) {

      const lastBlock = +(process.env.BULK_CHAIN_START_BLOCK || await this.web3Connection.eth.getBlockNumber());
      await db.chain_events.create({
        name: this.name, 
        lastBlock: +(process.env.BULK_CHAIN_START_BLOCK || await this.web3Connection.eth.getBlockNumber()),
        chain_id: +chainId!
      });
      lastReadBlock = await db.chain_events.findOne({where: {name: this.name, chain_id: chainId}});
      loggerHandler.warn(`${this.name} had no entry on chain_events, created with blockNumber: ${lastBlock}`);
    }

    if (this.customActor) {
      this.#Actor = new this.customActor(this.web3Connection)
    } else {
      if (this.fromRegistry)
        this.#Actor = new NetworkRegistry(this.web3Connection);
      else
        this.#Actor = new Network_v2(this.web3Connection);
    }

    const eventName = EventNameActionsMap[this.name];
    if (!eventName) {
      loggerHandler.warn(`${this.name} has no matching mapped value @EventNameActionsMap`);
      return {}
    }

    const event = this.Actor.abi.find(item => item.type === "event" && item.name === eventName);
    if (!event) {
      loggerHandler.error(`event ${this.name} not found on actor ABI`, {fromRegistry: this.fromRegistry});
      return {};
    }

    const eth = this.web3Connection.eth;
    const startBlock = Number(this.query?.blockQuery?.from || lastReadBlock!.lastBlock) || 0;
    const endBlock = Number(this.query?.blockQuery?.to) || await eth.getBlockNumber();
    const topics = [eth.abi.encodeEventSignature(event)];
    const events: Log[] = [];
    const perRequest = +(process.env.EVENTS_PER_REQUEST || 1500);
    const networkMap = allNetworks.reduce((prev, curr) => ({...prev, [curr.networkAddress!.toLowerCase()]: curr}), {});
    const requests = (endBlock - startBlock) / perRequest;

    loggerHandler.log(`${this.name} Reading from ${startBlock} to ${endBlock}; Will total ${requests < 1 ? 1 : Math.round(requests)} requests`);

    let toBlock = 0;
    for (let fromBlock = startBlock; fromBlock < endBlock; fromBlock += perRequest) {
      toBlock = fromBlock + perRequest > endBlock ? endBlock : fromBlock + perRequest;

      loggerHandler.log(`${this.name} Fetching events from ${fromBlock} to ${toBlock}`, {topics,});

      events.push(...await eth.getPastLogs({fromBlock, toBlock, topics}));

      this.#lastFromBlock = toBlock;
    }

    const mapEvent = ({address, data, topics, transactionHash}) =>
      ({address, transactionHash, returnValues: eth.abi.decodeLog(event.inputs || [], data, event.anonymous ? topics : topics.slice(1))})


    const reduceEvents = (previous, {address, ...rest}) => {
      address = address.toLowerCase();
      if (!previous[address])
        previous[address] = {info: {...networkMap[address], chainId}, returnValues: []};

      return ({...previous, [address]: {...previous[address], returnValues: [...previous[address].returnValues, rest]}})
    }

    console.log("events", events);

    const eventsToParse = events.filter(({address}) => this.fromRegistry ? address.toLowerCase() === registryAddress?.toLowerCase() : networkMap[address?.toLowerCase()]);

    loggerHandler.log(`${this.name} Got ${eventsToParse.length} events with matching topics`);

    return eventsToParse.map(mapEvent).reduce(reduceEvents, {});
  }

  async _processEvents(blockProcessor: BlockProcessor<E>) {
    loggerHandler.info(`${this.name} start`);

    try {
      const entries = await this._getEventsOfNetworks();
      for (const [networkAddress, {info, returnValues}] of Object.entries(entries)) {
        await this.loadActorWithAddress(networkAddress);
        await Promise.all(returnValues.map(event => blockProcessor(event, info)));
      }

      if (!this.query || !this.query?.networkName || !this.query?.blockQuery)
        await this.saveLastFromBlock();

      loggerHandler.info(`${this.name} finished`);

    } catch (e: any) {
      console.log(e);
      loggerHandler.error(`${this.name} Error`, {error: e?.message || e.toString()});
    }
  }

}
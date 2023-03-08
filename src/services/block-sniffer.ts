import {Web3Connection} from "@taikai/dappkit";
import loggerHandler from "../utils/logger-handler";
import {Log} from "web3-core";
import {clearInterval} from "timers";
import db from "../db";
import {EventsQuery} from "../interfaces/block-chain-service";
import {AddressEventDecodedLog, MappedEventActions} from "../interfaces/block-sniffer";

export class BlockSniffer {
  #currentBlock = 0;
  #connection: Web3Connection;
  #interval: NodeJS.Timer | null;
  #actingChainId: number;

  /**
   *
   * @param web3Host {string} the URL of the web3 host to connect to
   * @param mappedEventActions {MappedEventActions} contract addresses and its abi to lookout for
   * @param startBlock {number} start block to query the web3Host on next pass
   * @param targetBlock {number} end block to query the web3Host on next pass, if none eth.getBlockNumber() will be used
   * @param query {object} query to pass to mappedAction when executed
   * @param interval {number} interval between chain queries, in milliseconds
   * @param pagesPerRequest {number} number of pages to read per request
   * @param autoStart {boolean} should the sniffer auto-start immediately
   */
  constructor(readonly web3Host: string,
              readonly mappedEventActions: MappedEventActions,
              startBlock: number = 0,
              readonly targetBlock = 0,
              readonly query: EventsQuery | null = null,
              readonly interval: number = 1000,
              readonly pagesPerRequest: number = 1500,
              autoStart = true) {

    this.#currentBlock = startBlock;
    this.#connection = new Web3Connection({web3Host});
    this.#connection.start();

    if (autoStart)
      this.start(true)
  }

  get currentBlock() {
    return this.#currentBlock;
  }


  /**
   * Loop decoded logs and search for a matching address and event, if found: try-catch the callback with the
   * decoded log entry
   */
  actOnMappedActions(decodedLogs: AddressEventDecodedLog) {
    loggerHandler.debug(`BlockSniffer (chain:${this.#actingChainId}) executing decoded logs`, decodedLogs);
    for (const [a, entry] of Object.entries(decodedLogs))
      for (const [e, logs] of this.mappedEventActions[a] ? Object.entries(entry) : [])
        for (const log of this.mappedEventActions[a].events[e] ? logs : [])
          try {
            const logWithContext = {...log, connection: this.#connection, chainId: this.#actingChainId};
            loggerHandler.info(`BlockSniffer (chain:${this.#actingChainId}) acting on ${a} ${e}`);
            loggerHandler.debug(`Payload`, log);
            this.mappedEventActions[a].events[e](logWithContext, this.query);
          } catch (e: any) {
            loggerHandler.error(`BlockSniffer (chain:${this.#actingChainId}) failed to act ${e} with payload`, log, e?.toString());
          }
  }

  /**
   * Will start an interval and query the current Web3Host for logs from #currentBlock to #connection.getLastBlock();
   * on receipt, if any logs contain a known address inside mappedEventsActions and if any topics match an event name inside
   * the mappedEventActions[contractAddress].events it will call its action function
   */
  async start(immediately = false) {
    loggerHandler.info(`BlockSniffer (chain:${this.#actingChainId}) ${this.#interval ? 're' : ''}starting`);
    loggerHandler.debug(`polling every ${this.interval / 1000}s (immediately: ${immediately.toString()}`);

    const callback = () =>
      this.getAndDecodeLogs()
        .then(this.actOnMappedActions)
        .catch(e => {
          loggerHandler.error(`BlockSniffer`, e);
        });

    this.clearInterval();


    this.#actingChainId = await this.#connection.eth.getChainId();
    await this.prepareCurrentBlock();

    if (immediately)
      callback();

    if (this.interval)
      this.#interval = setInterval(() => callback(), this.interval);
  }

  /**
   * Stops interval started by start();
   * Will not stop the already executing callback.
   * */
  stop() {
    this.clearInterval();
    loggerHandler.info(`BlockSniffer (chain:${this.#actingChainId}) stopped: ${!this.#interval?.hasRef()}`);
  }

  /**
   * maps addresses from mappedEventActions and uses that as a filter, along with the mapped topics from the abi to each
   * provided contract address, and fetches targetBlock via connection.eth.blockNumber and queries from #currentBlock to
   * targetBlock using pagesPerRequest; Decode the retrieved matching logs and return mapped by address and eventName.
   * */
  async getAndDecodeLogs(): Promise<AddressEventDecodedLog> {
    const targetBlock = this.targetBlock || await this.#connection.eth.getBlockNumber();
    const requests = (targetBlock - this.#currentBlock) / this.pagesPerRequest;
    const logs: Log[] = [];
    const _eth = this.#connection.eth;
    const mappedAbiEventsAddress = {};

    const address = Object.keys(this.mappedEventActions); // no need for new Set() because objects can't have dupes

    const topics = [...new Set( // use new Set() to remove dupes and then destroy it because we don't need a set
      Object.entries(this.mappedEventActions)
        .map(([a, {abi, events}], i) =>
          Object.keys(events)
            .map((event) => abi.find(({name}) => event === name))
            .filter(value => value)
            .map(item => ([_eth.abi.encodeEventSignature(item!), item!]))
            .map(([topic, item]) => {
              mappedAbiEventsAddress[a] = {
                ...(mappedAbiEventsAddress[a] || {}),
                [topic as string]: {abi, inputs: (item as any).inputs, name: (item as any).name}
              }
              return topic as string;
            })
        ).flat()
    )];

    loggerHandler.info(`BlockSniffer (chain:${this.#actingChainId}) Reading from ${this.#currentBlock} to ${targetBlock}; Will total ${requests < 1 ? 1 : Math.round(requests)} requests`);
    loggerHandler.debug(`Searching for topics and addresses`, topics, address);

    let toBlock = 0;
    for (let fromBlock = this.#currentBlock; fromBlock < targetBlock; fromBlock += this.pagesPerRequest) {
      toBlock = fromBlock + this.pagesPerRequest > targetBlock ? targetBlock : fromBlock + this.pagesPerRequest;

      loggerHandler.log(`BlockSniffer (chain:${this.#actingChainId}) Fetching events from ${fromBlock} to ${toBlock}`);

      logs.push(...await _eth.getPastLogs({fromBlock, toBlock, topics, address}));

      this.#currentBlock = toBlock;
    }

    await this.saveCurrentBlock();
    loggerHandler.info(`BlockSniffer (chain:${this.#actingChainId}) found ${logs.length} logs`);

    return logs.map(log => {
        const event = mappedAbiEventsAddress[log.address][log.topics[0]];
        if (!event)
          return {[log.address]: {[log.topics[0]]: [log]}} as any;
        return ({
          ...log,
          eventName: event.name as string,
          returnValues: _eth.abi.decodeLog(event.inputs, log.data, log.topics.slice(1))
        });
      })
      .filter(log => log.eventName)
      .reduce((p, c) => {
        const eventName = c.eventName;
        const address = c.address;
        return ({...p, [address]: {...(p[address] || {}), [eventName]: [...(p[address][eventName] || []), c]}})
      });
  }

  private clearInterval() {
    if (!this.#interval)
      return;

    clearInterval(this.#interval!);
    this.#interval = null;

    loggerHandler.debug(`BlockSniffer (chain:${this.#actingChainId}) cleared interval`);
  }

  private async saveCurrentBlock(currentBlock = 0) {
    db.chain_events.findOrCreate({
        where: {name: this.web3Host},
        defaults: {name: 'global', lastBlock: currentBlock, chain_id: this.#actingChainId}
      })
      .then(([event, created]) => {
        if (!created) {
          event.lastBlock = currentBlock
          event.save();
        }

        loggerHandler.debug(`Updated BlockSniffer (chain:${this.#actingChainId}) global events to ${currentBlock}`)
      })
  }

  private async prepareCurrentBlock() {
    this.#currentBlock =
      (await db.chain_events.findOne({where: {chain_id: this.#actingChainId}, raw: true}))?.lastBlock ||
      +(process.env?.BULK_CHAIN_START_BLOCK || 0);
    loggerHandler.debug(`BlockSniffer (chain:${this.#actingChainId}) currentBlock prepared as ${this.#currentBlock}`);
  }

}
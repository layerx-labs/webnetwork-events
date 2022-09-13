import {EventsQuery} from "../interfaces/block-chain-service";
import BlockChainService from "./block-chain-service";
import loggerHandler from "../utils/logger-handler";
import {BlockProcessor} from "../interfaces/block-processor";

export class EventService {
  constructor(readonly name: string,
              readonly query?: EventsQuery,
              readonly chainService = new BlockChainService(),) {}

  async getEvents(query?: EventsQuery) {
    loggerHandler.info(`retrieving ${this.name}...`);
    if (!this.chainService._eventName)
      await this.chainService.init(this.name);
    const events = await this.chainService.getEvents(query || this.query);
    loggerHandler.info(`found ${events.length || 0} events`);
    return events;
  }

  async processEvents<T = any>(blockProcessor: BlockProcessor<T>, query?: EventsQuery) {
    try {
      for (const event of await this.getEvents(query)) {
        const {network, eventsOnBlock} = event;
        if (!(await this.chainService.networkService.loadNetwork(network.networkAddress))) {
          loggerHandler.error(`Failed to load network ${network.name}`, network);
          continue;
        }

        await Promise.all(eventsOnBlock.map(block => blockProcessor(block, network)));

        loggerHandler.info(`Parsed ${this.name}`);
      }

      if (!query && !this.query)
        await this.chainService.saveLastBlock()

    } catch (e: any) {
      loggerHandler.error(`Error on ${this.name}, ${e?.message}`, e)
    }
  }
}
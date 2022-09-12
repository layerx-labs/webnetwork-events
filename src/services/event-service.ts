import {EventsQuery} from "../interfaces/block-chain-service";
import BlockChainService from "./block-chain-service";
import loggerHandler from "../utils/logger-handler";
import {BlockProcessor} from "../interfaces/block-processor";



export class EventService {
  constructor(readonly name: string,
              readonly chainService = new BlockChainService(),
              readonly query?: EventsQuery) {}

  async getEvents(query?: EventsQuery) {
    loggerHandler.info(`retrieving ${this.name}...`);
    if (!this.chainService._eventName)
      await this.chainService.init(this.name);
    const events = await this.chainService.getEvents(query || this.query);
    loggerHandler.info(`found ${events.length || 0} events`);
    return events;
  }

  async processEvents(blockProcessor: BlockProcessor, query?: EventsQuery) {
    try {
      for (const event of await this.getEvents(query || this.query)) {
        const {network, eventsOnBlock} = event;
        if (!(await this.chainService.networkService.loadNetwork(network.networkAddress))) {
          loggerHandler.error(`Failed to load network ${network.name}`, network);
          continue;
        }

        eventsOnBlock.forEach(async (block) => { await blockProcessor(block); })

      }
    } catch (e: any) {
      loggerHandler.error(`Error on ${this.name}, ${e?.message}`, e)
    }
  }
}
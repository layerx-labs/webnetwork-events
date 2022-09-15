import {EventsQuery} from "../interfaces/block-chain-service";
import BlockChainService from "./block-chain-service";
import loggerHandler from "../utils/logger-handler";
import {BlockProcessor} from "../interfaces/block-processor";

export class EventService {
  constructor(readonly name: string,
              readonly query?: EventsQuery,
              readonly fromRegistry = false,
              readonly chainService = new BlockChainService()) {}

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

      if (!this.query)
        await this.chainService.saveLastBlock()

      loggerHandler.info(`${this.name} finished`);

    } catch (e: any) {
      loggerHandler.error(`${this.name} Error, ${e?.message}`, e)
    }
  }


}
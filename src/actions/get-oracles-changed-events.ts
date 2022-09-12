import { fromSmartContractDecimals } from "@taikai/dappkit";
import db from "src/db";
import {
  BlockQuery,
  EventsProcessed,
  EventsQuery,
} from "src/interfaces/block-chain-service";
import BlockChainService from "src/services/block-chain-service";
import logger from "src/utils/logger-handler";

export const name = "getOraclesChangedEvents";
export const schedule = "*/30 * * * *"; // Each 30 minutes
export const description = "Sync oracles data and update council's count";
export const author = "clarkjoao";

async function _validateBlockQuery(
  service: BlockChainService,
  query: BlockQuery
): Promise<BlockQuery> {
  const currentValues = await service.getChainValues();
  const newQuery = query;

  /*
    Query to block cannot be too old, 
    because can impact blocks new earlier already processed
   */

  if (query.to < currentValues.lastBlock) {
    newQuery.from = query.to;
    newQuery.to = currentValues.currentBlock;
  }

  if (query.to > currentValues.lastBlock) {
    newQuery.from = currentValues.lastBlock;
    newQuery.to = query.to;
  }

  /**
   * if from is greater than currentBlock, swap them
   */

  if (query.to > currentValues.currentBlock) {
    newQuery.to = currentValues.currentBlock;
    newQuery.from = currentValues.lastBlock;
  }

  return newQuery;
}

export async function action(query?: EventsQuery): Promise<EventsProcessed> {
  const addressProcessed: string[] = [];
  const eventsProcessed: EventsProcessed = {};

  try {
    logger.info("retrieving oracles changed events");

    const service = new BlockChainService();
    await service.init(name);
    if (query?.blockQuery) {
      query.blockQuery = await _validateBlockQuery(service, query?.blockQuery);
    }
    const events = await service.getEvents(query);

    logger.info(`found ${events.length} ${name} events`);

    for (let event of events) {
      const { network, eventsOnBlock } = event;

      const _network = await db.networks.findOne({
        where: {
          networkAddress: network.networkAddress,
        },
      });

      if (!_network) {
        logger.info(`Network ${event.network.networkAddress} not found`);
        continue;
      }

      const councilAmount =
        await service?.networkService?.network?.councilAmount();
      const existing_members = [...(_network?.councilMembers || [])];
      const remove_members: string[] = [];

      for (let eventBlock of eventsOnBlock) {
        const { newLockedTotal, actor } = eventBlock.returnValues;

        const newTotal = fromSmartContractDecimals(newLockedTotal);

        if (newTotal >= councilAmount && !existing_members.includes(actor))
          existing_members.push(actor);
        else if (newTotal < councilAmount && existing_members.includes(actor))
          remove_members.push(actor);
      }

      const new_members = existing_members.filter(
        (address) => !remove_members.includes(address)
      );

      _network.councilMembers = new_members;
      addressProcessed.push(...new_members);

      // Update network council members only if schema is updated
      if (!query?.blockQuery) await _network.save();

      eventsProcessed[network.name as string] = addressProcessed;
    }
    if (!query?.networkName) await service.saveLastBlock();
  } catch (err) {
    logger.error(`Error ${name}: ${err}`);
  }

  return eventsProcessed;
}

import { fromSmartContractDecimals } from "@taikai/dappkit";
import db from "src/db";
import { BlockQuery, EventsQuery } from "src/interfaces/block-chain-service";
import BlockChainService from "src/services/block-chain-service";
import logger from "src/utils/logger-handler";

export const name = "getOraclesChangedEvents";
export const schedule = "1 * * * * *";
export const description = "update oracles amount";
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

export default async function action(query?: EventsQuery): Promise<string[]> {
  const addressProcessed: string[] = [];
  logger.info("retrieving oracles changed events");

  const service = new BlockChainService();
  await service.init(name);
  if (query?.blockQuery) {
    query.blockQuery = await _validateBlockQuery(service, query?.blockQuery);
  }
  const events = await service.getEvents(query);

  logger.info(`found ${events.length} ${name} events`);

  try {
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
      await _network.save();
    }
  } catch (err) {
    logger.error(`Error ${name}: ${err}`);
  }
  if (!query) await service.saveLastBlock();

  return addressProcessed;
}

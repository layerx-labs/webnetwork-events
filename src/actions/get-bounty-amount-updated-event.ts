import db from "src/db";
import {
  BountiesProcessed,
  EventsProcessed,
  EventsQuery,
} from "src/interfaces/block-chain-service";
import BlockChainService from "src/services/block-chain-service";
import logger from "src/utils/logger-handler";
import {EventService} from "../services/event-service";
import {XEvents} from "@taikai/dappkit";
import {BountyAmountUpdatedEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";

export const name = "getBountyAmountUpdatedEvents";
export const schedule = "*/10 * * * *"; // Each 10 minutes
export const description = "retrieving bounty updated events";
export const author = "clarkjoao";

export async function action(
  query?: EventsQuery
): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};

  try {
    const service = new EventService(name, new BlockChainService(), query);

    const processor = async (block: XEvents<BountyAmountUpdatedEvent>, network) => {
      const {id} = block.returnValues;

      const bounty = await service.chainService.networkService.network.getBounty(id);
      if (!bounty)
        logger.info(`Bounty not found for id ${id} in network ${network.networkAddress}`);
      else {
        const dbBounty = await db.issues.findOne({
          where: {contractId: id, issueId: bounty.cid, network_id: network.id}});

        if (!dbBounty)
          logger.info(`Failed to find a bounty on database matching ${bounty.cid} on network ${network.network_id}`)
        else {
          dbBounty.amount = +bounty.tokenAmount;
          await dbBounty.save();

          eventsProcessed[network.name] = {[dbBounty.issueId!.toString()]: {bounty: dbBounty, eventBlock: block}};
        }
      }
    }

    await service.processEvents(processor);

  } catch (e) {
    logger.error(`Failed to parse ${name}`, e);
  }

  return eventsProcessed;
}

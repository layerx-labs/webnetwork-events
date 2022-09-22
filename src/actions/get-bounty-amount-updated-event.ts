import db from "src/db";
import logger from "src/utils/logger-handler";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {EventService} from "../services/event-service";
import {BountyAmountUpdatedEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import {DB_BOUNTY_NOT_FOUND, NETWORK_BOUNTY_NOT_FOUND} from "../utils/messages.const";
import {BlockProcessor} from "../interfaces/block-processor";
import {Network_v2} from "@taikai/dappkit";

export const name = "getBountyAmountUpdatedEvents";
export const schedule = "*/13 * * * *";
export const description = "retrieving bounty updated events";
export const author = "clarkjoao";

export async function action(query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};

  const service = new EventService(name, query);

  const processor: BlockProcessor<BountyAmountUpdatedEvent> = async (block, network) => {
    const {id} = block.returnValues;

    const bounty = await (service.Actor as Network_v2).getBounty(id);
    if (!bounty)
      logger.error(NETWORK_BOUNTY_NOT_FOUND(name, id, network.networkAddress));
    else {
      const dbBounty = await db.issues.findOne({
        where: {contractId: id, issueId: bounty.cid, network_id: network.id}});

      if (!dbBounty)
        logger.error(DB_BOUNTY_NOT_FOUND(name, bounty.cid, network.id))
      else {
        dbBounty.amount = +bounty.tokenAmount;
        await dbBounty.save();

        eventsProcessed[network.name] = {...eventsProcessed[network.name], [dbBounty.issueId!.toString()]: {bounty: dbBounty, eventBlock: block}};
      }
    }
  }

  await service._processEvents(processor);

  return eventsProcessed;
}

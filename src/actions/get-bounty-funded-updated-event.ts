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
import {BountyFunded} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import {DB_BOUNTY_NOT_FOUND, NETWORK_BOUNTY_NOT_FOUND} from "../utils/messages.const";

export const name = "getBountyFundedEvents";
export const schedule = "*/14 * * * *"; // Each 10 minutes
export const description = "retrieving bounty created events";
export const author = "MarcusviniciusLsantos";

export async function action(query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};

  try {

    const service = new EventService(name, query);
    const {chainService:{networkService:{network:{getBounty}}}} = service;

    const processor = async (block: XEvents<BountyFunded>, network) => {
      const {id,} = block.returnValues;

      const bounty = await getBounty(id);
      if (!bounty)
        return logger.error(NETWORK_BOUNTY_NOT_FOUND(id, network.networkAddress));

      const dbBounty = await db.issues.findOne({
        where: {contractId: id, issueId: bounty.cid, network_id: network?.id,}});

      if (!dbBounty)
        return logger.error(DB_BOUNTY_NOT_FOUND(bounty.cid, network.id));

      dbBounty.amount =
        dbBounty.fundedAmount =
          bounty.funding.reduce((prev, current) => prev + +current.amount, 0);

      await dbBounty.save();

      eventsProcessed[network.name] = {...eventsProcessed[network.name], [dbBounty.issueId!.toString()]: {bounty: dbBounty, eventBlock: block}};
    }

    await service.processEvents<BountyFunded>(processor);

  } catch (err) {
    logger.error(`Error update bounty amount:`, err);
  }

  return eventsProcessed;
}

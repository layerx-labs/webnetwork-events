import db from "src/db";
import logger from "src/utils/logger-handler";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {EventService} from "../services/event-service";
import {BountyFunded} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import {DB_BOUNTY_NOT_FOUND, NETWORK_BOUNTY_NOT_FOUND} from "../utils/messages.const";
import {BlockProcessor} from "../interfaces/block-processor";
import {Network_v2} from "@taikai/dappkit";
import BigNumber from "bignumber.js";

export const name = "getBountyFundedEvents";
export const schedule = "*/14 * * * *";
export const description = "retrieving bounty created events";
export const author = "MarcusviniciusLsantos";

export async function action(query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};
  const service = new EventService(name, query);

  const processor: BlockProcessor<BountyFunded> = async (block, network) => {
    const {id,} = block.returnValues;

    const bounty = await (service.Actor as Network_v2).getBounty(+id);
    if (!bounty)
      return logger.error(NETWORK_BOUNTY_NOT_FOUND(name, id, network.networkAddress));

    const dbBounty = await db.issues.findOne({
      where: {contractId: id, issueId: bounty.cid, network_id: network?.id,}});

    if (!dbBounty)
      return logger.error(DB_BOUNTY_NOT_FOUND(name, bounty.cid, network.id));

    dbBounty.amount =
      dbBounty.fundedAmount =
        bounty.funding.reduce((prev, current) => BigNumber(current.amount).plus(prev), BigNumber(0)).toString();

    await dbBounty.save();

    eventsProcessed[network.name] = {...eventsProcessed[network.name], [dbBounty.issueId!.toString()]: {bounty: dbBounty, eventBlock: block}};
  }

  await service._processEvents(processor);

  return eventsProcessed;
}

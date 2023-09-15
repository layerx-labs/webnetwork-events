import db from "src/db";
import logger from "src/utils/logger-handler";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {BountyPullRequestCanceledEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import {DB_BOUNTY_NOT_FOUND, NETWORK_NOT_FOUND} from "../utils/messages.const";
import {DecodedLog} from "../interfaces/block-sniffer";
import {getBountyFromChain, getNetwork, parseLogWithContext} from "../utils/block-process";
import {sendMessageToTelegramChannels} from "../integrations/telegram";
import {BOUNTY_STATE_CHANGED, DELIVERABLE_CANCELED} from "../integrations/telegram/messages";

export const name = "getBountyPullRequestCanceledEvents";
export const schedule = "*/11 * * * *";
export const description = "Sync pull-request canceled events";
export const author = "clarkjoao";

export async function action(block: DecodedLog<BountyPullRequestCanceledEvent['returnValues']>, query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};
  const {returnValues: {bountyId, pullRequestId}, connection, address, chainId} = block;

  const bounty = await getBountyFromChain(connection, address, bountyId, name);
  if (!bounty)
    return eventsProcessed;

  const network = await getNetwork(chainId, address);
  if (!network) {
    logger.warn(NETWORK_NOT_FOUND(name, address))
    return eventsProcessed;
  }

  const dbBounty = await db.issues.findOne({
    where: {contractId: bounty.id, network_id: network.id},
    include: [{association: "network"}]
  });

  if (!dbBounty) {
    logger.warn(DB_BOUNTY_NOT_FOUND(name, bounty.cid, network.id))
    return eventsProcessed;
  }

  const pullRequest = bounty.pullRequests[pullRequestId];

  const dbDeliverable = await db.deliverables.findOne({
    where: {
      id: pullRequest.cid
    }
  });

  if (!dbDeliverable) {
    logger.warn(`${name} Deliverable ${pullRequest.cid} not found in database`, bounty)
    return eventsProcessed;
  }

  dbDeliverable.canceled = true
  await dbDeliverable.save();

  if (!["canceled", "closed", "proposal"].includes(dbBounty.state!)) {
    if (bounty.pullRequests.some(({ready, canceled}) => ready && !canceled))
      dbBounty.state = "ready";
    else
      dbBounty.state = "open";

      await dbBounty.save();
      sendMessageToTelegramChannels(BOUNTY_STATE_CHANGED(dbBounty.state, dbBounty));
      sendMessageToTelegramChannels(DELIVERABLE_CANCELED(dbBounty, dbDeliverable, dbDeliverable.id))
  }

  eventsProcessed[network.name!] = {
    [dbBounty.id!.toString()]: {bounty: dbBounty, eventBlock: parseLogWithContext(block)}
  };


  return eventsProcessed;
}

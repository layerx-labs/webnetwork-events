import "dotenv/config";
import db from "src/db";
import logger from "src/utils/logger-handler";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {BountyPullRequestCreatedEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import {DB_BOUNTY_NOT_FOUND, NETWORK_NOT_FOUND} from "../utils/messages.const";
import {DecodedLog} from "../interfaces/block-sniffer";
import {getBountyFromChain, getNetwork, parseLogWithContext} from "../utils/block-process";
import {sendMessageToTelegramChannels} from "../integrations/telegram";
import {DELIVERABLE_OPEN} from "../integrations/telegram/messages";
import {Push} from "../services/analytics/push";
import {AnalyticEventName} from "../services/analytics/types/events";
import updateSeoCardBounty from "src/modules/handle-seo-card";

export const name = "getBountyPullRequestCreatedEvents";
export const schedule = "*/10 * * * *";
export const description = "Sync pull-request created events";
export const author = "clarkjoao";

export async function action(block: DecodedLog<BountyPullRequestCreatedEvent['returnValues']>, query?: EventsQuery): Promise<EventsProcessed> {
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
    where: {contractId: bountyId, network_id: network.id},
    include: [{association: "network"}]
  });

  if (!dbBounty) {
    logger.warn(DB_BOUNTY_NOT_FOUND(name, bounty.cid, network.id));
    return eventsProcessed
  }

  const pullRequest = bounty.pullRequests[pullRequestId];

  const dbDeliverable = await db.deliverables.findOne({
    where: { id: pullRequest.cid }
  });

  if (!dbDeliverable) {
    logger.warn(`${name} No deliverable found with "pending" and id ${pullRequest.cid}, maybe it was already parsed?`);
    return eventsProcessed;
  }

  if(pullRequest?.originCID?.toLowerCase() !== dbDeliverable?.ipfsLink?.toLowerCase()){
    dbDeliverable.ipfsLink = pullRequest.originCID
  }

  dbDeliverable.prContractId = pullRequest.id
  dbDeliverable.bountyId = bounty.id
  await dbDeliverable.save();

  updateSeoCardBounty(dbBounty.id, name);

  eventsProcessed[network.name!] = {
    [dbBounty.id!.toString()]: {bounty: dbBounty, eventBlock: parseLogWithContext(block)}
  };

  sendMessageToTelegramChannels(DELIVERABLE_OPEN(dbBounty, dbDeliverable, dbDeliverable.id));

  const targets = [(await dbBounty.getUser({attributes: ["email", "id", "user_settings"], raw: true}))]

  const AnalyticEvent = {
    name: AnalyticEventName.PULL_REQUEST_OPEN,
    params: {
      chainId, network: {name: network.name, id: network.id},
      bountyId: dbBounty.id, bountyContractId: dbBounty.contractId,
      deliverableId: dbDeliverable.id, deliverableContractId: pullRequestId,
      actor: pullRequest.creator,
      title: dbBounty.title,
    }
  }

  const NotificationEvent = {
    name: AnalyticEventName.NOTIF_DELIVERABLE_CREATED,
    params: {
      targets,
      creator: {
        address: dbDeliverable.user.address,
        id: dbDeliverable.user.id,
        username: dbDeliverable.user.handle,
      },
      notification: {
        id: dbDeliverable.id,
        title: `Deliverable #${dbDeliverable.id} has been created on task #${dbBounty.id}`,
        network: dbBounty.network.name
      }
    }
  }

  Push.events([AnalyticEvent, NotificationEvent])

  return eventsProcessed;
}

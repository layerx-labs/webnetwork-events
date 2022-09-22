import db from "src/db";
import logger from "src/utils/logger-handler";
import { EventsProcessed, EventsQuery, } from "src/interfaces/block-chain-service";
import {EventService} from "../services/event-service";
import {BountyPullRequestReadyForReviewEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import {DB_BOUNTY_NOT_FOUND, NETWORK_BOUNTY_NOT_FOUND} from "../utils/messages.const";
import {BlockProcessor} from "../interfaces/block-processor";
import {Network_v2} from "@taikai/dappkit";

export const name = "getBountyPullRequestReadyForReviewEvents";
export const schedule = "*/12 * * * *";
export const description = "Sync pull-request created events";
export const author = "clarkjoao";

export async function action(query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};
  const service = new EventService(name, query);

  const processor: BlockProcessor<BountyPullRequestReadyForReviewEvent> = async (block, network) => {
    const {bountyId, pullRequestId} = block.returnValues;

    const bounty = await (service.Actor as Network_v2).getBounty(bountyId);
    if (!bounty)
      return logger.error(NETWORK_BOUNTY_NOT_FOUND(name, bountyId, network.networkAddress));

    const dbBounty = await db.issues.findOne({
      where:{ issueId: bounty.cid, contractId: bountyId, network_id: network.id}})
    if (!dbBounty)
      return logger.error(DB_BOUNTY_NOT_FOUND(name, bounty.cid, network.id));

    const pullRequest = bounty.pullRequests[pullRequestId];

    const dbPullRequest = await db.pull_requests.findOne({
      where: {issueId: dbBounty.id, githubId: pullRequest.cid.toString(), status: "draft"}})

    if (!dbPullRequest)
      return logger.error(`${name} No pull request found in database for pending and id ${pullRequest.cid}`, bounty);

    dbPullRequest.status =
      pullRequest.canceled ? "canceled" : pullRequest?.ready ? "ready" : "draft";

    await dbPullRequest.save();

    if (dbBounty.state !== "ready") {
      dbBounty.state = "ready";
      await dbBounty.save();
    }

    eventsProcessed[network.name] = {...eventsProcessed[network.name], [dbBounty.issueId!.toString()]: {bounty: dbBounty, eventBlock: block}};
  }

  await service._processEvents(processor);


  return eventsProcessed;
}

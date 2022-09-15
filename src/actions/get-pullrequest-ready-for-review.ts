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
import {BountyPullRequestReadyForReviewEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import {DB_BOUNTY_NOT_FOUND, NETWORK_BOUNTY_NOT_FOUND} from "../utils/messages.const";

export const name = "getBountyPullRequestReadyForReviewEvents";
export const schedule = "*/30 * * * *"; // Each 30 minutes
export const description = "Sync pull-request created events";
export const author = "clarkjoao";

export async function action(query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};

  try {

    const service = new EventService(name, query);

    const processor = async (block: XEvents<BountyPullRequestReadyForReviewEvent>, network) => {
      const {bountyId, pullRequestId} = block.returnValues;

      const bounty = await service.chainService.networkService.network.getBounty(bountyId);
      if (!bounty)
        return logger.error(NETWORK_BOUNTY_NOT_FOUND(bountyId, network.networkAddress));

      const dbBounty = await db.issues.findOne({
        where:{ issueId: bounty.cid, contractId: bountyId, network_id: network.id}})
      if (!dbBounty)
        return logger.error(DB_BOUNTY_NOT_FOUND(bounty.cid, network.id));

      const pullRequest = bounty.pullRequests[pullRequestId];

      const dbPullRequest = await db.pull_requests.findOne({
        where: {issueId: dbBounty.id, githubId: pullRequest.cid.toString(), status: "draft"}})

      if (!dbPullRequest)
        return logger.error(`No pull request found in database for pending and id ${pullRequest.cid}`, bounty);

      dbPullRequest.status =
        pullRequest.canceled ? "canceled" : pullRequest?.ready ? "ready" : "draft";

      await dbPullRequest.save();

      if (dbBounty.state !== "ready") {
        dbBounty.state = "ready";
        await dbBounty.save();
      }

      eventsProcessed[network.name] = {...eventsProcessed[network.name], [dbBounty.issueId!.toString()]: {bounty: dbBounty, eventBlock: block}};
    }

    await service.processEvents(processor);

  } catch (err) {
    logger.error(`Error ${name}:`, err);
  }

  return eventsProcessed;
}

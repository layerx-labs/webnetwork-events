import db from "src/db";
import logger from "src/utils/logger-handler";
import GHService from "src/services/github";
import {EventsProcessed,EventsQuery,} from "src/interfaces/block-chain-service";
import {Bounty, PullRequest} from "src/interfaces/bounties";
import {slashSplit} from "src/utils/string";
import {XEvents} from "@taikai/dappkit";
import {BountyPullRequestCanceledEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import {EventService} from "../services/event-service";
import {DB_BOUNTY_NOT_FOUND, NETWORK_BOUNTY_NOT_FOUND} from "../utils/messages.const";

export const name = "getBountyPullRequestCanceledEvents";
export const schedule = "*/11 * * * *"; // Each 10 minutes
export const description = "Sync pull-request canceled events";
export const author = "clarkjoao";

async function closePullRequest(bounty: Bounty, pullRequest: PullRequest) {
  const [owner, repo] = slashSplit(bounty?.repository?.githubPath as string);
  await GHService.pullrequestClose(repo, owner, pullRequest?.githubId as string);

  const body = `This pull request was closed ${pullRequest?.githubLogin ? `by @${pullRequest.githubLogin}` : ""}`;
  await GHService.createCommentOnIssue(repo, owner, bounty?.githubId as string, body);
}

export async function action(query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};

  try {

    const service = new EventService(name, query);

    const processor = async (block: XEvents<BountyPullRequestCanceledEvent>, network) => {
      const {bountyId, pullRequestId} = block.returnValues;

      const bounty = await service.chainService.networkService.network.getBounty(bountyId);
      if (!bounty)
        return logger.error(NETWORK_BOUNTY_NOT_FOUND(bountyId, network.networkAddress));

      const dbBounty = await db.issues.findOne({
        where: { contractId: bounty.id, network_id: network.id }, include: [{association: "repository"}]});
      if (!dbBounty)
        return logger.error(DB_BOUNTY_NOT_FOUND(bounty.cid, network.id))

      const pullRequest = bounty.pullRequests[pullRequestId];

      const dbPullRequest = await db.pull_requests.findOne({
        where:{ issueId: dbBounty.id, githubId: pullRequest.cid, contractId: pullRequest.id}});

      if (!dbPullRequest)
        return logger.error(`Pull request ${pullRequest.cid} not found in database`, bounty)

      await closePullRequest(dbBounty, dbPullRequest);

      dbPullRequest.status = "canceled";
      await dbPullRequest.save();

      if (bounty.pullRequests.some(({ready, canceled}) => ready && !canceled)) {
        dbBounty.state = "open";
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

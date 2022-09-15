import db from "src/db";
import {
  BountiesProcessed,
  EventsProcessed,
  EventsQuery,
} from "src/interfaces/block-chain-service";
import BlockChainService from "src/services/block-chain-service";
import logger from "src/utils/logger-handler";

import "dotenv/config";
import { Bounty, PullRequest } from "src/interfaces/bounties";
import GHService from "src/services/github";
import { slashSplit } from "src/utils/string";
import {EventService} from "../services/event-service";
import {XEvents} from "@taikai/dappkit";
import {BountyPullRequestCreatedEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import {DB_BOUNTY_NOT_FOUND, NETWORK_BOUNTY_NOT_FOUND} from "../utils/messages.const";
const webAppUrl = process.env.WEBAPP_URL || "http://localhost:3000";

export const name = "getBountyPullRequestCreatedEvents";
export const schedule = "*/10 * * * *";
export const description = "Sync pull-request created events";
export const author = "clarkjoao";

const getPRStatus = (prStatus): string =>
  prStatus?.canceled ? "canceled" : prStatus?.ready ? "ready" : "draft";

async function createCommentOnIssue(bounty: Bounty, pullRequest: PullRequest) {
  const issueLink = `${webAppUrl}/bounty?id=${bounty.githubId}&repoId=${bounty.repository_id}`;
  const body = `@${bounty.creatorGithub}, @${pullRequest.githubLogin} has a solution - [check your bounty](${issueLink})`;
  const [owner, repo] = slashSplit(bounty?.repository?.githubPath as string);
  return await GHService.createCommentOnIssue(repo, owner, bounty?.githubId as string, body);
}

export async function action(query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};

  try {

    const _service = new EventService(name, query);

    const processor = async (block: XEvents<BountyPullRequestCreatedEvent>, network) => {
      const {bountyId, pullRequestId} = block.returnValues;

      const bounty = await _service.chainService.networkService.network.getBounty(bountyId);
      if (!bounty)
        return logger.error(NETWORK_BOUNTY_NOT_FOUND(name, bountyId, network.networkAddress));

      const dbBounty = await db.issues.findOne({
        where: {contractId: bountyId, issueId: bounty.cid, network_id: network.id},
        include: [{ association: "repository" }]});

      if (!dbBounty)
        return logger.error(DB_BOUNTY_NOT_FOUND(name, bounty.cid, network.id));

      const pullRequest = bounty.pullRequests[pullRequestId];

      const dbPullRequest = await db.pull_requests.findOne({
        where: {issueId: dbBounty.id, githubId: pullRequest.cid, status: "pending"}});

      if (!dbPullRequest)
        return logger.error(`${name} No pull request found in database for pending and id ${pullRequest.cid}`, bounty);

      dbPullRequest.status = getPRStatus(dbPullRequest);
      dbPullRequest.userRepo = pullRequest.userRepo;
      dbPullRequest.userBranch = pullRequest.userBranch;
      dbPullRequest.contractId = pullRequest.id;

      await dbPullRequest.save();

      await createCommentOnIssue(dbBounty, dbPullRequest)
        .catch(logger.error);

      eventsProcessed[network.name] = {...eventsProcessed[network.name], [dbBounty.issueId!.toString()]: {bounty: dbBounty, eventBlock: block}};
    }
  } catch (err) {
    logger.error(`Error ${name}:`, err);
  }
  return eventsProcessed;
}

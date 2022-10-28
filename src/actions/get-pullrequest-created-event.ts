import "dotenv/config";
import db from "src/db";
import logger from "src/utils/logger-handler";
import GHService from "src/services/github";
import { EventsProcessed,EventsQuery, } from "src/interfaces/block-chain-service";
import { Bounty, PullRequest } from "src/interfaces/bounties";
import { slashSplit } from "src/utils/string";
import {EventService} from "../services/event-service";
import {BountyPullRequestCreatedEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import {DB_BOUNTY_NOT_FOUND, NETWORK_BOUNTY_NOT_FOUND} from "../utils/messages.const";
import {BlockProcessor} from "../interfaces/block-processor";
import {Network_v2} from "@taikai/dappkit";

export const name = "getBountyPullRequestCreatedEvents";
export const schedule = "*/10 * * * *";
export const description = "Sync pull-request created events";
export const author = "clarkjoao";

const webAppUrl = process.env.WEBAPP_URL || "http://localhost:3000";

const getPRStatus = (prStatus): string =>
  prStatus?.canceled ? "canceled" : prStatus?.ready ? "ready" : "draft";

  async function createCommentOnIssue(bounty: Bounty, pullRequest: PullRequest) {
    const networkName = bounty?.network?.name || "bepro";

    const issueLink = `${webAppUrl}/${networkName}/bounty?id=${bounty.githubId}&repoId=${bounty.repository_id}`;
    const body = `@${pullRequest.githubLogin} has a solution - [check your bounty](${issueLink})`;

    const [owner, repo] = slashSplit(bounty?.repository?.githubPath as string);
    return await GHService.createCommentOnIssue(repo, owner, bounty?.githubId as string, body);
  }

export async function action(query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};
  const _service = new EventService(name, query);

  const processor: BlockProcessor<BountyPullRequestCreatedEvent> = async (block, network) => {
    const {bountyId, pullRequestId} = block.returnValues;

    const bounty = await (_service.Actor as Network_v2).getBounty(bountyId);
    if (!bounty)
      return logger.error(NETWORK_BOUNTY_NOT_FOUND(name, bountyId, network.networkAddress));

    const dbBounty = await db.issues.findOne({
      where: {contractId: bountyId, issueId: bounty.cid, network_id: network.id},
      include: [{ association: "repository" }, { association: "network" }]});

    if (!dbBounty)
      return logger.error(DB_BOUNTY_NOT_FOUND(name, bounty.cid, network.id));

    const pullRequest = bounty.pullRequests[pullRequestId];

    const dbPullRequest = await db.pull_requests.findOne({
      where: {issueId: dbBounty.id, githubId: pullRequest.cid.toString(), status: "pending"}});

    if (!dbPullRequest)
      return logger.warn(`${name} No pull request found with "pending" and id ${pullRequest.cid}, maybe it was already parsed?`);

    dbPullRequest.status = getPRStatus(dbPullRequest);
    dbPullRequest.userRepo = pullRequest.userRepo;
    dbPullRequest.userBranch = pullRequest.userBranch;
    dbPullRequest.contractId = pullRequest.id;
    dbPullRequest.userAddress = pullRequest.creator;

    await dbPullRequest.save();

    await createCommentOnIssue(dbBounty, dbPullRequest)
      .catch(logger.error);

    eventsProcessed[network.name] = {...eventsProcessed[network.name], [dbBounty.issueId!.toString()]: {bounty: dbBounty, eventBlock: block}};
  }

  await _service._processEvents(processor)

  return eventsProcessed;
}

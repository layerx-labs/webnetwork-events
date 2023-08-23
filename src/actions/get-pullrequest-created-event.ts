import "dotenv/config";
import db from "src/db";
import logger from "src/utils/logger-handler";
import GHService from "src/services/github";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {Bounty, PullRequest} from "src/interfaces/bounties";
import {slashSplit} from "src/utils/string";
import {BountyPullRequestCreatedEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import {DB_BOUNTY_NOT_FOUND, NETWORK_NOT_FOUND} from "../utils/messages.const";
import {DecodedLog} from "../interfaces/block-sniffer";
import {getBountyFromChain, getNetwork, parseLogWithContext} from "../utils/block-process";
import {sendMessageToTelegramChannels} from "../integrations/telegram";
import {PULL_REQUEST_OPEN} from "../integrations/telegram/messages";

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

  const dbPullRequest = await db.pull_requests.findOne({
    where: {issueId: dbBounty.id, githubId: pullRequest.cid.toString(), status: "pending", network_id: network?.id}
  });

  if (!dbPullRequest) {
    logger.warn(`${name} No pull request found with "pending" and id ${pullRequest.cid}, maybe it was already parsed?`);
    return eventsProcessed;
  }

  dbPullRequest.status = getPRStatus(dbPullRequest);
  dbPullRequest.userRepo = pullRequest.userRepo;
  dbPullRequest.userBranch = pullRequest.userBranch;
  dbPullRequest.contractId = pullRequest.id;
  dbPullRequest.userAddress = pullRequest.creator;

  await dbPullRequest.save();
    sendMessageToTelegramChannels(PULL_REQUEST_OPEN(dbBounty, dbPullRequest, pullRequestId));

  await createCommentOnIssue(dbBounty, dbPullRequest)
    .catch(logger.error);

  eventsProcessed[network.name!] = {
    [dbBounty.id!.toString()]: {bounty: dbBounty, eventBlock: parseLogWithContext(block)}
  };

  return eventsProcessed;
}

import db from "src/db";
import logger from "src/utils/logger-handler";
import GHService from "src/services/github";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {Bounty, PullRequest} from "src/interfaces/bounties";
import {slashSplit} from "src/utils/string";
import {BountyPullRequestCanceledEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import {DB_BOUNTY_NOT_FOUND} from "../utils/messages.const";
import {DecodedLog} from "../interfaces/block-sniffer";
import {getBountyFromChain, getNetwork,parseLogWithContext} from "../utils/block-process";
import {sendMessageToTelegramChannels} from "../integrations/telegram";
import {BOUNTY_STATE_CHANGED, PULL_REQUEST_CANCELED} from "../integrations/telegram/messages";

export const name = "getBountyPullRequestCanceledEvents";
export const schedule = "*/11 * * * *";
export const description = "Sync pull-request canceled events";
export const author = "clarkjoao";

async function closePullRequest(bounty: Bounty, pullRequest: PullRequest) {
  const [owner, repo] = slashSplit(bounty?.repository?.githubPath as string);
  await GHService.pullrequestClose(owner, repo, pullRequest?.githubId as string);

  const body = `This pull request was closed ${pullRequest?.githubLogin ? `by @${pullRequest.githubLogin}` : ""}`;
  await GHService.createCommentOnIssue(repo, owner, bounty?.githubId as string, body);
}

export async function action(block: DecodedLog<BountyPullRequestCanceledEvent['returnValues']>, query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};
  const {returnValues: {bountyId, pullRequestId}, connection, address, chainId} = block;

  const bounty = await getBountyFromChain(connection, address, bountyId, name);
  if (!bounty)
    return eventsProcessed;

  const network = await getNetwork(chainId, address);
  if (!network)
    return eventsProcessed;

  const dbBounty = await db.issues.findOne({
    where: {contractId: bounty.id, network_id: network.id}, 
    include: [{association: "repository"}, {association: "network"}]
  });

  if (!dbBounty) {
    logger.warn(DB_BOUNTY_NOT_FOUND(name, bounty.cid, network.id))
    return eventsProcessed;
  }

  const pullRequest = bounty.pullRequests[pullRequestId];

  const dbPullRequest = await db.pull_requests.findOne({
    where: {
      issueId: dbBounty.id,
      githubId: pullRequest.cid.toString(),
      contractId: pullRequest.id,
      network_id: network?.id
    }
  });

  if (!dbPullRequest) {
    logger.warn(`${name} Pull request ${pullRequest.cid} not found in database`, bounty)
    return eventsProcessed;
  }

  await closePullRequest(dbBounty, dbPullRequest);

  dbPullRequest.status = "canceled";
  await dbPullRequest.save();

  if (!["canceled", "closed", "proposal"].includes(dbBounty.state!)) {
    if (bounty.pullRequests.some(({ready, canceled}) => ready && !canceled))
      dbBounty.state = "ready";
    else
      dbBounty.state = "open";

      await dbBounty.save();
      sendMessageToTelegramChannels(BOUNTY_STATE_CHANGED(dbBounty.state, dbBounty));
      sendMessageToTelegramChannels(PULL_REQUEST_CANCELED(dbBounty, dbPullRequest, pullRequestId))
  }

  eventsProcessed[network.name!] = {
    [dbBounty.issueId!.toString()]: {bounty: dbBounty, eventBlock: parseLogWithContext(block)}
  };


  return eventsProcessed;
}

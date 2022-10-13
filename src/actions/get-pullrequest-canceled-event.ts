import db from "src/db";
import logger from "src/utils/logger-handler";
import GHService from "src/services/github";
import {EventsProcessed,EventsQuery,} from "src/interfaces/block-chain-service";
import {Bounty, PullRequest} from "src/interfaces/bounties";
import {slashSplit} from "src/utils/string";
import {BountyPullRequestCanceledEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import {EventService} from "../services/event-service";
import {DB_BOUNTY_NOT_FOUND, NETWORK_BOUNTY_NOT_FOUND} from "../utils/messages.const";
import {BlockProcessor} from "../interfaces/block-processor";
import {Network_v2} from "@taikai/dappkit";

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

export async function action(query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};

  const service = new EventService(name, query);

  const processor: BlockProcessor<BountyPullRequestCanceledEvent> = async (block, network) => {
    const {bountyId, pullRequestId} = block.returnValues;

    const bounty = await (service.Actor as Network_v2).getBounty(bountyId);
    if (!bounty)
      return logger.error(NETWORK_BOUNTY_NOT_FOUND(name, bountyId, network.networkAddress));

    const dbBounty = await db.issues.findOne({
      where: { contractId: bounty.id, network_id: network.id }, include: [{association: "repository"}]});
    if (!dbBounty)
      return logger.error(DB_BOUNTY_NOT_FOUND(name, bounty.cid, network.id))

    const pullRequest = bounty.pullRequests[pullRequestId];

    const dbPullRequest = await db.pull_requests.findOne({
      where:{ issueId: dbBounty.id, githubId: pullRequest.cid.toString(), contractId: pullRequest.id}});

    if (!dbPullRequest)
      return logger.error(`${name} Pull request ${pullRequest.cid} not found in database`, bounty)

    await closePullRequest(dbBounty, dbPullRequest);

    dbPullRequest.status = "canceled";
    await dbPullRequest.save();

    if (bounty.pullRequests.some(({ready, canceled}) => ready && !canceled)) {
      dbBounty.state = "open";
      await dbBounty.save();
    }

    eventsProcessed[network.name] = {...eventsProcessed[network.name], [dbBounty.issueId!.toString()]: {bounty: dbBounty, eventBlock: block}};
  }

  await service._processEvents(processor);


  return eventsProcessed;
}

import { Op } from "sequelize";
import db from "src/db";
import GHService from "src/services/github";
import logger from "src/utils/logger-handler";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service.js";
import { slashSplit } from "src/utils/string";
import {EventService} from "../services/event-service";
import {BountyClosedEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import {DB_BOUNTY_NOT_FOUND, NETWORK_BOUNTY_NOT_FOUND} from "../utils/messages.const";
import {BlockProcessor} from "../interfaces/block-processor";
import {Network_v2} from "@taikai/dappkit";

export const name = "getBountyClosedEvents";
export const schedule = "*/12 * * * *";
export const description = "Move to 'Closed' status the bounty";
export const author = "clarkjoao";

async function mergeProposal(bounty, id, issueId) {
  const pullRequest =
    await db.pull_requests.findOne({where: {id, issueId},});

  if (!pullRequest) return;

  const [owner, repo] = slashSplit(bounty?.repository?.githubPath);

  await GHService.mergeProposal(repo, owner, pullRequest?.githubId as string);
  await GHService.issueClose(repo, owner, bounty?.githubId);

  return pullRequest;
}

async function closePullRequests(bounty, mergedPullRequestId) {
  const pullRequests = await db.pull_requests.findAll({
    where: {
      issueId: bounty.id,
      githubId: { [Op.not]: mergedPullRequestId },
    },
    raw: true,
  });

  const [owner, repo] = slashSplit(bounty?.repository?.githubPath);

  for (const pr of pullRequests) {
    await GHService.pullrequestClose(owner, repo, pr.githubId as string);
  }
}

async function updateUserPayments(proposal, transactionHash, issueId, tokenAmount) {
  return Promise.all(
    proposal.details.map(async (detail) =>
      db.users_payments.create({
        address: detail?.["recipient"],
        ammount:
          Number((detail?.["percentage"] / 100) * +tokenAmount) || 0,
        issueId, transactionHash,})));
}

export async function action(
  query?: EventsQuery
): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};

  try {
    const service = new EventService(name, query);

    const processor: BlockProcessor<BountyClosedEvent> = async (block, network) => {
      const {id, proposalId} = block.returnValues as any;

      const bounty = await (service.Actor as Network_v2).getBounty(id);
      if (!bounty)
        return logger.error(NETWORK_BOUNTY_NOT_FOUND(name, id, network.networkAddress));

      const dbBounty = await db.issues.findOne({
        where: {contractId: id, issueId: bounty.cid, network_id: network?.id,},
        include: [
          {association: "token",},
          {association: "repository",},
          {association: "merge_proposals",},
        ],
      });

      if (!dbBounty)
        return logger.error(DB_BOUNTY_NOT_FOUND(name, bounty.cid, network.id))

      const findDBProposal = (prop) => prop.contractId.toString() === proposalId.toString();

      const dbProposal = await dbBounty.merge_proposals.find(findDBProposal);

      if (!dbProposal)
        logger.warn(`proposal ${proposalId} was not found in database for bounty ${dbBounty.id}`);
      else {
        const mergedPR = await mergeProposal(dbBounty, dbProposal.id, dbProposal.issueId);
        if (mergedPR)
          await closePullRequests(dbBounty, mergedPR.githubId);
      }

      dbBounty.merged = dbProposal?.scMergeId;
      dbBounty.state = "closed";
      await dbBounty.save();

      const proposal = bounty.proposals.find(prop => prop.id === proposalId);

      await updateUserPayments(proposal, block.transactionHash, dbBounty.id, bounty.tokenAmount);

      eventsProcessed[network.name] = {...eventsProcessed[network.name], [dbBounty.issueId!.toString()]: {bounty: dbBounty, eventBlock: block}};
    }

    await service._processEvents(processor);

  } catch (err) {
    logger.error(`${name} Error`, err);
  }

  return eventsProcessed;
}

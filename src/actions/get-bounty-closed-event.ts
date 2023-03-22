import {Op} from "sequelize";
import db from "src/db";
import GHService from "src/services/github";
import logger from "src/utils/logger-handler";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {slashSplit} from "src/utils/string";
import {EventService} from "../services/event-service";
import {BountyClosedEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import {DB_BOUNTY_NOT_FOUND, NETWORK_BOUNTY_NOT_FOUND} from "../utils/messages.const";
import {BlockProcessor} from "../interfaces/block-processor";
import {Network_v2} from "@taikai/dappkit";
import {updateCuratorProposalParams} from "src/modules/handle-curators";
import {updateLeaderboardBounties, updateLeaderboardProposals} from "src/modules/leaderboard";
import {sendMessageToTelegramChannels} from "../integrations/telegram";
import {BOUNTY_CLOSED} from "../integrations/telegram/messages";

export const name = "getBountyClosedEvents";
export const schedule = "*/12 * * * *";
export const description = "Move to 'Closed' status the bounty";
export const author = "clarkjoao";

async function mergeProposal(bounty, id, issueId, network_id) {
  const pullRequest =
    await db.pull_requests.findOne({where: {id, issueId, network_id},});

  if (!pullRequest) {
    logger.debug(`mergeProposal() has no pullRequest on database`);
    return;
  }

  const [owner, repo] = slashSplit(bounty?.repository?.githubPath);

  await GHService.mergeProposal(repo, owner, pullRequest?.githubId as string);
  await GHService.issueClose(repo, owner, bounty?.githubId);

  pullRequest.status = "merged";
  await pullRequest.save();

  return pullRequest;
}

async function closePullRequests(bounty, mergedPullRequestId, network_id) {
  const pullRequests = await db.pull_requests.findAll({
    where: {
      issueId: bounty.id,
      githubId: { [Op.not]: mergedPullRequestId },
      network_id
    }
  });

  const [owner, repo] = slashSplit(bounty?.repository?.githubPath);

  for (const pr of pullRequests) {
    await GHService.pullrequestClose(owner, repo, pr.githubId as string);
    pr.status = "closed";
    await pr.save();
  }
}

async function updateUserPayments(proposal, transactionHash, issueId, tokenAmount) {
  return Promise.all(
    proposal.details.map(async (detail) => {
      const payment = {
        address: detail?.["recipient"],
        ammount:
          Number((detail?.["percentage"] / 100) * +tokenAmount) || 0,
        issueId,
        transactionHash,
      }
      return db.users_payments.findOrCreate({
        where: payment,
        defaults: payment
       })
    }))
}

async function updateCuratorProposal(address: string, networkId: number) {
  const curator = await db.curators.findOne({ where: { address, networkId }})
  if (curator) return await updateCuratorProposalParams(curator, "acceptedProposals", "add")
}

export async function action(
  query?: EventsQuery
): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};
  const service = new EventService(name, query);

  const processor: BlockProcessor<BountyClosedEvent> = async (block, network) => {
    const {id, proposalId} = block.returnValues as any;

    const networkActor = service.Actor as Network_v2;

    const bounty = await networkActor.getBounty(id);
    if (!bounty)
      return logger.warn(NETWORK_BOUNTY_NOT_FOUND(name, id, network.networkAddress));

    const dbBounty = await db.issues.findOne({
      where: {contractId: id, issueId: bounty.cid, network_id: network?.id,},
      include: [
        {association: "repository",},
        {association: "merge_proposals",},
        {association: "pull_requests",},
        {association: "network"},
      ],
    });

    if (!dbBounty)
      return logger.warn(DB_BOUNTY_NOT_FOUND(name, bounty.cid, network.id))

    const dbProposal = await db.merge_proposals.findOne({where: {issueId: dbBounty.id, contractId: proposalId, network_id: network?.id}});

    if (!dbProposal)
      return logger.warn(`proposal ${proposalId} was not found in database for dbBounty ${dbBounty.id}`);
    else {
      try {
        const mergedPR = await mergeProposal(dbBounty, dbProposal.pullRequestId, dbProposal.issueId, network?.id);
        if (mergedPR)
          await closePullRequests(dbBounty, mergedPR.githubId, network?.id);

      } catch (error) {
        logger.error(`${name} proposal ${proposalId} was not is not mergeable`, error?.toString());
      }
    }

    dbBounty.merged = dbProposal?.contractId as any;
    dbBounty.state = "closed";
    await dbBounty.save();

    sendMessageToTelegramChannels(BOUNTY_CLOSED(dbBounty, dbProposal, proposalId));

    await updateUserPayments(bounty.proposals[+proposalId], block.transactionHash, dbBounty.id, bounty.tokenAmount);

    await updateCuratorProposal(bounty.proposals[+proposalId].creator, network?.id)

    await updateLeaderboardBounties("closed");
    await updateLeaderboardProposals("accepted");

    eventsProcessed[network.name] = {...eventsProcessed[network.name], [dbBounty.issueId!.toString()]: {bounty: dbBounty, eventBlock: block}};
  }

  await service._processEvents(processor);

  return eventsProcessed;
}

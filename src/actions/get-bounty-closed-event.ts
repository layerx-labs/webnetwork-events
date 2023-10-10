import db from "src/db";
import logger from "src/utils/logger-handler";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {DB_BOUNTY_NOT_FOUND, NETWORK_NOT_FOUND} from "../utils/messages.const";
import {updateCuratorProposalParams} from "src/modules/handle-curators";
import {updateLeaderboardBounties, updateLeaderboardNfts, updateLeaderboardProposals} from "src/modules/leaderboard";
import {DecodedLog} from "../interfaces/block-sniffer";
import {getBountyFromChain, getNetwork, parseLogWithContext} from "../utils/block-process";
import {sendMessageToTelegramChannels} from "../integrations/telegram";
import {BOUNTY_CLOSED} from "../integrations/telegram/messages";
import {updateBountiesHeader} from "src/modules/handle-header-information";
import {Push} from "../services/analytics/push";
import {AnalyticEventName} from "../services/analytics/types/events";
import updateSeoCardBounty from "src/modules/handle-seo-card";

export const name = "getBountyClosedEvents";
export const schedule = "*/12 * * * *";
export const description = "Move to 'Closed' status the bounty";
export const author = "clarkjoao";

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
  const curator = await db.curators.findOne({where: {address, networkId}})
  if (curator) return await updateCuratorProposalParams(curator, "acceptedProposals", "add")
}

export async function action(block: DecodedLog, query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};
  const {returnValues: {id, proposalId}, connection, address, chainId} = block;

  const bounty = await getBountyFromChain(connection, address, id, name);
  if (!bounty)
    return eventsProcessed;

  const network = await getNetwork(chainId, address);
  if (!network) {
    logger.warn(NETWORK_NOT_FOUND(name, address))
    return eventsProcessed;
  }

  const dbBounty = await db.issues.findOne({
    where: {contractId: id, network_id: network?.id,},
    include: [
      {association: "merge_proposals"},
      {association: "network"},
    ],
  });

  if (!dbBounty) {
    logger.warn(DB_BOUNTY_NOT_FOUND(name, bounty.cid, network.id))
    return eventsProcessed;
  }

  const dbProposal = await db.merge_proposals.findOne({
    where: {
      issueId: dbBounty.id,
      contractId: proposalId,
      network_id: network?.id
    }
  });

  if (!dbProposal) {
    logger.warn(`proposal ${proposalId} was not found in database for dbBounty ${dbBounty.id}`);
    return eventsProcessed;
  }

  const deliverable = await db.deliverables.findOne({ where: { id: dbProposal.deliverableId }});
  if (!deliverable) {
    logger.debug(`mergeProposal() has no deliverable on database`);
    return eventsProcessed;
  }

  deliverable.accepted = true;
  await deliverable.save();

  dbBounty.merged = dbProposal?.contractId as any;
  dbBounty.state = "closed";
  await dbBounty.save();

  sendMessageToTelegramChannels(BOUNTY_CLOSED(dbBounty, dbProposal, proposalId));

  await updateUserPayments(bounty.proposals[+proposalId], block.transactionHash, dbBounty.id, bounty.tokenAmount);
  await updateCuratorProposal(bounty.proposals[+proposalId].creator, network?.id)
  updateLeaderboardNfts()
  updateLeaderboardBounties("closed");
  updateLeaderboardProposals("accepted");
  updateBountiesHeader();
  updateSeoCardBounty(dbBounty.id, name);


  eventsProcessed[network.name!] = {
    [dbBounty.id!.toString()]: {bounty: dbBounty, eventBlock: parseLogWithContext(block)}
  };

  const {tokenAmount, fundingAmount, rewardAmount, rewardToken, transactional} = bounty;

  Push.event(AnalyticEventName.BOUNTY_CLOSED, {
    chainId, network: {name: network.name, id: network.id},
    tokenAmount, fundingAmount, rewardAmount, rewardToken, transactional,
    currency: dbBounty.transactionalToken?.symbol,
    reward: dbBounty.rewardToken?.symbol,
    creator: block.returnValues.creator,
    username: dbBounty.user?.githubLogin,
    actor: address
  })

  return eventsProcessed;
}

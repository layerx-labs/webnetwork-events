import db from "src/db";
import logger from "src/utils/logger-handler";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {BountyProposalCreatedEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import {validateProposal} from "../modules/proposal-validate-state";
import BigNumber from "bignumber.js";
import {updateLeaderboardProposals} from "src/modules/leaderboard";
import {DecodedLog} from "../interfaces/block-sniffer";
import {getBountyFromChain, getNetwork, parseLogWithContext} from "../utils/block-process";
import {sendMessageToTelegramChannels} from "../integrations/telegram";
import {BOUNTY_STATE_CHANGED} from "../integrations/telegram/messages";
import {NETWORK_NOT_FOUND} from "../utils/messages.const";
import {Push} from "../services/analytics/push";
import {AnalyticEventName} from "../services/analytics/types/events";
import updateSeoCardBounty from "src/modules/handle-seo-card";

export const name = "getBountyProposalCreatedEvents";
export const schedule = "*/13 * * * *";
export const description = "Sync proposal created events";
export const author = "clarkjoao";

export async function action(block: DecodedLog<BountyProposalCreatedEvent['returnValues']>, query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};
  const {returnValues: {bountyId, prId, proposalId}, connection, address, chainId} = block;

  const bounty = await getBountyFromChain(connection, address, bountyId, name);
  if (!bounty)
    return eventsProcessed;

  const network = await getNetwork(chainId, address);
  if (!network) {
    logger.warn(NETWORK_NOT_FOUND(name, address))
    return eventsProcessed;
  }

  const values = await validateProposal(bounty, prId, proposalId, network.id, false);
  if (!values?.proposal || !values?.dbBounty || !values?.dbDeliverable)
    return eventsProcessed;

  const {proposal, dbBounty, dbUser, dbDeliverable} = values;

  const dbIssue = await db.issues.findOne({where: {contractId: bounty.id, network_id: network.id}});
  if (!dbIssue) {
    logger.warn(`${name} Issue ${bounty.cid} not found`);
    return eventsProcessed;
  }


  const dbProposal = await db.merge_proposals.findOne({
    where: {
      contractId: proposal.id,
      issueId: dbIssue?.id,
      network_id: network?.id
    }
  });

  if (dbProposal) {
    logger.warn(`${name} Proposal with id ${proposalId} was already parsed`);
    return eventsProcessed;
  }

  const createProposal = await db.merge_proposals.create({
    refusedByBountyOwner: proposal.refusedByBountyOwner,
    disputeWeight: new BigNumber(proposal.disputeWeight).toFixed(),
    contractCreationDate: proposal.creationDate.toString(),
    issueId: dbBounty.id,
    deliverableId: dbDeliverable.id,
    handle: dbUser?.handle,
    creator: proposal.creator,
    isDisputed: false,
    contractId: proposal.id,
    network_id: network?.id
  });

  if (createProposal) {
    await Promise.all(proposal.details.map(async (detail) =>
      db.proposal_distributions.create({
        recipient: detail.recipient,
        percentage: detail.percentage,
        proposalId: createProposal.id,
      })
    ))
  }

  if (!["canceled", "closed", "proposal"].includes(dbBounty.state!)) {
    dbBounty.state = "proposal";
    await dbBounty.save();
    sendMessageToTelegramChannels(BOUNTY_STATE_CHANGED(dbBounty.state, dbBounty));
  }

  updateLeaderboardProposals();
  updateSeoCardBounty(dbBounty.id, name);

  eventsProcessed[network.name!] = {
    [dbBounty.id!.toString()]: {bounty: dbBounty, eventBlock: parseLogWithContext(block)}
  };

  const AnalyticEvent = {
    name: AnalyticEventName.MERGE_PROPOSAL_OPEN,
    params: {
      chainId, network: {name: network.name, id: network.id},
      bountyId: dbBounty.id, bountyContractId: dbBounty.contractId,
      deliverableId: dbDeliverable.id, deliverableContractId: dbDeliverable.prContractId,
      proposalId: createProposal.id, proposalContractId: createProposal.contractId,
      actor: proposal.creator
    }
  }

  const NotificationEvent = {
    name: AnalyticEventName.NOTIF_PROPOSAL_OPEN,
    params: {
      creator: {
        address: createProposal.creator,
        username: createProposal.handle,
      },
      task: {
        id: dbDeliverable.bountyId,
        title: dbBounty.title,
      },
      deliverable: {
        title: dbDeliverable.title,
        id: dbDeliverable.id,
        updatedAt: dbDeliverable.updatedAt
      },
      proposal: {
        id: createProposal.id,
        distributions: createProposal.proposal_distributions.values()
      }
    }
  }

  Push.events([AnalyticEvent, NotificationEvent])


  return eventsProcessed;
}

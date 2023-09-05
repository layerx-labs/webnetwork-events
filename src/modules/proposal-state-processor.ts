import {Network_v2} from "@taikai/dappkit";
import {BountyProposalDisputedEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import logger from "../utils/logger-handler";
import validateProposalState, {validateProposal} from "./proposal-validate-state";
import {name} from "../actions/get-bounty-funded-updated-event";
import db from "src/db";
import BigNumber from "bignumber.js";
import {getBountyFromChain, getNetwork, parseLogWithContext} from "../utils/block-process";
import {DecodedLog} from "../interfaces/block-sniffer";
import {sendMessageToTelegramChannels} from "../integrations/telegram";
import {PROPOSAL_DISPUTED, PROPOSAL_DISPUTED_COMPLETE} from "../integrations/telegram/messages";

export async function proposalStateProcessor(block: DecodedLog<BountyProposalDisputedEvent['returnValues']>, eventsProcessed, isProposalRequired = true) {
  const {returnValues: {bountyId, prId, proposalId}, connection, address, chainId} = block;

  logger.debug(`proposalStateProcessor(${[bountyId, prId, proposalId].join(', ')})`);

  const bounty = await getBountyFromChain(connection, address, bountyId, name);
  if (!bounty)
    return;

  const network = await getNetwork(chainId, address);
  if (!network)
    return;

  const values = await validateProposal(bounty, prId, proposalId, network.id, isProposalRequired);
  if (!values?.dbBounty)
    return;

  const {dbBounty, proposal} = values;

  const dbProposal = await db.merge_proposals.findOne({
    where: {
      contractId: proposal.id,
      issueId: dbBounty?.id,
      network_id: network?.id
    }
  });

  if (!dbProposal) return logger.warn(`${name} Proposal ${proposal.id} not found on database`);

  const Actor = new Network_v2(connection, address);

  await Actor.loadContract();

  const oldWeight = dbProposal.disputeWeight || 0;
  const isDisputed = await Actor.isProposalDisputed(bountyId, proposal.id);
  
  dbProposal.isDisputed = isDisputed;
  dbProposal.disputeWeight = new BigNumber(proposal.disputeWeight).toFixed()
  dbProposal.refusedByBountyOwner = proposal.refusedByBountyOwner

  await dbProposal.save()

  if (!["canceled", "closed"].includes(dbBounty.state!))
    dbBounty.state =
      await validateProposalState(dbBounty.state!, bounty, Actor);

  await dbBounty.save();

  if (!isDisputed)
    sendMessageToTelegramChannels(PROPOSAL_DISPUTED((+dbProposal.disputeWeight - +oldWeight).toString(), dbProposal.disputeWeight, dbBounty, dbProposal, proposalId,))
  else
    sendMessageToTelegramChannels(PROPOSAL_DISPUTED_COMPLETE(dbBounty, dbProposal, proposalId));

  eventsProcessed[network.name!] = {
    ...eventsProcessed[network.name!],
    [dbBounty.id!.toString()]: {bounty: dbBounty, eventBlock: parseLogWithContext(block)}
  };

  return eventsProcessed;
}
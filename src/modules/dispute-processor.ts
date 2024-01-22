import {Network_v2} from "@taikai/dappkit";
import {BountyProposalDisputedEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import BigNumber from "bignumber.js";
import db from "src/db";
import {NETWORK_BOUNTY_NOT_FOUND} from "src/utils/messages.const";
import {updateCuratorProposalParams} from "./handle-curators";
import {validateProposal} from "./proposal-validate-state";
import logger from "src/utils/logger-handler";
import {DecodedLog} from "../interfaces/block-sniffer";
import {getNetwork} from "../utils/block-process";
import {Push} from "../services/analytics/push";
import {AnalyticEventName} from "../services/analytics/types/events";

export async function disputeProcessor(block: DecodedLog<BountyProposalDisputedEvent['returnValues']>, isProposalRequired = true) {
  const {returnValues: {bountyId, prId, proposalId}, connection, address, chainId} = block;

  logger.debug(`disputeProcessor(${[bountyId, prId, proposalId].join(', ')})`);

  const Actor = new Network_v2(connection, address);

  await Actor.loadContract();

  const {from: actorAddress} = await connection.eth.getTransaction(block.transactionHash);

  const bounty = await Actor.getBounty(bountyId);

  const network = await getNetwork(chainId, address);
  if (!network)
    return;

  if (!bounty)
    return logger.warn(NETWORK_BOUNTY_NOT_FOUND('disputeProcessor', bountyId, network.networkAddress));

  const values = await validateProposal(bounty, prId, proposalId, network.id, isProposalRequired);

  const actorTotalVotes = BigNumber(await Actor.getOraclesOf(actorAddress));

  if (values?.dbBounty && values?.dbProposal && actorAddress && actorTotalVotes.gt(0)) {
    const {dbBounty, dbProposal} = values

    const dbDispute = await db.disputes.findOne({
      where: {address: actorAddress, issueId: dbBounty.id, proposalId: dbProposal.id}
    })

    if (!dbDispute) {
      await db.disputes.create({
        address: actorAddress,
        issueId: dbBounty.id,
        proposalId: dbProposal.id,
        weight: actorTotalVotes.toFixed()
      })
    } else await dbDispute.update({weight: actorTotalVotes.toFixed()})

    const isDisputed = await Actor.isProposalDisputed(bounty.id, proposalId)

    if (isDisputed) {
      const curator = await db.curators.findOne({
        where: {
          address: bounty.proposals[proposalId].creator,
          networkId: dbProposal.network_id,
        },
      });

      if (curator)
        await updateCuratorProposalParams(curator, "disputedProposals", "add");

      const AnalyticalEvent = {
        name: AnalyticEventName.MERGE_PROPOSAL_DISPUTED,
        params: {
          chainId, network: {name: network.name, id: network.id},
          bountyId: dbBounty.id, bountyContractId: dbBounty.contractId,
          deliverableId: dbProposal.deliverableId, deliverableContractId: bounty.proposals[proposalId].prId,
          proposalId: dbProposal.id, proposalContractId: dbProposal.contractId,
          actor: actorAddress,
        }
      };

      const NotificationEvent = {
        name: AnalyticEventName.NOTIF_PROPOSAL_DISPUTED,
        params: {
          creator: {
            address: actorAddress,
          },
          notification: {
            id: dbProposal.id,
            title: `Proposal #${dbProposal.id} on task #${dbBounty.id} has been disputed `,
            network: dbBounty.network.name,
            link: `${dbBounty.network.name}/${dbBounty.chain.chainShortName}/task/${dbBounty.id}/proposal/${dbProposal.id}`
          }
        }
      }

      Push.events([AnalyticalEvent, NotificationEvent]);

    }
  }
}
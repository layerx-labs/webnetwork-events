import { Network_v2, Web3Connection } from "@taikai/dappkit";
import { BountyProposalDisputedEvent } from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import BigNumber from "bignumber.js";
import db from "src/db";
import { Block } from "src/interfaces/block-processor";
import { EventService } from "src/services/event-service";
import { NETWORK_BOUNTY_NOT_FOUND } from "src/utils/messages.const";
import { updateCuratorProposalParams } from "./handle-curators";
import { validateProposal } from "./proposal-validate-state";
import logger from "src/utils/logger-handler";

export async function disputeProcessor(block: Block & BountyProposalDisputedEvent, network, _service, isProposalRequired = true) {
    const {bountyId, prId, proposalId,} = block.returnValues;
  
    const { from: actorAddress } = await ((_service as EventService).web3Connection as Web3Connection).Web3.eth.getTransaction(block.transactionHash)
  
    const bounty = await ((_service as EventService).Actor as Network_v2).getBounty(bountyId);
  
    if (!bounty)
      return logger.error(NETWORK_BOUNTY_NOT_FOUND('dispute-processor', bountyId, network.networkAddress));
  
    const values = await validateProposal(bounty, prId, proposalId, network.id, isProposalRequired);
  
    const actorTotalVotes = BigNumber(await ((_service as EventService).Actor as Network_v2).getOraclesOf(actorAddress));
  
    if (values?.dbBounty  && values?.dbProposal && actorAddress && actorTotalVotes.gt(0)){
      const {dbBounty, dbProposal} = values
  
      const dbDispute = await db.disputes.findOne({ 
        where: { address: actorAddress, issueId: dbBounty.id, proposalId: dbProposal.id  }})
    
      if(!dbDispute){
        await db.disputes.create({
          address: actorAddress,
          issueId: dbBounty.id, 
          proposalId: dbProposal.id,
          weight: actorTotalVotes.toFixed()
        })
  
        const isDisputed = await ((_service as EventService).Actor as Network_v2).isProposalDisputed(bounty.id, proposalId)
  
        if(isDisputed) {
          const curator = await db.curators.findOne({ where: { address: bounty.proposals[proposalId].creator }})
          if(curator) updateCuratorProposalParams(curator, "disputedProposals")
        } 
      }
    }
  }
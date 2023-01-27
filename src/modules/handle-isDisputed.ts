import { Network_v2 } from "@taikai/dappkit";
import { Op } from "sequelize";
import db from "src/db";
import logger from "src/utils/logger-handler";
import { updateCuratorProposalParams } from "./handle-curators";

async function updateCuratorProposal(address: string, networkId: number, type: "add" | "remove") {
  const curator = await db.curators.findOne({ where: { address, networkId }})
  if(curator) return await updateCuratorProposalParams(curator, "disputedProposals", type)
}

export async function handleIsDisputed(
  eventName: string,
  networkV2: Network_v2,
  network_id: number
) {
    const proposals = await db.merge_proposals.findAll({
      where: {
        network_id,
        refusedByBountyOwner: false
      },
      include: [
        {
          association: "issue",
          required: true,
          where: {
            state: {
              [Op.not]: "closed",
            },
          },
        },
      ],
    });

    return Promise.all(proposals
      .filter((p) => (!p.issue.merged))
      .map(async (proposal) => {
        try {
          if(proposal.issue.contractId && proposal.contractId){
            const isDisputed = await networkV2.isProposalDisputed(proposal.issue.contractId, proposal.contractId)

            if(proposal.isDisputed && !isDisputed && proposal.creator && proposal.network_id){
              updateCuratorProposal(proposal.creator, proposal.network_id, 'remove')
            }

            if(!proposal.isDisputed && isDisputed && proposal.creator && proposal.network_id){
              updateCuratorProposal(proposal.creator, proposal.network_id, 'add')
            }

            proposal.isDisputed = isDisputed
            proposal.save()
            return proposal.id
          }
        } catch (e) {
          logger.warn(`${eventName} Failed to update isDispute on proposal in database with network_id: ${network_id}.`, e);
          return;
        }
      }))
}

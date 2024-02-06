import generateBountyCards from "./generate-bounty-cards";
import ipfsService from "src/services/ipfs-service";
import logger from "src/utils/logger-handler";
import db from "src/db";
import { getDeveloperAmount } from "./calculate-distributed-amounts";

export default async function updateSeoCardBounty(bountyId: number, action: string) {
  try {
    const include = [
      {association: "developers"},
      {association: "merge_proposals"},
      {association: "deliverables"},
      {association: "network"},
      {association: "transactionalToken"},
    ];

    const dbBounty = await db.issues.findOne({
      where: {id: bountyId},
      include
    })

    if(dbBounty){
      const chain = await db.chains.findOne({ 
          where: {
          chainId: dbBounty.chain_id
        }
      });

      const workerAmount = await getDeveloperAmount(dbBounty, chain?.privateChainRpc!);
      dbBounty.amount = workerAmount;
      const card = await generateBountyCards({
        issue: dbBounty
      });

      const { hash } = await ipfsService.add(card);
      if (!hash) {
        logger.warn(`${action} Failed to get hash from IPFS for ${dbBounty.id}`);
      }

      await dbBounty.update({ seoImage: hash });

      logger.debug(`${action} - updateSeoCardBounty: Updated - bountyId: ${dbBounty.id}`);
    } else logger.debug(`${action} - updateSeoCardBounty: Error bounty not found `);
  } catch (error: any) {
    logger.error(`${action} - updateSeoCardBounty: Error update card for ${bountyId}`, error);
  }
}

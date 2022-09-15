import { Op } from "sequelize";
import db from "src/db";
import generateCard from "src/modules/generate-bounty-cards";
import BlockChainService from "src/services/block-chain-service";
import ipfsService from "src/services/ipfs-service";
import logger from "src/utils/logger-handler";

export const name = "seo-generate-cards";
export const schedule = "*/15 * * * *"; // Every 15 minutes
export const description = "Try generate SeoCards for all updated or new bounties";
export const author = "clarkjoao";

export async function action(issueId?: string) {
  const bountiesProcessed: any[] = [];

  try {
    logger.info("Starting SEOCards Generate");

    const service = new BlockChainService();
    await service.init(name);

    const where = {
      ... issueId
        ? {issueId}
        : {[Op.or]: [
            {seoImage: null},
            {updatedAt: {[Op.gt]: service?.db?.updatedAt || service?.db?.createdAt || new Date()}}
          ]}
    };

    const include = [
      { association: "developers" },
      { association: "merge_proposals" },
      { association: "pull_requests" },
      { association: "network" },
      { association: "repository" },
      { association: "token" },
    ];

    const bounties = await db.issues.findAll({where, include,});

    if (!bounties.length) {
      logger.info("No bounties to be updated");
      return;
    }

    logger.info(`${bounties.length} bounties to be updated`);

    for (const bounty of bounties) {
      try {
        logger.info(`Creating card to bounty ${bounty.issueId}`);
        const card = await generateCard(bounty);

        const { hash } = await ipfsService.add(card);

        await bounty.update({ seoImage: hash });

        bountiesProcessed.push({ issueId: bounty.issueId, hash });

        logger.info(`Bounty ${bounty.issueId} has been updated`);
      } catch (error) {
        logger.error(`Error bounty ${bounty.issueId}:`, error);
        continue;
      }
    }
  } catch (err) {
    logger.error(`Error ${name}:`, err);
  }

  return bountiesProcessed;
}

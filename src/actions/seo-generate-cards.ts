import { Op } from "sequelize";
import db from "src/db";
import generateCard from "src/modules/generate-bounty-cards";
import BlockChainService from "src/services/block-chain-service";
import ipfsService from "src/services/ipfs-service";
import logger from "src/utils/logger-handler";

export const name = "seo-generate-cards";
export const schedule = "*/10 * * * *";
export const description = "Try generate SeoCards for all updated or new bounties";
export const author = "clarkjoao";

const {IPFS_PROJECT_ID, IPFS_PROJECT_SECRET, IPFS_BASE} = process.env;

export async function action(issueId?: string) {
  const bountiesProcessed: any[] = [];

  if ([IPFS_PROJECT_ID, IPFS_PROJECT_SECRET, IPFS_BASE].some(v => !v)) {
    logger.warn(`Missing id, secret or baseURL, for IPFService`);
    return bountiesProcessed;
  }

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
        if (!hash)
          continue;

        await bounty.update({ seoImage: hash });

        bountiesProcessed.push({ issueId: bounty.issueId, hash });

        logger.info(`Bounty card for ${bounty.issueId} has been updated`);
      } catch (error) {
        logger.error(`Error generating card for ${bounty.issueId}:`, error);
        continue;
      }
    }
  } catch (err) {
    logger.error(`Error ${name}:`, err);
  }

  return bountiesProcessed;
}

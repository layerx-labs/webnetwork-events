import { Op } from "sequelize";
import db from "src/db";
import generateCard from "src/modules/generate-bounty-cards";
import ipfsService from "src/services/ipfs-service";
import logger from "src/utils/logger-handler";

export const name = "seo-generate-cards";
export const schedule = "*/10 * * * *";
export const description = "Try generate SeoCards for all updated or new bounties";
export const author = "clarkjoao";

const {NEXT_IPFS_PROJECT_ID, NEXT_IPFS_PROJECT_SECRET, NEXT_PUBLIC_IPFS_BASE} = process.env;

export async function action(issueId?: string) {
  const bountiesProcessed: any[] = [];

  if ([NEXT_IPFS_PROJECT_ID, NEXT_IPFS_PROJECT_SECRET, NEXT_PUBLIC_IPFS_BASE].some(v => !v)) {
    logger.warn(`${name} Missing id, secret or baseURL, for IPFService`);
    return bountiesProcessed;
  }

  try {
    logger.info(`${name} start`);

    const dbEvent = await db.chain_events.findOne({where: {name}});
    if (!dbEvent)
      logger.warn(`${name} not found on database`);

    const where = {
      ...(issueId
        ? {issueId}
        : {[Op.or]: [
            {seoImage: null},
            {updatedAt: {[Op.gt]: dbEvent?.updatedAt || dbEvent?.createdAt || new Date()}}
          ]})
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
      logger.info(`${name} No bounties to be updated`);
      return;
    }

    logger.info(`${name} ${bounties.length} bounties to be updated`);

    for (const bounty of bounties) {
      try {
        logger.info(`${name} Creating card to bounty ${bounty.issueId}`);
        const card = await generateCard(bounty);

        const { hash } = await ipfsService.add(card);
        if (!hash)
          continue;

        await bounty.update({ seoImage: hash });

        bountiesProcessed.push({ issueId: bounty.issueId, hash });

        logger.info(`${name} Bounty card for ${bounty.issueId} has been updated`);
      } catch (error) {
        logger.error(`${name} Error generating card for ${bounty.issueId}:`, error);
        continue;
      }
    }
  } catch (err) {
    logger.error(`${name} Error`, err);
  }

  return bountiesProcessed;
}

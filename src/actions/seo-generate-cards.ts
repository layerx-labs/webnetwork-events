import { Op } from "sequelize";
import db from "src/db";
import generateCard from "src/modules/generate-bounty-cards";
import BlockChainService from "src/services/block-chain-service";
import ipfsService from "src/services/ipfs-service";
import logger from "src/utils/logger-handler";

export const name = "seo-generate-cards";
export const schedule = "30 * * * * *";
export const description = "generating SEO cards for all updated issues";
export const author = "clarkjoao";

export async function seoGenerateCard(issueId?: string) {
  const bountiesProcessed: any[] = [];
  logger.info("Starting SEO cards generation");

  const service = new BlockChainService();
  await service.init(name);

  let where;
  if (issueId) {
    where = {
      issueId,
    };
  } else {
    const lastUpdated =
      service?.db?.updatedAt || service?.db?.createdAt || new Date();

    where = {
      [Op.or]: [
        { seoImage: null },
        {
          updatedAt: {
            [Op.gt]: lastUpdated,
          },
        },
      ],
    };
  }

  const include = [
    { association: "developers" },
    { association: "merge_proposals" },
    { association: "pull_requests" },
    { association: "network" },
    { association: "repository" },
    { association: "token" },
  ];

  try {
    const bounties = await db.issues.findAll({
      where,
      include,
    });

    logger.info(`Found ${bounties.length} bounties to generate SEO cards`);

    for (const bounty of bounties) {
      const card = await generateCard(bounty);

      const { hash } = await ipfsService.add(card);

      await bounty.update({ seoImage: hash });

      bountiesProcessed.push({ issueId: bounty.issueId, hash });

      logger.info(`SEO card generated for bounty ${bounty.githubId}`);
    }
  } catch (error) {
    logger.error(`Error generating SEO card for bounty:`, error);
  }

  return bountiesProcessed;
}

export const action = seoGenerateCard;
export default action;

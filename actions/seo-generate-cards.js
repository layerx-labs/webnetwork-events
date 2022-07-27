import { subMinutes } from "date-fns";
import { Op } from "sequelize";
import db from "../db/index.js";
import generateCard from "../modules/generate-bounty-cards.js";
import ipfsService from "../services/ipfs-service.js";
import { error, info } from "../utils/logger-handler.js";

export const name = "seo-generate-cards";
export const schedule = "30 * * * * *";
export const description = "generating SEO cards for all updated issues";
export const author = "clarkjoao";

export async function action() {
  info("Starting SEO cards generation");

  const where = {
    [Op.or]: [
      { seoImage: null },
      { updatedAt: { [Op.gte]: subMinutes(+new Date(), 29) } },
    ],
  };

  const include = [
    { association: "developers" },
    { association: "merge_proposals" },
    { association: "pull_requests" },
    { association: "network" },
    { association: "repository" },
    { association: "token" },
  ];

  const bountys = await db.issues.findAll({
    where,
    include,
  });

  info(`Found ${bountys.length} bountys to generate SEO cards`);

  for (const bounty of bountys) {
    try {
      const card = await generateCard(bounty);

      const { path } = await ipfsService.add(card);

      await bounty.update({ seoImage: path });

      info(`SEO card generated for bounty ${bounty.githubId}`);
    } catch (err) {
      error(`Error generating SEO card for bounty ${bounty.githubId}`, err);
    }
  }
}

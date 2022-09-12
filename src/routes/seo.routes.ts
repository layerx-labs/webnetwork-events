import { Router } from "express";
import { action as seoGenerateCard } from "src/actions/seo-generate-cards";
import db from "src/db";

const seoRoutes = Router();

seoRoutes.get("/:issueId", async (req, res) => {
  const { issueId } = req.params;

  const bounty = await db.issues.findOne({
    where: {
      issueId,
    },
  });

  if (!bounty?.seoImage) return res.status(404).json(null);

  return res.status(200).json(bounty?.seoImage);
});

seoRoutes.post("/:issueId", async (req, res) => {
  const { issueId } = req.params;
  const bounties = await seoGenerateCard(issueId as string);

  return res.status(200).json(bounties);
});

export { seoRoutes };

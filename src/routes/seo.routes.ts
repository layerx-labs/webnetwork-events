import { Router } from "express";
import { action as seoGenerateCard } from "src/actions/seo-generate-cards";
import db from "src/db";

const seoRoutes = Router();

seoRoutes.get("/", async (req, res) => {
  const { issueId } = req.query;

  if (!issueId)
    return res.status(400).json({
      message: "Missing IssueId",
    });

  const bounty = await db.issues.findOne({
    where: {
      issueId: issueId as string,
    },
  });

  if (!bounty?.seoImage) return res.status(404).json(null);

  return res.status(200).json(bounty?.seoImage);
});

seoRoutes.post("/", async (req, res) => {
  const { issueId } = req.query;
  const bounties = await seoGenerateCard(issueId as string);

  return res.status(200).json(bounties);
});

export { seoRoutes };

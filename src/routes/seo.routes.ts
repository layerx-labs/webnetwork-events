import { Router } from "express";
import { seoGenerateCard } from "src/actions/seo-generate-cards";

const seoRoutes = Router();

seoRoutes.get("/", async (req, res) => {
  const { issueId } = req.query;
  const bounties = await seoGenerateCard(issueId as string);

  return res.status(200).json(bounties);
});

export { seoRoutes };

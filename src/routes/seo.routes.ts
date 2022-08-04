import { Router } from "express";
import { seoGenerateCard } from "src/actions/seo-generate-cards";

const seoRoutes = Router();

seoRoutes.get("/", async (req, res) => {
  const bounties = await seoGenerateCard();

  return res.status(200).json(bounties);
});

export { seoRoutes };

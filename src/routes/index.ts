import { Router } from "express";
import { bountyRoutes } from "./bounty.routes";
import { oraclesRoutes } from "./oracles.routes";
import { seoRoutes } from "./seo.routes";

const router = Router();

router.use("/bounty", bountyRoutes);
router.use("/oracles", oraclesRoutes);
router.use("/seo", seoRoutes);

router.use("/", (req, res) => {
  return res.status(200).json("Hello World!");
});

export { router };

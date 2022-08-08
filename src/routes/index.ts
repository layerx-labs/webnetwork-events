import { Router } from "express";
import { bountyRoutes } from "./bounty.routes";
import { oraclesRoutes } from "./oracles.routes";
import { pullRequestRoutes } from "./pullrequest.routes";
import { seoRoutes } from "./seo.routes";

const router = Router();

router.use("/bounty", bountyRoutes);
router.use("/oracles", oraclesRoutes);
router.use("/pullrequest", pullRequestRoutes);
router.use("/seo", seoRoutes);

// router.use("/:entity/:event", async (req, res) => {
//   const events = {
//     bounty: {
//       created: async () => {},
//     },
//   };
//   const { entity, event } = req.params;
//   if (events[entity][event])
//     return res.status(404).json({ error: "event not found" });
//   const bountys = await events[entity][event](req?.eventQuery);
//   return res.json(bountys);
// });

router.use("/", async (req, res) => {
  return res.status(200).json("::");
});

export { router };

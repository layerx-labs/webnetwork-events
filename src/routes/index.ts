import { Router } from "express";
import { bountyRoutes } from "./bounty.routes";
import { networkRoutes } from "./network.routes";

const router = Router();

router.use("/bounty", bountyRoutes);
router.use("/network", networkRoutes);

router.use("/", (req, res) => {
  return res.status(200).json("Hello World!");
});

export { router };

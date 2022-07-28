import { Router } from "express";
import { bountyRoutes } from "./bounty.routes";

const router = Router();

router.use("/bounty", bountyRoutes);
router.use("/", (req, res) => {
  return res.status(200).json("Hello World!");
});

export { router };

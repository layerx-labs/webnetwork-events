import { Router } from "express";
import getBountyAmountUpdate from "src/actions/get-bounty-amount-updated-events";
const bountyRoutes = Router();

bountyRoutes.get("/get-bounty-amount-update", async (req, res) => {
  const bountys = await getBountyAmountUpdate();
  return res.status(200).json(bountys);
});

export { bountyRoutes };

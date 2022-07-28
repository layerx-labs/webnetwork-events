import { Router } from "express";
import moveToOpen from "src/actions/network-move-to-open";

const networkRoutes = Router();

networkRoutes.get("/move-to-open", async (req, res) => {
  const bountys = await moveToOpen();
  debugger;
  return res.status(200).json(bountys);
});

export { networkRoutes };

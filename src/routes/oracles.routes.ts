import { Router } from "express";
import { getOraclesChangedEvents } from "src/actions/get-oracles-changed-events";
import eventQuery from "src/middlewares/event-query";

const oraclesRoutes = Router();

oraclesRoutes.get("/change", eventQuery, async (req, res) => {
  const bounties = await getOraclesChangedEvents(req?.eventQuery);

  return res.status(200).json(bounties);
});

export { oraclesRoutes };

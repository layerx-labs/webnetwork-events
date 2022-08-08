import { Router } from "express";
import { getBountyAmountUpdate } from "src/actions/get-bounty-amount-updated-event";
import { getBountyCanceledEvents } from "src/actions/get-bounty-canceled-event";
import { getBountyCreatedEvents } from "src/actions/get-bounty-created-event";
import { getBountyMovedToOpen } from "src/actions/get-bounty-moved-to-open";
import eventQuery from "src/middlewares/event-query";

const bountyRoutes = Router();

// Middleware to validate the query params
bountyRoutes.use(eventQuery);

bountyRoutes.get("/amount-update", async (req, res) => {
  const bounties = await getBountyAmountUpdate(req?.eventQuery);

  return res.status(200).json(bounties);
});

bountyRoutes.get("/created", async (req, res) => {
  const bounties = await getBountyCreatedEvents(req?.eventQuery);

  return res.status(200).json(bounties);
});

bountyRoutes.get("/canceled", async (req, res) => {
  const bounties = await getBountyCanceledEvents(req?.eventQuery);

  return res.status(200).json(bounties);
});

bountyRoutes.get("/moved-to-open", async (req, res) => {
  const bounties = await getBountyMovedToOpen(req?.eventQuery?.networkName);

  return res.status(200).json(bounties);
});

export { bountyRoutes };

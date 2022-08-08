import { Router } from "express";
import { getPullRequestCreated } from "src/actions/get-pullrequest-created-event";
import eventQuery from "src/middlewares/event-query";

const pullRequestRoutes = Router();

// Middleware to validate the query params
pullRequestRoutes.use(eventQuery);

pullRequestRoutes.get("/created", async (req, res) => {
  const bounties = await getPullRequestCreated(req?.eventQuery);

  return res.status(200).json(bounties);
});

export { pullRequestRoutes };

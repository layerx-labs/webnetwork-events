import { Router } from "express";
import { getPullRequestCanceled } from "src/actions/get-pullrequest-canceled-event";
import { getPullRequestCreated } from "src/actions/get-pullrequest-created-event";
import { getPullRequestReadyForReview } from "src/actions/get-pullrequest-ready-for-review";
import eventQuery from "src/middlewares/event-query";

const pullRequestRoutes = Router();

// Middleware to validate the query params
pullRequestRoutes.use(eventQuery);

pullRequestRoutes.get("/created", async (req, res) => {
  const bounties = await getPullRequestCreated(req?.eventQuery);

  return res.status(200).json(bounties);
});

pullRequestRoutes.get("/canceled", async (req, res) => {
  const bounties = await getPullRequestCanceled(req?.eventQuery);

  return res.status(200).json(bounties);
});

pullRequestRoutes.get("/ready-for-review", async (req, res) => {
  const bounties = await getPullRequestReadyForReview(req?.eventQuery);

  return res.status(200).json(bounties);
});

export { pullRequestRoutes };

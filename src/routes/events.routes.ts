import { Router } from "express";
import getBountyAmountUpdate from "src/actions/get-bounty-amount-updated-event";
import getBountyFundedUpdate from "src/actions/get-bounty-funded-updated-event";
import getBountyCanceledEvents from "src/actions/get-bounty-canceled-event";
import getBountyCreatedEvents from "src/actions/get-bounty-created-event";
import getBountyMovedToOpen from "src/actions/get-bounty-moved-to-open";
import getOraclesChangedEvents from "src/actions/get-oracles-changed-events";
import getProposalCreated from "src/actions/get-proposal-created-event";
import getProposalDisputed from "src/actions/get-proposal-disputed-event";
import getProposalRefused from "src/actions/get-proposal-refused-event";
import getPullRequestCanceled from "src/actions/get-pullrequest-canceled-event";
import getPullRequestCreated from "src/actions/get-pullrequest-created-event";
import getPullRequestReadyForReview from "src/actions/get-pullrequest-ready-for-review";
import { BountiesProcessedPerNetwork } from "src/interfaces/block-chain-service";
import twitterTweet from "src/modules/handle-tweet";

import eventQuery from "src/middlewares/event-query";

const eventsRouter = Router();

eventsRouter.use(eventQuery);

const events = {
  bounty: {
    created: getBountyCreatedEvents,
    canceled: getBountyCanceledEvents,
    closed: getBountyCanceledEvents,
    updated: getBountyAmountUpdate,
    funded: getBountyFundedUpdate,
    "moved-to-open": getBountyMovedToOpen,
  },
  oracles: {
    changed: getOraclesChangedEvents,
  },
  proposal: {
    created: getProposalCreated,
    disputed: getProposalDisputed,
    refused: getProposalRefused,
  },
  "pull-request": {
    created: getPullRequestCreated,
    ready: getPullRequestReadyForReview,
    canceled: getPullRequestCanceled,
  },
};

eventsRouter.use("/:entity/:event", async (req, res) => {
  const { entity, event } = req.params;

  if (!events[entity][event])
    return res.status(404).json({ error: "Event not found" });

  const bountiesProcessedPerNetwork: BountiesProcessedPerNetwork[] =
    await events[entity][event](req?.eventQuery);

  /**
   * Only create tweet if the networkName params existis;
   */

  if (bountiesProcessedPerNetwork.length && req.eventQuery?.networkName) {
    const network = bountiesProcessedPerNetwork.find(
      ({ network }) => network.name === req.eventQuery?.networkName
    );

    if (network) {
      const createTweet = network?.bountiesProcessed?.map(
        async ({ bounty }) =>
          bounty &&
          (await twitterTweet({
            entity,
            event,
            bountyId: bounty?.issueId as string,
            networkName: req.eventQuery?.networkName as string,
          }))
      );
      await Promise.all([createTweet]);
    }
  }

  return res.status(200).json(bountiesProcessedPerNetwork);
});

export { eventsRouter };

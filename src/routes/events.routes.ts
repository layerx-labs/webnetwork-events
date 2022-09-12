import { Router } from "express";
import { action as getBountyAmountUpdate } from "src/actions/get-bounty-amount-updated-event";
import { action as getBountyCanceledEvents } from "src/actions/get-bounty-canceled-event";
import { action as getBountyClosedEvents } from "src/actions/get-bounty-closed-event";
import { action as getBountyCreatedEvents } from "src/actions/get-bounty-created-event";
import { action as getBountyFundedUpdate } from "src/actions/get-bounty-funded-updated-event";
import { action as getBountyMovedToOpen } from "src/actions/get-bounty-moved-to-open";
import { action as getChangeAllowedTokens } from "src/actions/get-change-allowed-tokens-events";
import { action as getNetworkCreatedEvents } from "src/actions/get-network-registered-events";
import { action as getOraclesChangedEvents } from "src/actions/get-oracles-changed-events";
import { action as getProposalCreated } from "src/actions/get-proposal-created-event";
import { action as getProposalDisputed } from "src/actions/get-proposal-disputed-event";
import { action as getProposalRefused } from "src/actions/get-proposal-refused-event";
import { action as getPullRequestCanceled } from "src/actions/get-pullrequest-canceled-event";
import { action as getPullRequestCreated } from "src/actions/get-pullrequest-created-event";
import { action as getPullRequestReadyForReview } from "src/actions/get-pullrequest-ready-for-review";
import {
  BountiesProcessed,
  EventsProcessed,
} from "src/interfaces/block-chain-service";

import eventQuery from "src/middlewares/event-query";
import { dispatchTweets } from "src/modules/handle-tweet";
import loggerHandler from "src/utils/logger-handler";

const eventsRouter = Router();

eventsRouter.use(eventQuery);

const events = {
  bounty: {
    created: getBountyCreatedEvents,
    canceled: getBountyCanceledEvents,
    closed: getBountyClosedEvents,
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
  registry: {
    changed: getChangeAllowedTokens,
    registered: getNetworkCreatedEvents,
  },
};

eventsRouter.get("/:entity/:event", async (req, res) => {
  try {
    const { entity, event } = req.params;

    if (!events[entity][event])
      return res.status(404).json({ error: "Event not found" });

    const eventsProcessed: EventsProcessed = await events[entity][event](
      req?.eventQuery
    );

    /**
     * Only create tweet if the networkName params existis;
     */

    const netoworkName = req.eventQuery?.networkName;

    if (netoworkName && eventsProcessed[netoworkName]) {
      await dispatchTweets(
        eventsProcessed[netoworkName] as BountiesProcessed,
        entity,
        event,
        netoworkName
      ).catch((e) => {
        loggerHandler.error(`Error to do a twitter: ${e}`);
      });
    }
    return res.status(200).json(eventsProcessed);
  } catch (error) {
    return res.status(500).json({ error });
  }
});

export { eventsRouter };

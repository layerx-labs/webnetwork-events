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
import { action as getOraclesTransferEvents } from "src/actions/get-oracles-transfer-events";
import { action as getTransferEvents } from "src/actions/get-transfer-bounty-token-events";
import { action as UpdateBountiesToDraft } from 'src/actions/update-bounties-to-draft'
import { action as updateNetworkParameters } from "src/actions/update-network-parameters";

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
    'update-draft-time': UpdateBountiesToDraft
  },
  oracles: {
    changed: getOraclesChangedEvents,
    transfer: getOraclesTransferEvents
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
  bountyToken: {
    transfer: getTransferEvents
  },
  network: {
    "parameters": updateNetworkParameters
  }
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

    const networkName = req.eventQuery?.networkName;

    if (networkName && eventsProcessed[networkName]) {
      await dispatchTweets(
        eventsProcessed[networkName] as BountiesProcessed,
        entity,
        event,
        networkName
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

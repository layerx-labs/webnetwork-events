import type {AnalyticEventPool} from "./types/analytics";

import {analytic} from "./analytic";
import {AnalyticEventName} from "./types/events";
import {AnalyticTypes} from "./types/analytic-types";

export const AnalyticsEvents: AnalyticEventPool = {
  [AnalyticEventName.BOUNTY_CREATED]: [analytic(AnalyticTypes.GA4)],
  [AnalyticEventName.BOUNTY_ACTIVE]: [analytic(AnalyticTypes.GA4)],
  [AnalyticEventName.BOUNTY_CANCELED]: [analytic(AnalyticTypes.GA4)],
  [AnalyticEventName.BOUNTY_CLOSED]: [analytic(AnalyticTypes.GA4)],
  [AnalyticEventName.LOCK_UNLOCK_NETWORK]: [analytic(AnalyticTypes.GA4)],
  [AnalyticEventName.DELEGATE_UNDELEGATE]: [analytic(AnalyticTypes.GA4)],
  [AnalyticEventName.LOCK_UNLOCK_REGISTRY]: [analytic(AnalyticTypes.GA4)],
  [AnalyticEventName.PULL_REQUEST_OPEN]: [analytic(AnalyticTypes.GA4)],
  [AnalyticEventName.PULL_REQUEST_READY]: [analytic(AnalyticTypes.GA4)],
  [AnalyticEventName.PULL_REQUEST_CANCELED]: [analytic(AnalyticTypes.GA4)],
  [AnalyticEventName.PULL_REQUEST_MERGED]: [analytic(AnalyticTypes.GA4)],
  [AnalyticEventName.MERGE_PROPOSAL_OPEN]: [analytic(AnalyticTypes.GA4)],
  [AnalyticEventName.MERGE_PROPOSAL_DISPUTED]: [analytic(AnalyticTypes.GA4)],
  [AnalyticEventName.MERGE_PROPOSAL_READY]: [analytic(AnalyticTypes.GA4)],
  [AnalyticEventName.MERGE_PROPOSAL_ACCEPTED]: [analytic(AnalyticTypes.GA4)],
  [AnalyticEventName.MERGE_PROPOSAL_CANCELLED]: [analytic(AnalyticTypes.GA4)],
  [AnalyticEventName.FUNDING_REQUEST_CREATED]: [analytic(AnalyticTypes.GA4)],
  [AnalyticEventName.BOUNTY_FUNDED]: [analytic(AnalyticTypes.GA4)],
  [AnalyticEventName.BOUNTY_NETWORK_CREATED]: [analytic(AnalyticTypes.GA4)],
  [AnalyticEventName.BOUNTY_NETWORK_UPDATED]: [analytic(AnalyticTypes.GA4)],
  [AnalyticEventName.NFT_MINTED]: [analytic(AnalyticTypes.GA4)],
  [AnalyticEventName.BOUNTY_PAYMENT]: [analytic(AnalyticTypes.GA4)],
  [AnalyticEventName.BOUNTY_NEW_COMMENT]: [analytic(AnalyticTypes.GA4)],
  [AnalyticEventName.REGISTRY_UPDATED]: [analytic(AnalyticTypes.GA4)],
}
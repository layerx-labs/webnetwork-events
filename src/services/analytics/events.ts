import {analytic} from "./analytic";
import {AnalyticEventName} from "./types/events";

export const AnalyticsEvents = {
  [AnalyticEventName.BOUNTY_CREATED]: [analytic("ga4")],
  [AnalyticEventName.BOUNTY_ACTIVE]: [analytic("ga4")],
  [AnalyticEventName.BOUNTY_CANCELED]: [analytic("ga4")],
  [AnalyticEventName.BOUNTY_CLOSED]: [analytic("ga4")],
  [AnalyticEventName.LOCK_UNLOCK_NETWORK]: [analytic("ga4")],
  [AnalyticEventName.DELEGATE_UNDELEGATE]: [analytic("ga4")],
  [AnalyticEventName.LOCK_UNLOCK_REGISTRY]: [analytic("ga4")],
  [AnalyticEventName.PULL_REQUEST_OPEN]: [analytic("ga4")],
  [AnalyticEventName.PULL_REQUEST_READY]: [analytic("ga4")],
  [AnalyticEventName.PULL_REQUEST_CANCELED]: [analytic("ga4")],
  [AnalyticEventName.PULL_REQUEST_MERGED]: [analytic("ga4")],
  [AnalyticEventName.MERGE_PROPOSAL_OPEN]: [analytic("ga4")],
  [AnalyticEventName.MERGE_PROPOSAL_DISPUTED]: [analytic("ga4")],
  [AnalyticEventName.MERGE_PROPOSAL_READY]: [analytic("ga4")],
  [AnalyticEventName.MERGE_PROPOSAL_ACCEPTED]: [analytic("ga4")],
  [AnalyticEventName.MERGE_PROPOSAL_CANCELLED]: [analytic("ga4")],
  [AnalyticEventName.FUNDING_REQUEST_CREATED]: [analytic("ga4")],
  [AnalyticEventName.BOUNTY_FUNDED]: [analytic("ga4")],
  [AnalyticEventName.BOUNTY_NETWORK_CREATED]: [analytic("ga4")],
  [AnalyticEventName.BOUNTY_NETWORK_UPDATED]: [analytic("ga4")],
  [AnalyticEventName.NFT_MINTED]: [analytic("ga4")],
  [AnalyticEventName.BOUNTY_PAYMENT]: [analytic("ga4")],
  [AnalyticEventName.BOUNTY_NEW_COMMENT]: [analytic("ga4")],
  [AnalyticEventName.REGISTRY_UPDATED]: [analytic("ga4")],
}
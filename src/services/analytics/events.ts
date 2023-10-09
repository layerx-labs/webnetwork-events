import type {AnalyticEventPool} from "./types/analytics";

import {analytic} from "./analytic";
import {AnalyticEventName} from "./types/events";
import {AnalyticTypes} from "./types/analytic-types";

export const AnalyticsEvents: AnalyticEventPool = {
  [AnalyticEventName.BOUNTY_CREATED]: [analytic(AnalyticTypes.ElasticSearch)],
  [AnalyticEventName.BOUNTY_ACTIVE]: [analytic(AnalyticTypes.ElasticSearch)],
  [AnalyticEventName.BOUNTY_CANCELED]: [analytic(AnalyticTypes.ElasticSearch)],
  [AnalyticEventName.BOUNTY_CLOSED]: [analytic(AnalyticTypes.ElasticSearch)],
  [AnalyticEventName.LOCK_UNLOCK_NETWORK]: [analytic(AnalyticTypes.ElasticSearch)],
  [AnalyticEventName.DELEGATE_UNDELEGATE]: [analytic(AnalyticTypes.ElasticSearch)],
  [AnalyticEventName.LOCK_UNLOCK_REGISTRY]: [analytic(AnalyticTypes.ElasticSearch)],
  [AnalyticEventName.PULL_REQUEST_OPEN]: [analytic(AnalyticTypes.ElasticSearch)],
  [AnalyticEventName.PULL_REQUEST_READY]: [analytic(AnalyticTypes.ElasticSearch)],
  [AnalyticEventName.PULL_REQUEST_CANCELED]: [analytic(AnalyticTypes.ElasticSearch)],
  [AnalyticEventName.PULL_REQUEST_MERGED]: [analytic(AnalyticTypes.ElasticSearch)],
  [AnalyticEventName.MERGE_PROPOSAL_OPEN]: [analytic(AnalyticTypes.ElasticSearch)],
  [AnalyticEventName.MERGE_PROPOSAL_DISPUTED]: [analytic(AnalyticTypes.ElasticSearch)],
  [AnalyticEventName.MERGE_PROPOSAL_READY]: [analytic(AnalyticTypes.ElasticSearch)],
  [AnalyticEventName.MERGE_PROPOSAL_ACCEPTED]: [analytic(AnalyticTypes.ElasticSearch)],
  [AnalyticEventName.MERGE_PROPOSAL_CANCELLED]: [analytic(AnalyticTypes.ElasticSearch)],
  [AnalyticEventName.FUNDING_REQUEST_CREATED]: [analytic(AnalyticTypes.ElasticSearch)],
  [AnalyticEventName.BOUNTY_FUNDED]: [analytic(AnalyticTypes.ElasticSearch)],
  [AnalyticEventName.BOUNTY_NETWORK_CREATED]: [analytic(AnalyticTypes.ElasticSearch)],
  [AnalyticEventName.BOUNTY_NETWORK_UPDATED]: [analytic(AnalyticTypes.ElasticSearch)],
  [AnalyticEventName.NFT_MINTED]: [analytic(AnalyticTypes.ElasticSearch)],
  [AnalyticEventName.BOUNTY_PAYMENT]: [analytic(AnalyticTypes.ElasticSearch)],
  [AnalyticEventName.BOUNTY_NEW_COMMENT]: [analytic(AnalyticTypes.ElasticSearch)],
  [AnalyticEventName.REGISTRY_UPDATED]: [analytic(AnalyticTypes.ElasticSearch)],
}
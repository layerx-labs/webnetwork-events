import {AnalyticEventName} from "../../../../services/analytics/types/events";

export const Templates: { [k in AnalyticEventName]?: string } = {
  BOUNTY_CREATED: "base-template.hbs",
  BOUNTY_CLOSED: "base-template.hbs",
  FUNDING_REQUEST_CREATED: "base-template.hbs",
  PULL_REQUEST_OPEN: "base-template.hbs",
  PULL_REQUEST_READY: "base-template.hbs",
  MERGE_PROPOSAL_OPEN: "base-template.hbs",
  MERGE_PROPOSAL_DISPUTED: "base-template.hbs",
}
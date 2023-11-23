import {AnalyticEventName} from "../../../../services/analytics/types/events";

export const Templates: { [k in AnalyticEventName]?: string } = {
  BOUNTY_CREATED: "new-task.hbs",
  FUNDING_REQUEST_CREATED: "new-funding-task.hbs",
  PULL_REQUEST_OPEN: "new-deliverable.hbs",
  PULL_REQUEST_READY: "new-deliverable-ready.hbs",
  MERGE_PROPOSAL_OPEN: "ready-for-dispute.hbs",
  MERGE_PROPOSAL_READY: "ready-for-merge.hbs",
}
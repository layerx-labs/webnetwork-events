import {AnalyticEventName} from "../../../../services/analytics/types/events";

export const Templates: { [k in AnalyticEventName]?: string } = {
  BOUNTY_CREATED: "new-task.hbs",
  PULL_REQUEST_OPEN: "new-deliverable.hbs",
  DISPUTE_READY: "ready-for-dispute.hbs",
  MERGE_PROPOSAL_READY: "ready-for-merge.hbs",
}
import {AnalyticEventName} from "../../../../services/analytics/types/events";

export const Templates: { [k in AnalyticEventName]?: string } = {
  NOTIF_TASK_CREATED: "base-template.hbs",
  FUNDING_REQUEST_CREATED: "base-template.hbs",
  NOTIF_DELIVERABLE_CREATED: "base-template.hbs",
  NOTIF_DELIVERABLE_READY: "base-template.hbs",
  NOTIF_PROPOSAL_OPEN: "base-template.hbs",
  NOTIF_PROPOSAL_DISPUTED: "base-template.hbs",
}
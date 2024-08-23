import { format } from "node:util";
import { CollectEventPayloadParams } from "src/services/analytics/types/analytics";
import { AnalyticEventName } from "src/services/analytics/types/events";
import { Templates } from "./index";

export const EmailNotificationSubjects: { [k in keyof typeof Templates]: string } = {
  BOUNTY_CREATED: "%s @ BEPRO | A task has been created!",
  BOUNTY_CLOSED: "%s @ BEPRO | A task has been closed!",
  FUNDING_REQUEST_CREATED: "%s @ BEPRO | A funding request has been created!",
  PULL_REQUEST_OPEN: `%s @ BEPRO | A new deliverable has been created on "%s"!`,
  PULL_REQUEST_READY: `%s @ BEPRO | A deliverable has been marked as ready for review on "%s"!`,
  MERGE_PROPOSAL_OPEN: `%s @ BEPRO | A new proposal was created on "%s"!`,
  MERGE_PROPOSAL_READY: `%s @ BEPRO | A deliverable is ready to be accepted on "%s"!`,
}

export const EmailNotificationBodyTitles: { [k in keyof typeof Templates]: string } = {
  BOUNTY_CREATED: "A task has been created on %s!",
  BOUNTY_CLOSED: "A task has been closed on %s!",
  FUNDING_REQUEST_CREATED: "A funding request has been created on %s!",
  PULL_REQUEST_OPEN: `A new deliverable has been created on "%s"!`,
  PULL_REQUEST_READY: `A deliverable has been marked as ready for review on "%s"!`,
  MERGE_PROPOSAL_OPEN: `A new proposal was created on "%s"!`,
  MERGE_PROPOSAL_READY: `A deliverable is ready to be accepted on "%s"!`,
}

export function getEmailNotificationSubject(type: AnalyticEventName, payload: CollectEventPayloadParams) {
  const marketplace = payload.network.name?.toUpperCase();
  switch(type) {
    case "BOUNTY_CREATED":
    case "BOUNTY_CLOSED":
    case "FUNDING_REQUEST_CREATED":
      return format(EmailNotificationSubjects[type], marketplace);
    default:
      return format(EmailNotificationSubjects[type], marketplace, payload.title);
  }
}

export function getEmailNotificationBodyTitle(type: AnalyticEventName, payload: CollectEventPayloadParams) {
  const marketplace = payload.network.name?.toUpperCase();
  switch(type) {
    case "BOUNTY_CREATED":
    case "BOUNTY_CLOSED":
    case "FUNDING_REQUEST_CREATED":
      return format(EmailNotificationBodyTitles[type], marketplace);
    default:
      return format(EmailNotificationBodyTitles[type], payload.title);
  }
}
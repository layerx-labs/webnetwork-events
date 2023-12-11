import {Templates} from "./index";

export const EmailNotificationSubjects: { [k in keyof typeof Templates]: string } = {
  NOTIF_TASK_CREATED: "A task has been created on %s!",
  FUNDING_REQUEST_CREATED: "New funding request has been created on %s!",
  NOTIF_DELIVERABLE_CREATED: "A new deliverable has been created!",
  NOTIF_PROPOSAL_OPEN: "A new proposal was created!",
  NOTIF_DELIVERABLE_READY: "A deliverable is ready to be accepted!",
}
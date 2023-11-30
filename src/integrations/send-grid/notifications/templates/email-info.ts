import {Templates} from "./index";

export const EmailNotificationSubjects: { [k in keyof typeof Templates]: string } = {
  BOUNTY_CREATED: "A task has been created on %s!",
  FUNDING_REQUEST_CREATED: "New funding request has been created on %s!",
  PULL_REQUEST_OPEN: "A new deliverable has been created!",
  MERGE_PROPOSAL_OPEN: "A new proposal was created!",
  MERGE_PROPOSAL_READY: "A deliverable is ready to be accepted!",
}

export const EmailNotificationPageTitle: { [k in keyof typeof Templates]: string } = {
  BOUNTY_CREATED: "A task has been created on %s!",
  FUNDING_REQUEST_CREATED: "New funding request has been created on %s!",
  PULL_REQUEST_OPEN: "A new deliverable has been created!",
  MERGE_PROPOSAL_OPEN: "A new proposal was created!",
  MERGE_PROPOSAL_READY: "A deliverable is ready to be accepted!",
}
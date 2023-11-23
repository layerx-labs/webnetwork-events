import {Templates} from "./index";

export const EmailNotificationSubjects: { [k in keyof typeof Templates]: string } = {
  BOUNTY_CREATED: "New task available!",
  FUNDING_REQUEST_CREATED: "New funding request!",
  PULL_REQUEST_OPEN: "New deliverable!",
  MERGE_PROPOSAL_OPEN: "Proposal is ready for dispute!",
  MERGE_PROPOSAL_READY: "Deliverable is ready to be accepted!",
}
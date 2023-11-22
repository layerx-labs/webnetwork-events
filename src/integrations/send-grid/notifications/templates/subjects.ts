import {Templates} from "./index";

export const EmailNotificationSubjects: { [k in keyof typeof Templates]: string } = {
  BOUNTY_CREATED: "New task available!",
  PULL_REQUEST_OPEN: "New deliverable!",
  DISPUTE_READY: "Proposal is ready for dispute!",
  MERGE_PROPOSAL_READY: "Deliverable is ready to be accepted",
}
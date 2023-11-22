import {Templates} from "./index";

export const EmailNotificationSubjects: Record<keyof typeof Templates, string> = {
  newTask: "New task available!",
  newFunding: "New funding request available!",
  newDeliverable: "New deliverable!",
  readyForDispute: "Proposal is ready for dispute!",
  readyForMerge: "Deliverable is ready to be accepted",
}
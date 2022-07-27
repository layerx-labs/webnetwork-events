import {
  getBountyPullRequestCanceledEvents,
  getBountyPullRequestCreatedEvents,
  getBountyPullRequestReadyForReviewEvents,
} from "./pullrequest.js";

const events = {
  getBountyPullRequestCreatedEvents,
  getBountyPullRequestReadyForReviewEvents,
  getBountyPullRequestCanceledEvents,
};

export default events;

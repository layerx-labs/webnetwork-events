import {action as NetworkCreated, action as NetworkRegistered} from "../actions/get-network-registered-events";
import {action as ChangeAllowedTokens} from "../actions/get-change-allowed-tokens-events";
import {action as Transfer} from "../actions/get-transfer-bounty-token-events";
import {action as BountyAmountUpdate} from "../actions/get-bounty-amount-updated-event";
import {action as BountyCanceled} from "../actions/get-bounty-canceled-event";
import {action as BountyClosed} from "../actions/get-bounty-closed-event";
import {action as BountyCreated} from "../actions/get-bounty-created-event";
import {action as BountyFundedUpdate} from "../actions/get-bounty-funded-updated-event";
import {action as BountyMovedToOpen} from "../actions/get-bounty-moved-to-open";
import {action as OraclesChanged} from "../actions/get-oracles-changed-events";
import {action as ProposalCreated} from "../actions/get-proposal-created-event";
import {action as ProposalDisputed} from "../actions/get-proposal-disputed-event";
import {action as ProposalRefused} from "../actions/get-proposal-refused-event";
import {action as PullRequestCanceled} from "../actions/get-pullrequest-canceled-event";
import {action as PullRequestCreated} from "../actions/get-pullrequest-created-event";
import {action as PullRequestReadyForReview} from "../actions/get-pullrequest-ready-for-review";
import {action as OraclesTransfer} from "../actions/get-oracles-transfer-events";
import {action as UpdateBountiesToDraft} from "../actions/update-bounties-to-draft";
import {action as DeletePendingNetworks} from "../actions/delete-pending-networks";
import {action as DeletePendingBounties} from "../actions/delete-pending-bounties";
import {action as UpdateNetworkParams} from "../actions/update-network-parameters";

export const REGISTRY_EVENTS = {
  NetworkRegistered,
  ChangeAllowedTokens,
  Transfer
}

export const NETWORK_EVENTS = {
  BountyAmountUpdate, BountyCanceled, BountyClosed, BountyCreated, BountyFundedUpdate,
  NetworkCreated, OraclesChanged, ProposalCreated, ProposalDisputed, ProposalRefused, PullRequestCanceled,
  PullRequestCreated, PullRequestReadyForReview, OraclesTransfer, UpdateBountiesToDraft
}

export const MIDNIGHT_ACTIONS = {
  UpdateBountiesToDraft,
  DeletePendingNetworks,
  DeletePendingBounties,
  UpdateNetworkParams
}

export const MINUTE_ACTIONS = {
  BountyMovedToOpen,
}
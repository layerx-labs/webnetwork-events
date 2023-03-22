import {
  _BOUNTY_AMOUNT_UPDATED,
  _BOUNTY_CLOSED,
  _BOUNTY_FUNDED,
  _BOUNTY_STATE_CHANGED,
  _NEW_BOUNTY,
  _PROPOSAL_CREATED,
  _PROPOSAL_DISPUTED,
  _PROPOSAL_DISPUTED_COMPLETE,
  _PROPOSAL_READY,
  _PULL_REQUEST_CANCELED,
  _PULL_REQUEST_OPEN,
  AMOUNT_AND_SYMBOL,
} from "./message-template";
import {dbBountyProposalUrl, dbBountyPRUrl, dbBountyUrl} from "../../utils/db-bounty-url";
import {issues} from "../../db/models/issues";
import {pull_requests} from "../../db/models/pull_requests";
import {merge_proposals} from "../../db/models/merge_proposals";

const _url = (s) => `${process.env.WEBAPP_URL}${s}`;

const getAmountAndSymbol = (dbBounty: issues) =>
  AMOUNT_AND_SYMBOL({amount: dbBounty.amount, symbol: dbBounty.transactionalToken?.symbol})

export const NEW_BOUNTY_OPEN = (dbBounty: issues) =>
  _NEW_BOUNTY({dbBounty, priceAndCoin: getAmountAndSymbol(dbBounty), url: _url(dbBountyUrl(dbBounty))});

export const BOUNTY_STATE_CHANGED = (newState: string, dbBounty: issues) =>
  _BOUNTY_STATE_CHANGED({newState, url: _url(dbBountyUrl(dbBounty)), dbBounty});

export const BOUNTY_AMOUNT_UPDATED = (newPrice: string | number, dbBounty: issues) =>
  _BOUNTY_AMOUNT_UPDATED({
    newPrice,
    url: _url(dbBountyUrl(dbBounty)),
    priceAndCoin: getAmountAndSymbol(dbBounty),
    dbBounty
  });

export const PULL_REQUEST_OPEN = (dbBounty: issues, pr: pull_requests, prId: string | number) =>
  _PULL_REQUEST_OPEN({url: _url(dbBountyPRUrl(dbBounty, pr, prId)), dbBounty, pr});

export const PULL_REQUEST_CANCELED = (dbBounty: issues, pr: pull_requests, prId: string | number) =>
  _PULL_REQUEST_CANCELED({url: _url(dbBountyPRUrl(dbBounty, pr, prId)), dbBounty, pr});

export const PROPOSAL_CREATED = (dbBounty: issues, proposal: merge_proposals, proposalId) =>
  _PROPOSAL_CREATED({url: _url(dbBountyProposalUrl(dbBounty, proposal, proposalId)), dbBounty, proposal});

export const PROPOSAL_DISPUTED = (value: string, votes: string, dbBounty: issues, proposal: merge_proposals, proposalId: string | number) =>
  _PROPOSAL_DISPUTED({
    url: _url(dbBountyProposalUrl(dbBounty, proposal, proposalId)),
    value,
    votes,
    dbBounty,
    proposal
  });

export const PROPOSAL_DISPUTED_COMPLETE = (dbBounty: issues, proposal: merge_proposals, proposalId: string | number) =>
  _PROPOSAL_DISPUTED_COMPLETE({url: _url(dbBountyProposalUrl(dbBounty, proposal, proposalId)), dbBounty, proposal});

export const PROPOSAL_READY = (dbBounty: issues, proposal: merge_proposals, proposalId: string | number) =>
  _PROPOSAL_READY({url: _url(dbBountyProposalUrl(dbBounty, proposal, proposalId)), dbBounty, proposal});

export const BOUNTY_CLOSED = (dbBounty: issues, proposal: merge_proposals, proposalId: string | number) =>
  _BOUNTY_CLOSED({url: _url(dbBountyProposalUrl(dbBounty, proposal, proposalId)), dbBounty, proposal});

export const BOUNTY_FUNDED = (funded: string, total: string, dbBounty: issues) =>
  _BOUNTY_FUNDED({url: _url(dbBountyUrl(dbBounty)), dbBounty, total, funded});

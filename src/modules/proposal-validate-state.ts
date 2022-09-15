import NetworkService from "src/services/network-service";
import loggerHandler from "../utils/logger-handler";
import {Bounty} from "@taikai/dappkit";
import db from "../db";
import logger from "../utils/logger-handler";
import {DB_BOUNTY_NOT_FOUND} from "../utils/messages.const";
import {Op} from "sequelize";
import {name} from "../actions/get-bounty-funded-updated-event";

async function bountyReadyPRsHasNoInvalidProposals(networkBounty: any,
                                                   networkService: NetworkService): Promise<number> {
  const readyPRsIds = networkBounty.pullRequests.filter((pr) => pr.ready).map((pr) => pr.id);

  if (!readyPRsIds.length)
    return 0;

  const readyPRsWithoutProposals =
    readyPRsIds.filter((pr) => !networkBounty.proposals.find((p) => p.prId === pr));

  if (readyPRsWithoutProposals.length)
    return 3;

  const proposalsWithDisputeState = await Promise.all(
    networkBounty.proposals
      .filter((p) => readyPRsIds.includes(p.prId))
      .map(async (p) => ({
        ...p,
        isDisputed: await networkService.network?.isProposalDisputed(networkBounty.id, p.id),
      }))
  );

  const invalidProposals =
    proposalsWithDisputeState
      .filter((p) => p.isDisputed || p.refusedByBountyOwner);

  if (invalidProposals.length && proposalsWithDisputeState.length === invalidProposals.length)
    return 1;

  return 2;
}

export default async function validateProposalState(currentState: string,
                                                    networkBounty: any,
                                                    networkService: NetworkService): Promise<string> {
  const validation =
    await bountyReadyPRsHasNoInvalidProposals(networkBounty, networkService)
      .catch((error) => {
        loggerHandler.error(`Failed bountyReadyPRsHasNoInvalidProposals`, error);
        return -1;
      });

  return [0,1].includes(validation) ? "open" : [2, 3].includes(validation) ? "ready" : currentState;
}

export async function validateProposal(bounty: Bounty, prId: number, proposalId: number, network_id: number) {
  const dbBounty = await db.issues.findOne({
    where: {contractId: bounty.id, issueId: bounty.cid, network_id}})
  if (!dbBounty)
    return logger.error(DB_BOUNTY_NOT_FOUND('validate-proposal', bounty.cid, network_id));

  const pullRequest = bounty.pullRequests.find(pr => pr.id === prId);
  if (!pullRequest)
    return logger.error(`Could not find prId ${prId} on bounty ${bounty.cid}`, bounty);

  const dbPullRequest = await db.pull_requests.findOne({
    where: {issueId: bounty.id, contractId: pullRequest.id}});
  if (!dbPullRequest)
    return logger.error(`Could not find pullRequest ${pullRequest.id} in database for network ${network_id}`, pullRequest)

  const proposal = bounty.proposals.find(proposal => proposal.id === proposalId);
  if (!proposal)
    return logger.error(`Could not find proposal for ${prId}`, bounty);

  const dbProposal = await db.merge_proposals.findOne({
    where: {pullRequestId: dbPullRequest.id, issueId: dbBounty.id, contractId: proposal.id}})
  if (dbProposal)
    return logger.warn(`Proposal ${proposalId} already exists`, bounty);

  const dbUser = await db.users.findOne({
    where: {address: {[Op.iLike]: proposal.creator.toLowerCase()}}});
  if (!dbUser)
    logger.warn(`User with address ${proposal.creator} was not found in database`);

  return {proposal, dbBounty, dbUser, dbPullRequest, dbProposal};
}
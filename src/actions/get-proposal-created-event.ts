import db from "src/db";
import logger from "src/utils/logger-handler";
import { Op } from "sequelize";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {XEvents} from "@taikai/dappkit";
import {BountyProposalCreatedEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import {EventService} from "../services/event-service";
import {DB_BOUNTY_NOT_FOUND, NETWORK_BOUNTY_NOT_FOUND} from "../utils/messages.const";

export const name = "getBountyProposalCreatedEvents";
export const schedule = "*/10 * * * *"; // Each 10 minutes
export const description = "Sync proposal created events";
export const author = "clarkjoao";

export async function action(
  query?: EventsQuery
): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};

  try {
    const service = new EventService(name, query);

    const processor = async (block: XEvents<BountyProposalCreatedEvent>, network) => {
      const {bountyId, prId, proposalId} = block.returnValues;

      const bounty = await service.chainService.networkService.network.getBounty(bountyId);
      if (!bounty)
        return logger.info(NETWORK_BOUNTY_NOT_FOUND(bountyId, network.networkAddress));

      const dbBounty = await db.issues.findOne({
        where: {contractId: bounty.id, issueId: bounty.cid, network_id: network.id}})
      if (!dbBounty)
        return logger.info(DB_BOUNTY_NOT_FOUND(bounty.cid, network.id));

      const pullRequest = bounty.pullRequests.find(pr => pr.id === prId);
      if (!pullRequest)
        return logger.error(`Could not find prId ${prId} on bounty ${bounty.cid}`, bounty);

      const dbPullRequest = await db.pull_requests.findOne({
        where: {issueId: bounty.id, contractId: pullRequest.id}});
      if (!dbPullRequest)
        return logger.error(`Could not find pullRequest ${pullRequest.id} in database for network ${network.id}`, pullRequest)

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

      await db.merge_proposals.create({
        scMergeId: proposal.id.toString(),
        issueId: dbBounty.id,
        pullRequestId: dbPullRequest.id,
        githubLogin: dbUser?.githubLogin,
        creator: proposal.creator
      });

      if (dbBounty.state !== "proposal") {
        dbBounty.state = "proposal";
        await dbBounty.save();
      }

      eventsProcessed[network.name] = {...eventsProcessed[network.name], [dbBounty.issueId!.toString()]: {bounty: dbBounty, eventBlock: block}};

    }

    await service.processEvents(processor);

  } catch (err) {
    logger.error(`Error ${name}:`, err);
  }
  return eventsProcessed;
}

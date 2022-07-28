import db from "../../db/index.js";
import { error } from "../../utils/logger-handler.js";

async function _bountyReadyPRsHasNoInvalidProposals(bounty) {
  const readyPRsIds = bounty.pullRequests
    .filter((pr) => pr.ready)
    .map((pr) => pr.id);

  if (!readyPRsIds.length) return 0;

  const readyPRsWithoutProposals = readyPRsIds.filter(
    (pr) => !bounty.proposals.find((p) => p.prId === pr)
  );

  if (readyPRsWithoutProposals.length) return 3;

  const proposalsWithDisputeState = await Promise.all(
    bounty.proposals
      .filter((p) => readyPRsIds.includes(p.prId))
      .map(async (p) => ({
        ...p,
        isDisputed: await contract?.network?.isProposalDisputed(
          bounty.id,
          p.id
        ),
      }))
  );

  const invalidProposals = proposalsWithDisputeState.filter(
    (p) => p.isDisputed || p.refusedByBountyOwner
  );

  if (
    invalidProposals.length &&
    proposalsWithDisputeState.length === invalidProposals.length
  )
    return 1;

  return 2;
}

export async function getBountyProposalCreatedEvents(
  events,
  network,
  contract
) {
  const createdProposals = [];

  for (const event of events) {
    const { bountyId, prId, proposalId } = event.returnValues;

    try {
      const networkBounty = await contract?.network?.getBounty(bountyId);

      if (!networkBounty) return error(`Bounty ${bountyId} not found`);

      const networkPullRequest = networkBounty?.pullRequests.find(
        (pr) => +pr.id === +prId
      );

      const networkProposal = networkBounty?.proposals.find(
        (pr) => +pr.id === +proposalId
      );

      const bounty = await db.issues.findOne({
        where: {
          contractId: +networkBounty.id,
          issueId: networkBounty.cid,
          creatorAddress: networkBounty.creator,
          creatorGithub: networkBounty.githubUser,
          network_id: network.id,
        },
      });

      if (!bounty) return error(`Bounty ${bountyId} not found`);

      const pullRequest = await db.pull_requests.findOne({
        where: {
          issueId: bounty.id,
          contractId: +networkPullRequest.id,
          githubId: networkPullRequest.cid.toString(),
        },
      });

      if (!pullRequest) return error(`Pull request ${prId} not found`);

      const proposal = await db.merge_proposals.findOne({
        where: {
          pullRequestId: pullRequest.id,
          issueId: bounty.id,
          contractId: +networkProposal.id,
        },
      });

      if (!proposal) {
        const user = await db.users.findOne({
          where: {
            address: {
              [Op.iLike]: networkProposal.creator.toLowerCase(),
            },
          },
        });

        await db.merge_proposals.create({
          scMergeId: networkProposal.id,
          issueId: bounty.id,
          pullRequestId: pullRequest.id,
          githubLogin: user?.githubLogin,
          contractId: networkProposal.id,
          creator: networkProposal.creator,
        });

        createdProposals.push(networkProposal);

        // TODO: must generate a new tweet for this proposal
      }
    } catch (err) {
      error("Error getBountyProposalCreatedEvents: ", err.message);
    }
  }

  return createdProposals;
}

export async function getBountyProposalDisputedEvents(
  events,
  network,
  contract
) {
  const proposalDisputed = [];

  for (const event of events) {
    const { bountyId, prId, proposalId } = event.returnValues;
    try {
      const networkBounty = await contract?.network?.getBounty(bountyId);

      if (!networkBounty) return error(`Bounty ${bountyId} not found`);

      const networkPullRequest = networkBounty.pullRequests.find(
        (pr) => +pr.id === +prId
      );
      const networkProposal = networkBounty.proposals.find(
        (pr) => +pr.id === +proposalId
      );

      const bounty = await db.issues.findOne({
        where: {
          contractId: +networkBounty.id,
          issueId: networkBounty.cid,
          creatorAddress: networkBounty.creator,
          creatorGithub: networkBounty.githubUser,
          network_id: network.id,
        },
      });

      if (!bounty) return error(`Bounty ${bountyId} not found`);

      const pullRequest = await db.pull_requests.findOne({
        where: {
          issueId: bounty.id,
          contractId: +networkPullRequest.id,
          githubId: networkPullRequest.cid.toString(),
        },
      });

      if (!pullRequest) return error(`Pull request ${prId} not found`);

      const proposal = await db.merge_proposals.findOne({
        where: {
          pullRequestId: pullRequest.id,
          issueId: bounty.id,
          contractId: +networkProposal.id,
        },
      });

      if (proposal) {
        const validation = await _bountyReadyPRsHasNoInvalidProposals(
          networkBounty
        ).catch(() => -1);
        let newState = bounty.state;

        if ([0, 1].includes(validation)) newState = "open";
        if ([2, 3].includes(validation)) newState = "ready";

        if (newState !== bounty.state) {
          bounty.state = newState;
          await bounty.save();
        }
        proposalDisputed.push(networkProposal.id);
      }
    } catch (err) {
      error("Error getBountyProposalDisputedEvents: ", err.message);
    }
  }
}

export async function getBountyProposalRefusedEvents(
  events,
  network,
  contract
) {
  const proposalsRefused = [];

  for (const event of events) {
    const { bountyId, prId, proposalId } = event.returnValues;

    try {
      const networkBounty = await contract?.network?.getBounty(bountyId);

      if (!networkBounty) return error(`Bounty ${bountyId} not found`);

      const networkPullRequest = networkBounty?.pullRequests.find(
        (pr) => +pr.id === +prId
      );
      const networkProposal = networkBounty?.proposals.find(
        (pr) => +pr.id === +proposalId
      );

      const bounty = await db.issues.findOne({
        where: {
          contractId: +networkBounty.id,
          issueId: networkBounty.cid,
          creatorAddress: networkBounty.creator,
          creatorGithub: networkBounty.githubUser,
          network_id: customNetwork.id,
        },
        include: [{ association: "token" }],
      });

      if (!bounty) return error(`Bounty ${bountyId} not found`);

      const pullRequest = await db.pull_requests.findOne({
        where: {
          issueId: bounty.id,
          contractId: +networkPullRequest.id,
          githubId: networkPullRequest.cid.toString(),
        },
      });

      if (!pullRequest) return error(`Pull request ${prId} not found`);

      const proposal = await db.merge_proposals.findOne({
        where: {
          pullRequestId: pullRequest.id,
          issueId: bounty.id,
          contractId: +networkProposal.id,
        },
      });

      if (proposal) {
        const validation = await _bountyReadyPRsHasNoInvalidProposals(
          networkBounty,
          network
        ).catch(() => -1);
        let newState = bounty.state;

        if ([0, 1].includes(validation)) newState = "open";
        if ([2, 3].includes(validation)) newState = "ready";

        if (newState !== bounty.state) {
          bounty.state = newState;
          await bounty.save();
        }

        proposalsRefused.push(networkProposal.id);
      }
    } catch (err) {
      error("Error getBountyProposalRefusedEvents: ", err.message);
    }
  }
}

import "dotenv/config";
import db from "../../db/index.js";
import GHService from "../../services/github/index.js";
import { error } from "../../utils/logger-handler";
import { ghPathSplit } from "../utils/string.js";

const webAppUrl = process.env.WEBAPP_URL || "http://localhost:3000";

export async function getBountyPullRequestCreatedEvents(
  events,
  network,
  contract
) {
  const createdPullRequests = [];

  async function createCommentOnIssue(bounty, pullRequest) {
    const issueLink = `${webAppUrl}/bounty?id=${bounty.githubId}&repoId=${bounty.repository_id}`;
    const body = `@${bounty.creatorGithub}, @${pullRequest.githubLogin} has a solution - [check your bounty](${issueLink})`;
    const [owner, repo] = ghPathSplit(bounty?.repository?.githubPath);
    await GHService.createCommentOnIssue(owner, repo, bounty.githubId, body);
  }

  for (const event of events) {
    const { bountyId, pullRequestId } = event.returnValues;

    try {
      const networkBounty = await contract?.network?.getBounty(bountyId);
      if (!networkBounty) return error(`Bounty ${bountyId} not found`);

      const networkPullRequest = networkBounty?.pullRequests[pullRequestId];

      const bounty = await db.issues.findOne({
        where: {
          issueId: networkBounty.cid,
          contractId: bountyId,
          network_id: network?.id,
        },
        include: [{ association: "repository" }],
      });

      if (!bounty) return error(`Bounty ${bountyId} not found`);

      const pullRequest = await db.pull_requests.findOne({
        where: {
          issueId: bounty.id,
          githubId: networkPullRequest.cid.toString(),
          status: "pending",
        },
      });

      if (!pullRequest) return error(`Pull request ${pullRequestId} not found`);

      pullRequest.status = networkPullRequest.canceled
        ? "canceled"
        : networkPullRequest.ready
        ? "ready"
        : "draft";
      pullRequest.userRepo = networkPullRequest.userRepo;
      pullRequest.userBranch = networkPullRequest.userBranch;
      pullRequest.contractId = +networkPullRequest.id;
      await pullRequest.save();
      await createCommentOnIssue(bounty, pullRequest);
      createdPullRequests.push(pullRequest);
    } catch (err) {
      error(`Error reading pull request created: ${err.message}`);
    }
  }

  return createdPullRequests;
}

export async function getBountyPullRequestReadyForReviewEvents(
  events,
  network,
  contract
) {
  const readyPullRequests = [];

  for (const event of events) {
    const { bountyId, pullRequestId } = event.returnValues;

    try {
      const networkBounty = await contract?.network?.getBounty(bountyId);
      if (!networkBounty) return error(`Bounty ${bountyId} not found`);

      const networkPullRequest = networkBounty?.pullRequests[pullRequestId];

      const bounty = await db.issues.findOne({
        where: {
          issueId: networkBounty.cid,
          contractId: bountyId,
          network_id: network?.id,
        },
      });

      if (!bounty) return error(`Bounty ${bountyId} not found`);

      const pullRequest = await db.pull_requests.findOne({
        where: {
          issueId: bounty.id,
          githubId: networkPullRequest.cid.toString(),
          status: "draft",
        },
      });

      if (!pullRequest) return error(`Pull request ${pullRequestId} not found`);

      pullRequest.status = networkPullRequest.canceled
        ? "canceled"
        : networkPullRequest.ready
        ? "ready"
        : "draft";
      pullRequest.userRepo = networkPullRequest.userRepo;
      pullRequest.userBranch = networkPullRequest.userBranch;
      pullRequest.contractId = +networkPullRequest.id;

      await pullRequest.save();

      bounty.state = "ready";

      await bounty.save();

      readyPullRequests.push(pullRequest);
    } catch (err) {
      error(`Error reading pull request ready: ${err.message}`);
    }
  }

  return readyPullRequests;
}

export async function getBountyPullRequestCanceledEvents(
  events,
  network,
  contract
) {
  const canceledPullRequests = [];

  async function closePullRequest(bounty, pullRequest) {
    const [owner, repo] = ghPathSplit(bounty?.repository?.githubPath);
    await GHService.pullrequestClose(repo, owner, pullRequest?.githubId);

    const body = `This pull request was closed by @${pullRequest?.githubLogin}`;
    await GHService.createCommentOnIssue(
      repo,
      owner,
      pullRequest.githubId,
      body
    );
  }

  for (const event of events) {
    const { bountyId, pullRequestId } = event.returnValues;

    try {
      const networkBounty = await contract?.network?.getBounty(bountyId);
      if (!networkBounty) return error(`Bounty ${bountyId} not found`);

      const networkPullRequest = networkBounty?.pullRequests[pullRequestId];

      const bounty = await db.issues.findOne({
        where: {
          issueId: networkBounty.cid,
          contractId: bountyId,
          network_id: network?.id,
        },
      });

      if (!bounty) return error(`Bounty ${bountyId} not found`);

      const pullRequest = await db.pull_requests.findOne({
        where: {
          issueId: bounty?.id,
          githubId: networkPullRequest?.cid?.toString(),
          contractId: network?.id,
        },
      });

      if (!pullRequest) return error(`Pull request ${pullRequestId} not found`);

      pullRequest.status = "canceled";

      await pullRequest.save();

      await closePullRequest(bounty, pullRequest);

      if (!networkBounty.pullRequests.find((pr) => pr.ready && !pr.canceled)) {
        bounty.state = "open";

        await bounty.save();
      }

      canceledPullRequests.push(pullRequest);
    } catch (err) {
      error(`Error reading pull request canceled: ${err.message}`);
    }
  }

  return canceledPullRequests;
}

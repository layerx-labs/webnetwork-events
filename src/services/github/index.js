import "dotenv/config";
import { Octokit } from "octokit";
import * as CommentsQueries from "./graphql/comments.js";
import * as IssueQueries from "./graphql/issue.js";
import * as PullRequestQueries from "./graphql/pull-request.js";
import * as RepositoryQueries from "./graphql/repository.js";

const { GITHUB_TOKEN: token } = process.env;

const githubAPI = new Octokit({ auth: token }).graphql;

export async function repositoryDetails(repo, owner) {
  return await githubAPI(RepositoryQueries.Details, {
    repo,
    owner,
  });
}

export async function issueDetails(repo, owner, issueId) {
  return await githubAPI(IssueQueries.Details, {
    repo,
    owner,
    issueId: +issueId,
  });
}

export async function issueRemoveLabel(issueId, labelId) {
  await githubAPI(IssueQueries.RemoveLabel, {
    issueId,
    labelId: [labelId],
  });
}

export async function issueClose(repo, owner, issueId) {
  const issue = await issueDetails(repo, owner, issueId);

  if (!issue) throw Error(`Issue ${issueId} not found`);

  const issueGithubId = issue.repository.issue.id;

  return await githubAPI(IssueQueries.Close, {
    issueId: issueGithubId,
  });
}

export async function pullrequestDetails(repo, owner, pullrequestId) {
  return await githubAPI(PullRequestQueries.Details, {
    repo,
    owner,
    id: +pullrequestId,
  });
}

async function pullrequestClose(repo, owner, pullrequestId) {
  const pullrequest = await pullrequestDetails(repo, owner, pullrequestId);

  if (!pullrequest) throw Error(`Pullrequest ${pullrequestId} not found`);

  const pullrequestGithubId = pullrequest.repository.pullRequest.id;

  return await githubAPI(PullRequestQueries.Close, {
    pullRequestId: pullrequestGithubId,
  });
}

export async function mergeProposal(repo, owner, pullRequestId) {
  const pullRequestDetails = await pullrequestDetails(
    repo,
    owner,
    pullRequestId
  );

  if (!pullRequestDetails)
    throw Error(`Pull request ${pullRequestId} not found`);

  const pullRequestGithubId = pullRequestDetails.repository.pullRequest.id;

  return await githubAPI(PullRequestQueries.Merge, {
    pullRequestId: pullRequestGithubId,
  });
}

export async function createCommentOnIssue(repo, owner, issueId, comment) {
  const issue = await issueDetails(repo, owner, issueId);

  if (!issue) throw Error(`Issue ${issueId} not found`);

  const issueGithubId = issue.repository.issue.id;

  return await githubAPI(CommentsQueries.Create, {
    issueOrPullRequestId: issueGithubId,
    body: comment,
  });
}

export default {
  repositoryDetails,
  issueDetails,
  issueClose,
  issueRemoveLabel,
  pullrequestDetails,
  pullrequestClose,
  mergeProposal,
  createCommentOnIssue,
};

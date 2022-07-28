import "dotenv/config";
import { Octokit } from "octokit";
import { GraphQlResponse } from "types/octokit";
import * as CommentsQueries from "./graphql/comments.js";
import * as IssueQueries from "./graphql/issue.js";
import * as PullRequestQueries from "./graphql/pull-request.js";
import * as RepositoryQueries from "./graphql/repository.js";

const { GITHUB_TOKEN: token } = process.env;

const githubAPI = new Octokit({ auth: token }).graphql;

export async function repositoryDetails(repo: string, owner: string) {
  return await githubAPI<GraphQlResponse>(RepositoryQueries.Details, {
    repo,
    owner,
  });
}

export async function issueDetails(
  repo: string,
  owner: string,
  issueId: string
) {
  return await githubAPI<GraphQlResponse>(IssueQueries.Details, {
    repo,
    owner,
    issueId: +issueId,
  });
}

export async function issueRemoveLabel(issueId: string, labelId: string) {
  await githubAPI<GraphQlResponse>(IssueQueries.RemoveLabel, {
    issueId,
    labelId: [labelId],
  });
}

export async function issueClose(repo: string, owner: string, issueId: string) {
  const issue = await issueDetails(repo, owner, issueId);

  if (!issue) throw Error(`Issue ${issueId} not found`);

  const issueGithubId = issue?.repository?.issue?.id;

  return await githubAPI<GraphQlResponse>(IssueQueries.Close, {
    issueId: issueGithubId,
  });
}

export async function pullrequestDetails(
  repo: string,
  owner: string,
  pullrequestId: string
) {
  return await githubAPI<GraphQlResponse>(PullRequestQueries.Details, {
    repo,
    owner,
    id: +pullrequestId,
  });
}

async function pullrequestClose(
  repo: string,
  owner: string,
  pullrequestId: string
) {
  const pullrequest = await pullrequestDetails(repo, owner, pullrequestId);

  if (!pullrequest) throw Error(`Pullrequest ${pullrequestId} not found`);

  const pullrequestGithubId = pullrequest.repository.pullRequest.id;

  return await githubAPI<GraphQlResponse>(PullRequestQueries.Close, {
    pullRequestId: pullrequestGithubId,
  });
}

export async function mergeProposal(
  repo: string,
  owner: string,
  pullRequestId: string
) {
  const pullRequestDetails = await pullrequestDetails(
    repo,
    owner,
    pullRequestId
  );

  if (!pullRequestDetails)
    throw Error(`Pull request ${pullRequestId} not found`);

  const pullRequestGithubId = pullRequestDetails.repository.pullRequest.id;

  return await githubAPI<GraphQlResponse>(PullRequestQueries.Merge, {
    pullRequestId: pullRequestGithubId,
  });
}

export async function createCommentOnIssue(
  repo: string,
  owner: string,
  issueId: string,
  comment: string
) {
  const issue = await issueDetails(repo, owner, issueId);

  if (!issue) throw Error(`Issue ${issueId} not found`);

  const issueGithubId = issue.repository.issue.id;

  return await githubAPI<GraphQlResponse>(CommentsQueries.Create, {
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

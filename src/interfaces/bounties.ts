import { issuesAttributes } from "src/db/models/issues";
import { pull_requestsAttributes } from "src/db/models/pull_requests";
import { repositoriesAttributes } from "src/db/models/repositories";
import { tokensAttributes } from "src/db/models/tokens";

export interface Repository extends repositoriesAttributes {}

export interface PullRequest extends pull_requestsAttributes {}

export interface Bounty extends issuesAttributes {
  repository?: Repository;
  pull_requests?: PullRequest[];
  token: tokensAttributes;
}

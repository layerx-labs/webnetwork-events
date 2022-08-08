import { issuesAttributes } from "src/db/models/issues";
import { repositoriesAttributes } from "src/db/models/repositories";
import { pull_requestsAttributes } from "./../db/models/pull_requests";

export interface Repository extends repositoriesAttributes {}

export interface PullRequest extends pull_requestsAttributes {}

export interface Bounty extends issuesAttributes {
  repository?: Repository;
  pull_requests?: PullRequest[];
}

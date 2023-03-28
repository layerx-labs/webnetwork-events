import type { Sequelize } from "sequelize";
import { SequelizeMeta as _SequelizeMeta } from "./SequelizeMeta";
import type { SequelizeMetaAttributes, SequelizeMetaCreationAttributes } from "./SequelizeMeta";
import { benefactors as _benefactors } from "./benefactors";
import type { benefactorsAttributes, benefactorsCreationAttributes } from "./benefactors";
import { chain_events as _chain_events } from "./chain_events";
import type { chain_eventsAttributes, chain_eventsCreationAttributes } from "./chain_events";
import { chains as _chains } from "./chains";
import type { chainsAttributes, chainsCreationAttributes } from "./chains";
import { curators as _curators } from "./curators";
import type { curatorsAttributes, curatorsCreationAttributes } from "./curators";
import { delegations as _delegations } from "./delegations";
import type { delegationsAttributes, delegationsCreationAttributes } from "./delegations";
import { developers as _developers } from "./developers";
import type { developersAttributes, developersCreationAttributes } from "./developers";
import { disputes as _disputes } from "./disputes";
import type { disputesAttributes, disputesCreationAttributes } from "./disputes";
import { header_information as _header_information } from "./header_information";
import type { header_informationAttributes, header_informationCreationAttributes } from "./header_information";
import { issues as _issues } from "./issues";
import type { issuesAttributes, issuesCreationAttributes } from "./issues";
import { kyc_sessions as _kyc_sessions } from "./kyc_sessions";
import type { kyc_sessionsAttributes, kyc_sessionsCreationAttributes } from "./kyc_sessions";
import { leaderboard as _leaderboard } from "./leaderboard";
import type { leaderboardAttributes, leaderboardCreationAttributes } from "./leaderboard";
import { merge_proposals as _merge_proposals } from "./merge_proposals";
import type { merge_proposalsAttributes, merge_proposalsCreationAttributes } from "./merge_proposals";
import { network_tokens as _network_tokens } from "./network_tokens";
import type { network_tokensAttributes, network_tokensCreationAttributes } from "./network_tokens";
import { networks as _networks } from "./networks";
import type { networksAttributes, networksCreationAttributes } from "./networks";
import { proposal_distributions as _proposal_distributions } from "./proposal_distributions";
import type { proposal_distributionsAttributes, proposal_distributionsCreationAttributes } from "./proposal_distributions";
import { pull_requests as _pull_requests } from "./pull_requests";
import type { pull_requestsAttributes, pull_requestsCreationAttributes } from "./pull_requests";
import { repositories as _repositories } from "./repositories";
import type { repositoriesAttributes, repositoriesCreationAttributes } from "./repositories";
import { settings as _settings } from "./settings";
import type { settingsAttributes, settingsCreationAttributes } from "./settings";
import { tokens as _tokens } from "./tokens";
import type { tokensAttributes, tokensCreationAttributes } from "./tokens";
import { users as _users } from "./users";
import type { usersAttributes, usersCreationAttributes } from "./users";
import { users_payments as _users_payments } from "./users_payments";
import type { users_paymentsAttributes, users_paymentsCreationAttributes } from "./users_payments";

export {
  _SequelizeMeta as SequelizeMeta,
  _benefactors as benefactors,
  _chain_events as chain_events,
  _chains as chains,
  _curators as curators,
  _delegations as delegations,
  _developers as developers,
  _disputes as disputes,
  _header_information as header_information,
  _issues as issues,
  _kyc_sessions as kyc_sessions,
  _leaderboard as leaderboard,
  _merge_proposals as merge_proposals,
  _network_tokens as network_tokens,
  _networks as networks,
  _proposal_distributions as proposal_distributions,
  _pull_requests as pull_requests,
  _repositories as repositories,
  _settings as settings,
  _tokens as tokens,
  _users as users,
  _users_payments as users_payments,
};

export type {
  SequelizeMetaAttributes,
  SequelizeMetaCreationAttributes,
  benefactorsAttributes,
  benefactorsCreationAttributes,
  chain_eventsAttributes,
  chain_eventsCreationAttributes,
  chainsAttributes,
  chainsCreationAttributes,
  curatorsAttributes,
  curatorsCreationAttributes,
  delegationsAttributes,
  delegationsCreationAttributes,
  developersAttributes,
  developersCreationAttributes,
  disputesAttributes,
  disputesCreationAttributes,
  header_informationAttributes,
  header_informationCreationAttributes,
  issuesAttributes,
  issuesCreationAttributes,
  kyc_sessionsAttributes,
  kyc_sessionsCreationAttributes,
  leaderboardAttributes,
  leaderboardCreationAttributes,
  merge_proposalsAttributes,
  merge_proposalsCreationAttributes,
  network_tokensAttributes,
  network_tokensCreationAttributes,
  networksAttributes,
  networksCreationAttributes,
  proposal_distributionsAttributes,
  proposal_distributionsCreationAttributes,
  pull_requestsAttributes,
  pull_requestsCreationAttributes,
  repositoriesAttributes,
  repositoriesCreationAttributes,
  settingsAttributes,
  settingsCreationAttributes,
  tokensAttributes,
  tokensCreationAttributes,
  usersAttributes,
  usersCreationAttributes,
  users_paymentsAttributes,
  users_paymentsCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  const SequelizeMeta = _SequelizeMeta.initModel(sequelize);
  const benefactors = _benefactors.initModel(sequelize);
  const chain_events = _chain_events.initModel(sequelize);
  const chains = _chains.initModel(sequelize);
  const curators = _curators.initModel(sequelize);
  const delegations = _delegations.initModel(sequelize);
  const developers = _developers.initModel(sequelize);
  const disputes = _disputes.initModel(sequelize);
  const header_information = _header_information.initModel(sequelize);
  const issues = _issues.initModel(sequelize);
  const kyc_sessions = _kyc_sessions.initModel(sequelize);
  const leaderboard = _leaderboard.initModel(sequelize);
  const merge_proposals = _merge_proposals.initModel(sequelize);
  const network_tokens = _network_tokens.initModel(sequelize);
  const networks = _networks.initModel(sequelize);
  const proposal_distributions = _proposal_distributions.initModel(sequelize);
  const pull_requests = _pull_requests.initModel(sequelize);
  const repositories = _repositories.initModel(sequelize);
  const settings = _settings.initModel(sequelize);
  const tokens = _tokens.initModel(sequelize);
  const users = _users.initModel(sequelize);
  const users_payments = _users_payments.initModel(sequelize);

  delegations.belongsTo(chains, { as: "chain", foreignKey: "chainId"});
  chains.hasMany(delegations, { as: "delegations", foreignKey: "chainId"});
  issues.belongsTo(chains, { as: "chain", foreignKey: "chain_id"});
  chains.hasMany(issues, { as: "issues", foreignKey: "chain_id"});
  networks.belongsTo(chains, { as: "chain", foreignKey: "chain_id"});
  chains.hasMany(networks, { as: "networks", foreignKey: "chain_id"});
  tokens.belongsTo(chains, { as: "chain", foreignKey: "chain_id"});
  chains.hasMany(tokens, { as: "tokens", foreignKey: "chain_id"});
  delegations.belongsTo(curators, { as: "curator", foreignKey: "curatorId"});
  curators.hasMany(delegations, { as: "delegations", foreignKey: "curatorId"});
  benefactors.belongsTo(issues, { as: "issue", foreignKey: "issueId"});
  issues.hasMany(benefactors, { as: "benefactors", foreignKey: "issueId"});
  developers.belongsTo(issues, { as: "issue", foreignKey: "issueId"});
  issues.hasMany(developers, { as: "developers", foreignKey: "issueId"});
  disputes.belongsTo(issues, { as: "issue", foreignKey: "issueId"});
  issues.hasMany(disputes, { as: "disputes", foreignKey: "issueId"});
  merge_proposals.belongsTo(issues, { as: "issue", foreignKey: "issueId"});
  issues.hasMany(merge_proposals, { as: "merge_proposals", foreignKey: "issueId"});
  pull_requests.belongsTo(issues, { as: "issue", foreignKey: "issueId"});
  issues.hasMany(pull_requests, { as: "pull_requests", foreignKey: "issueId"});
  users_payments.belongsTo(issues, { as: "issue", foreignKey: "issueId"});
  issues.hasMany(users_payments, { as: "users_payments", foreignKey: "issueId"});
  disputes.belongsTo(merge_proposals, { as: "proposal", foreignKey: "proposalId"});
  merge_proposals.hasMany(disputes, { as: "disputes", foreignKey: "proposalId"});
  proposal_distributions.belongsTo(merge_proposals, { as: "proposal", foreignKey: "proposalId"});
  merge_proposals.hasMany(proposal_distributions, { as: "proposal_distributions", foreignKey: "proposalId"});
  curators.belongsTo(networks, { as: "network", foreignKey: "networkId"});
  networks.hasMany(curators, { as: "curators", foreignKey: "networkId"});
  delegations.belongsTo(networks, { as: "network", foreignKey: "networkId"});
  networks.hasMany(delegations, { as: "delegations", foreignKey: "networkId"});
  issues.belongsTo(networks, { as: "network", foreignKey: "network_id"});
  networks.hasMany(issues, { as: "issues", foreignKey: "network_id"});
  merge_proposals.belongsTo(networks, { as: "network", foreignKey: "network_id"});
  networks.hasMany(merge_proposals, { as: "merge_proposals", foreignKey: "network_id"});
  network_tokens.belongsTo(networks, { as: "network", foreignKey: "networkId"});
  networks.hasMany(network_tokens, { as: "network_tokens", foreignKey: "networkId"});
  pull_requests.belongsTo(networks, { as: "network", foreignKey: "network_id"});
  networks.hasMany(pull_requests, { as: "pull_requests", foreignKey: "network_id"});
  repositories.belongsTo(networks, { as: "network", foreignKey: "network_id"});
  networks.hasMany(repositories, { as: "repositories", foreignKey: "network_id"});
  merge_proposals.belongsTo(pull_requests, { as: "pullRequest", foreignKey: "pullRequestId"});
  pull_requests.hasMany(merge_proposals, { as: "merge_proposals", foreignKey: "pullRequestId"});
  issues.belongsTo(repositories, { as: "repository", foreignKey: "repository_id"});
  repositories.hasMany(issues, { as: "issues", foreignKey: "repository_id"});
  issues.belongsTo(tokens, { as: "rewardToken", foreignKey: "rewardTokenId"});
  tokens.hasMany(issues, { as: "issues", foreignKey: "rewardTokenId"});
  issues.belongsTo(tokens, { as: "transactionalToken", foreignKey: "transactionalTokenId"});
  tokens.hasMany(issues, { as: "transactionalToken_issues", foreignKey: "transactionalTokenId"});
  network_tokens.belongsTo(tokens, { as: "token", foreignKey: "tokenId"});
  tokens.hasMany(network_tokens, { as: "network_tokens", foreignKey: "tokenId"});
  networks.belongsTo(tokens, { as: "network_token_token", foreignKey: "network_token_id"});
  tokens.hasMany(networks, { as: "networks", foreignKey: "network_token_id"});
  kyc_sessions.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(kyc_sessions, { as: "kyc_sessions", foreignKey: "user_id"});

  return {
    SequelizeMeta: SequelizeMeta,
    benefactors: benefactors,
    chain_events: chain_events,
    chains: chains,
    curators: curators,
    delegations: delegations,
    developers: developers,
    disputes: disputes,
    header_information: header_information,
    issues: issues,
    kyc_sessions: kyc_sessions,
    leaderboard: leaderboard,
    merge_proposals: merge_proposals,
    network_tokens: network_tokens,
    networks: networks,
    proposal_distributions: proposal_distributions,
    pull_requests: pull_requests,
    repositories: repositories,
    settings: settings,
    tokens: tokens,
    users: users,
    users_payments: users_payments,
  };
}

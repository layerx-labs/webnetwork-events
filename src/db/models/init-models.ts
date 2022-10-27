import type { Sequelize } from "sequelize";
import { SequelizeMeta as _SequelizeMeta } from "./SequelizeMeta";
import type { SequelizeMetaAttributes, SequelizeMetaCreationAttributes } from "./SequelizeMeta";
import { chain_events as _chain_events } from "./chain_events";
import type { chain_eventsAttributes, chain_eventsCreationAttributes } from "./chain_events";
import { developers as _developers } from "./developers";
import type { developersAttributes, developersCreationAttributes } from "./developers";
import { issues as _issues } from "./issues";
import type { issuesAttributes, issuesCreationAttributes } from "./issues";
import { merge_proposals as _merge_proposals } from "./merge_proposals";
import type { merge_proposalsAttributes, merge_proposalsCreationAttributes } from "./merge_proposals";
import { network_tokens as _network_tokens } from "./network_tokens";
import type { network_tokensAttributes, network_tokensCreationAttributes } from "./network_tokens";
import { networks as _networks } from "./networks";
import type { networksAttributes, networksCreationAttributes } from "./networks";
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
import { benefactors as _benefactors } from "./benefactor";
import type { benefactorAttributes, benefactorCreationAttributes } from "./benefactor";

export {
  _SequelizeMeta as SequelizeMeta,
  _chain_events as chain_events,
  _developers as developers,
  _issues as issues,
  _merge_proposals as merge_proposals,
  _network_tokens as network_tokens,
  _networks as networks,
  _pull_requests as pull_requests,
  _repositories as repositories,
  _settings as settings,
  _tokens as tokens,
  _users as users,
  _users_payments as users_payments,
  _benefactors as benefactors
};

export type {
  SequelizeMetaAttributes,
  SequelizeMetaCreationAttributes,
  chain_eventsAttributes,
  chain_eventsCreationAttributes,
  developersAttributes,
  developersCreationAttributes,
  issuesAttributes,
  issuesCreationAttributes,
  merge_proposalsAttributes,
  merge_proposalsCreationAttributes,
  network_tokensAttributes,
  network_tokensCreationAttributes,
  networksAttributes,
  networksCreationAttributes,
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
  benefactorAttributes,
  benefactorCreationAttributes
};

export function initModels(sequelize: Sequelize) {
  const SequelizeMeta = _SequelizeMeta.initModel(sequelize);
  const chain_events = _chain_events.initModel(sequelize);
  const developers = _developers.initModel(sequelize);
  const issues = _issues.initModel(sequelize);
  const merge_proposals = _merge_proposals.initModel(sequelize);
  const network_tokens = _network_tokens.initModel(sequelize);
  const networks = _networks.initModel(sequelize);
  const pull_requests = _pull_requests.initModel(sequelize);
  const repositories = _repositories.initModel(sequelize);
  const settings = _settings.initModel(sequelize);
  const tokens = _tokens.initModel(sequelize);
  const users = _users.initModel(sequelize);
  const users_payments = _users_payments.initModel(sequelize);
  const benefactors = _benefactors.initModel(sequelize);

  developers.belongsTo(issues, { as: "issue", foreignKey: "issueId"});
  issues.hasMany(developers, { as: "developers", foreignKey: "issueId"});
  merge_proposals.belongsTo(issues, { as: "issue", foreignKey: "issueId"});
  issues.hasMany(merge_proposals, { as: "merge_proposals", foreignKey: "issueId"});
  pull_requests.belongsTo(issues, { as: "issue", foreignKey: "issueId"});
  issues.hasMany(pull_requests, { as: "pull_requests", foreignKey: "issueId"});
  users_payments.belongsTo(issues, { as: "issue", foreignKey: "issueId"});
  issues.hasMany(users_payments, { as: "users_payments", foreignKey: "issueId"});
  issues.hasMany(benefactors, { as: "benefactors", foreignKey: "issueId"});
  issues.belongsTo(networks, { as: "network", foreignKey: "network_id"});
  networks.hasMany(issues, { as: "issues", foreignKey: "network_id"});
  network_tokens.belongsTo(networks, { as: "network", foreignKey: "networkId"});
  networks.hasMany(network_tokens, { as: "network_tokens", foreignKey: "networkId"});
  repositories.belongsTo(networks, { as: "network", foreignKey: "network_id"});
  networks.hasMany(repositories, { as: "repositories", foreignKey: "network_id"});
  merge_proposals.belongsTo(pull_requests, { as: "pullRequest", foreignKey: "pullRequestId"});
  pull_requests.hasMany(merge_proposals, { as: "merge_proposals", foreignKey: "pullRequestId"});
  issues.belongsTo(repositories, { as: "repository", foreignKey: "repository_id"});
  repositories.hasMany(issues, { as: "issues", foreignKey: "repository_id"});
  issues.belongsTo(tokens, { as: "token", foreignKey: "tokenId"});
  tokens.hasMany(issues, { as: "issues", foreignKey: "tokenId"});
  network_tokens.belongsTo(tokens, { as: "token", foreignKey: "tokenId"});
  tokens.hasMany(network_tokens, { as: "network_tokens", foreignKey: "tokenId"});

  return {
    SequelizeMeta: SequelizeMeta,
    chain_events: chain_events,
    developers: developers,
    issues: issues,
    merge_proposals: merge_proposals,
    network_tokens: network_tokens,
    networks: networks,
    pull_requests: pull_requests,
    repositories: repositories,
    settings: settings,
    tokens: tokens,
    users: users,
    users_payments: users_payments,
    benefactors: benefactors
  };
}

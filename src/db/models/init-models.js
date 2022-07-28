import _sequelize from "sequelize";
import _chain_events from "./chain_events.js";
import _developers from "./developers.js";
import _issues from "./issues.js";
import _merge_proposals from "./merge_proposals.js";
import _networks from "./networks.js";
import _network_tokens from "./network_tokens.js";
import _pull_requests from "./pull_requests.js";
import _repositories from "./repositories.js";
import _SequelizeMeta from "./SequelizeMeta.js";
import _tokens from "./tokens.js";
import _users from "./users.js";
import _users_payments from "./users_payments.js";
const DataTypes = _sequelize.DataTypes;

export default function initModels(sequelize) {
  const SequelizeMeta = _SequelizeMeta.init(sequelize, DataTypes);
  const chain_events = _chain_events.init(sequelize, DataTypes);
  const developers = _developers.init(sequelize, DataTypes);
  const issues = _issues.init(sequelize, DataTypes);
  const merge_proposals = _merge_proposals.init(sequelize, DataTypes);
  const network_tokens = _network_tokens.init(sequelize, DataTypes);
  const networks = _networks.init(sequelize, DataTypes);
  const pull_requests = _pull_requests.init(sequelize, DataTypes);
  const repositories = _repositories.init(sequelize, DataTypes);
  const tokens = _tokens.init(sequelize, DataTypes);
  const users = _users.init(sequelize, DataTypes);
  const users_payments = _users_payments.init(sequelize, DataTypes);

  developers.belongsTo(issues, { as: "issue", foreignKey: "issueId" });
  issues.hasMany(developers, { as: "developers", foreignKey: "issueId" });
  merge_proposals.belongsTo(issues, { as: "issue", foreignKey: "issueId" });
  issues.hasMany(merge_proposals, {
    as: "merge_proposals",
    foreignKey: "issueId",
  });
  pull_requests.belongsTo(issues, { as: "issue", foreignKey: "issueId" });
  issues.hasMany(pull_requests, { as: "pull_requests", foreignKey: "issueId" });
  users_payments.belongsTo(issues, { as: "issue", foreignKey: "issueId" });
  issues.hasMany(users_payments, {
    as: "users_payments",
    foreignKey: "issueId",
  });
  issues.belongsTo(networks, { as: "network", foreignKey: "network_id" });
  networks.hasMany(issues, { as: "issues", foreignKey: "network_id" });
  network_tokens.belongsTo(networks, {
    as: "network",
    foreignKey: "networkId",
  });
  networks.hasMany(network_tokens, {
    as: "network_tokens",
    foreignKey: "networkId",
  });
  repositories.belongsTo(networks, { as: "network", foreignKey: "network_id" });
  networks.hasMany(repositories, {
    as: "repositories",
    foreignKey: "network_id",
  });
  merge_proposals.belongsTo(pull_requests, {
    as: "pullRequest",
    foreignKey: "pullRequestId",
  });
  pull_requests.hasMany(merge_proposals, {
    as: "merge_proposals",
    foreignKey: "pullRequestId",
  });
  issues.belongsTo(repositories, {
    as: "repository",
    foreignKey: "repository_id",
  });
  repositories.hasMany(issues, { as: "issues", foreignKey: "repository_id" });
  issues.belongsTo(tokens, { as: "token", foreignKey: "tokenId" });
  tokens.hasMany(issues, { as: "issues", foreignKey: "tokenId" });
  network_tokens.belongsTo(tokens, { as: "token", foreignKey: "tokenId" });
  tokens.hasMany(network_tokens, {
    as: "network_tokens",
    foreignKey: "tokenId",
  });

  return {
    SequelizeMeta,
    chain_events,
    developers,
    issues,
    merge_proposals,
    network_tokens,
    networks,
    pull_requests,
    repositories,
    tokens,
    users,
    users_payments,
  };
}

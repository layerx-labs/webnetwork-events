import type { Sequelize } from "sequelize";
import { SequelizeMeta as _SequelizeMeta } from "./SequelizeMeta";
import type { SequelizeMetaAttributes, SequelizeMetaCreationAttributes } from "./SequelizeMeta";
import { benefactors as _benefactors } from "./benefactors";
import type { benefactorsAttributes, benefactorsCreationAttributes } from "./benefactors";
import { chain_events as _chain_events } from "./chain_events";
import type { chain_eventsAttributes, chain_eventsCreationAttributes } from "./chain_events";
import { chains as _chains } from "./chains";
import type { chainsAttributes, chainsCreationAttributes } from "./chains";
import { comments as _comments } from "./comments";
import type { commentsAttributes, commentsCreationAttributes } from "./comments";
import { curators as _curators } from "./curators";
import type { curatorsAttributes, curatorsCreationAttributes } from "./curators";
import { delegations as _delegations } from "./delegations";
import type { delegationsAttributes, delegationsCreationAttributes } from "./delegations";
import { deliverables as _deliverables } from "./deliverables";
import type { deliverablesAttributes, deliverablesCreationAttributes } from "./deliverables";
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
import { notification_settings as _notification_settings } from "./notification_settings";
import type { notification_settingsAttributes, notification_settingsCreationAttributes } from "./notification_settings";
import { notifications as _notifications } from "./notifications";
import type { notificationsAttributes, notificationsCreationAttributes } from "./notifications";
import { points_base as _points_base } from "./points_base";
import type { points_baseAttributes, points_baseCreationAttributes } from "./points_base";
import { points_events as _points_events } from "./points_events";
import type { points_eventsAttributes, points_eventsCreationAttributes } from "./points_events";
import { proposal_distributions as _proposal_distributions } from "./proposal_distributions";
import type { proposal_distributionsAttributes, proposal_distributionsCreationAttributes } from "./proposal_distributions";
import { settings as _settings } from "./settings";
import type { settingsAttributes, settingsCreationAttributes } from "./settings";
import { tokens as _tokens } from "./tokens";
import type { tokensAttributes, tokensCreationAttributes } from "./tokens";
import { user_settings as _user_settings } from "./user_settings";
import type { user_settingsAttributes, user_settingsCreationAttributes } from "./user_settings";
import { users as _users } from "./users";
import type { usersAttributes, usersCreationAttributes } from "./users";
import { users_locked_registry as _users_locked_registry } from "./users_locked_registry";
import type { users_locked_registryAttributes, users_locked_registryCreationAttributes } from "./users_locked_registry";
import { users_payments as _users_payments } from "./users_payments";
import type { users_paymentsAttributes, users_paymentsCreationAttributes } from "./users_payments";

export {
  _SequelizeMeta as SequelizeMeta,
  _benefactors as benefactors,
  _chain_events as chain_events,
  _chains as chains,
  _comments as comments,
  _curators as curators,
  _delegations as delegations,
  _deliverables as deliverables,
  _developers as developers,
  _disputes as disputes,
  _header_information as header_information,
  _issues as issues,
  _kyc_sessions as kyc_sessions,
  _leaderboard as leaderboard,
  _merge_proposals as merge_proposals,
  _network_tokens as network_tokens,
  _networks as networks,
  _notification_settings as notification_settings,
  _notifications as notifications,
  _points_base as points_base,
  _points_events as points_events,
  _proposal_distributions as proposal_distributions,
  _settings as settings,
  _tokens as tokens,
  _user_settings as user_settings,
  _users as users,
  _users_locked_registry as users_locked_registry,
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
  commentsAttributes,
  commentsCreationAttributes,
  curatorsAttributes,
  curatorsCreationAttributes,
  delegationsAttributes,
  delegationsCreationAttributes,
  deliverablesAttributes,
  deliverablesCreationAttributes,
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
  notification_settingsAttributes,
  notification_settingsCreationAttributes,
  notificationsAttributes,
  notificationsCreationAttributes,
  points_baseAttributes,
  points_baseCreationAttributes,
  points_eventsAttributes,
  points_eventsCreationAttributes,
  proposal_distributionsAttributes,
  proposal_distributionsCreationAttributes,
  settingsAttributes,
  settingsCreationAttributes,
  tokensAttributes,
  tokensCreationAttributes,
  user_settingsAttributes,
  user_settingsCreationAttributes,
  usersAttributes,
  usersCreationAttributes,
  users_locked_registryAttributes,
  users_locked_registryCreationAttributes,
  users_paymentsAttributes,
  users_paymentsCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  const SequelizeMeta = _SequelizeMeta.initModel(sequelize);
  const benefactors = _benefactors.initModel(sequelize);
  const chain_events = _chain_events.initModel(sequelize);
  const chains = _chains.initModel(sequelize);
  const comments = _comments.initModel(sequelize);
  const curators = _curators.initModel(sequelize);
  const delegations = _delegations.initModel(sequelize);
  const deliverables = _deliverables.initModel(sequelize);
  const developers = _developers.initModel(sequelize);
  const disputes = _disputes.initModel(sequelize);
  const header_information = _header_information.initModel(sequelize);
  const issues = _issues.initModel(sequelize);
  const kyc_sessions = _kyc_sessions.initModel(sequelize);
  const leaderboard = _leaderboard.initModel(sequelize);
  const merge_proposals = _merge_proposals.initModel(sequelize);
  const network_tokens = _network_tokens.initModel(sequelize);
  const networks = _networks.initModel(sequelize);
  const notification_settings = _notification_settings.initModel(sequelize);
  const notifications = _notifications.initModel(sequelize);
  const points_base = _points_base.initModel(sequelize);
  const points_events = _points_events.initModel(sequelize);
  const proposal_distributions = _proposal_distributions.initModel(sequelize);
  const settings = _settings.initModel(sequelize);
  const tokens = _tokens.initModel(sequelize);
  const user_settings = _user_settings.initModel(sequelize);
  const users = _users.initModel(sequelize);
  const users_locked_registry = _users_locked_registry.initModel(sequelize);
  const users_payments = _users_payments.initModel(sequelize);

  delegations.belongsTo(chains, { as: "chain", foreignKey: "chainId"});
  chains.hasMany(delegations, { as: "delegations", foreignKey: "chainId"});
  issues.belongsTo(chains, { as: "chain", foreignKey: "chain_id"});
  chains.hasMany(issues, { as: "issues", foreignKey: "chain_id"});
  networks.belongsTo(chains, { as: "chain", foreignKey: "chain_id"});
  chains.hasMany(networks, { as: "networks", foreignKey: "chain_id"});
  tokens.belongsTo(chains, { as: "chain", foreignKey: "chain_id"});
  chains.hasMany(tokens, { as: "tokens", foreignKey: "chain_id"});
  users_locked_registry.belongsTo(chains, { as: "chain", foreignKey: "chainId"});
  chains.hasMany(users_locked_registry, { as: "users_locked_registries", foreignKey: "chainId"});
  comments.belongsTo(comments, { as: "reply", foreignKey: "replyId"});
  comments.hasMany(comments, { as: "comments", foreignKey: "replyId"});
  delegations.belongsTo(curators, { as: "curator", foreignKey: "curatorId"});
  curators.hasMany(delegations, { as: "delegations", foreignKey: "curatorId"});
  comments.belongsTo(deliverables, { as: "deliverable", foreignKey: "deliverableId"});
  deliverables.hasMany(comments, { as: "comments", foreignKey: "deliverableId"});
  merge_proposals.belongsTo(deliverables, { as: "deliverable", foreignKey: "deliverableId"});
  deliverables.hasMany(merge_proposals, { as: "merge_proposals", foreignKey: "deliverableId"});
  benefactors.belongsTo(issues, { as: "issue", foreignKey: "issueId"});
  issues.hasMany(benefactors, { as: "benefactors", foreignKey: "issueId"});
  comments.belongsTo(issues, { as: "issue", foreignKey: "issueId"});
  issues.hasMany(comments, { as: "comments", foreignKey: "issueId"});
  deliverables.belongsTo(issues, { as: "issue", foreignKey: "issueId"});
  issues.hasMany(deliverables, { as: "deliverables", foreignKey: "issueId"});
  developers.belongsTo(issues, { as: "issue", foreignKey: "issueId"});
  issues.hasMany(developers, { as: "developers", foreignKey: "issueId"});
  disputes.belongsTo(issues, { as: "issue", foreignKey: "issueId"});
  issues.hasMany(disputes, { as: "disputes", foreignKey: "issueId"});
  merge_proposals.belongsTo(issues, { as: "issue", foreignKey: "issueId"});
  issues.hasMany(merge_proposals, { as: "merge_proposals", foreignKey: "issueId"});
  users_payments.belongsTo(issues, { as: "issue", foreignKey: "issueId"});
  issues.hasMany(users_payments, { as: "users_payments", foreignKey: "issueId"});
  comments.belongsTo(merge_proposals, { as: "proposal", foreignKey: "proposalId"});
  merge_proposals.hasMany(comments, { as: "comments", foreignKey: "proposalId"});
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
  points_events.belongsTo(points_base, { as: "actionName_points_base", foreignKey: "actionName"});
  points_base.hasMany(points_events, { as: "points_events", foreignKey: "actionName"});
  issues.belongsTo(tokens, { as: "rewardToken", foreignKey: "rewardTokenId"});
  tokens.hasMany(issues, { as: "issues", foreignKey: "rewardTokenId"});
  issues.belongsTo(tokens, { as: "transactionalToken", foreignKey: "transactionalTokenId"});
  tokens.hasMany(issues, { as: "transactionalToken_issues", foreignKey: "transactionalTokenId"});
  network_tokens.belongsTo(tokens, { as: "token", foreignKey: "tokenId"});
  tokens.hasMany(network_tokens, { as: "network_tokens", foreignKey: "tokenId"});
  networks.belongsTo(tokens, { as: "network_token_token", foreignKey: "network_token_id"});
  tokens.hasMany(networks, { as: "networks", foreignKey: "network_token_id"});
  users_locked_registry.belongsTo(tokens, { as: "token", foreignKey: "tokenId"});
  tokens.hasMany(users_locked_registry, { as: "users_locked_registries", foreignKey: "tokenId"});
  comments.belongsTo(users, { as: "user", foreignKey: "userId"});
  users.hasMany(comments, { as: "comments", foreignKey: "userId"});
  curators.belongsTo(users, { as: "user", foreignKey: "userId"});
  users.hasMany(curators, { as: "curators", foreignKey: "userId"});
  deliverables.belongsTo(users, { as: "user", foreignKey: "userId"});
  users.hasMany(deliverables, { as: "deliverables", foreignKey: "userId"});
  issues.belongsTo(users, { as: "user", foreignKey: "userId"});
  users.hasMany(issues, { as: "issues", foreignKey: "userId"});
  kyc_sessions.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(kyc_sessions, { as: "kyc_sessions", foreignKey: "user_id"});
  notification_settings.belongsTo(users, { as: "user", foreignKey: "userId"});
  users.hasOne(notification_settings, { as: "notification_setting", foreignKey: "userId"});
  notifications.belongsTo(users, { as: "user", foreignKey: "userId"});
  users.hasMany(notifications, { as: "notifications", foreignKey: "userId"});
  points_events.belongsTo(users, { as: "user", foreignKey: "userId"});
  users.hasMany(points_events, { as: "points_events", foreignKey: "userId"});
  user_settings.belongsTo(users, { as: "user", foreignKey: "userId"});
  users.hasMany(user_settings, { as: "user_settings", foreignKey: "userId"});
  users_locked_registry.belongsTo(users, { as: "user", foreignKey: "userId"});
  users.hasMany(users_locked_registry, { as: "users_locked_registries", foreignKey: "userId"});

  return {
    SequelizeMeta: SequelizeMeta,
    benefactors: benefactors,
    chain_events: chain_events,
    chains: chains,
    comments: comments,
    curators: curators,
    delegations: delegations,
    deliverables: deliverables,
    developers: developers,
    disputes: disputes,
    header_information: header_information,
    issues: issues,
    kyc_sessions: kyc_sessions,
    leaderboard: leaderboard,
    merge_proposals: merge_proposals,
    network_tokens: network_tokens,
    networks: networks,
    notification_settings: notification_settings,
    notifications: notifications,
    points_base: points_base,
    points_events: points_events,
    proposal_distributions: proposal_distributions,
    settings: settings,
    tokens: tokens,
    user_settings: user_settings,
    users: users,
    users_locked_registry: users_locked_registry,
    users_payments: users_payments,
  };
}

import * as Sequelize from 'sequelize';
import {DataTypes, Model, Optional} from 'sequelize';
import type {comments, commentsId} from './comments';
import type {curators, curatorsId} from './curators';
import type {deliverables, deliverablesId} from './deliverables';
import type {issues, issuesId} from './issues';
import type {kyc_sessions, kyc_sessionsId} from './kyc_sessions';
import type {notifications, notificationsId} from './notifications';
import type {user_settings, user_settingsId} from './user_settings';
import type {users_locked_registry, users_locked_registryId} from './users_locked_registry';

export interface usersAttributes {
  id: number;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
  handle?: string;
  resetedAt?: Date;
  email?: string;
  isEmailConfirmed?: boolean;
  emailVerificationCode?: string;
  emailVerificationSentAt?: Date;
}

export type usersPk = "id";
export type usersId = users[usersPk];
export type usersOptionalAttributes =
  "id"
  | "address"
  | "createdAt"
  | "updatedAt"
  | "handle"
  | "resetedAt"
  | "email"
  | "isEmailConfirmed"
  | "emailVerificationCode"
  | "emailVerificationSentAt";
export type usersCreationAttributes = Optional<usersAttributes, usersOptionalAttributes>;

export class users extends Model<usersAttributes, usersCreationAttributes> implements usersAttributes {
  id!: number;
  address?: string;
  createdAt!: Date;
  updatedAt!: Date;
  handle?: string;
  resetedAt?: Date;
  email?: string;
  isEmailConfirmed?: boolean;
  emailVerificationCode?: string;
  emailVerificationSentAt?: Date;

  // users hasMany comments via userId
  comments!: comments[];
  getComments!: Sequelize.HasManyGetAssociationsMixin<comments>;
  setComments!: Sequelize.HasManySetAssociationsMixin<comments, commentsId>;
  addComment!: Sequelize.HasManyAddAssociationMixin<comments, commentsId>;
  addComments!: Sequelize.HasManyAddAssociationsMixin<comments, commentsId>;
  createComment!: Sequelize.HasManyCreateAssociationMixin<comments>;
  removeComment!: Sequelize.HasManyRemoveAssociationMixin<comments, commentsId>;
  removeComments!: Sequelize.HasManyRemoveAssociationsMixin<comments, commentsId>;
  hasComment!: Sequelize.HasManyHasAssociationMixin<comments, commentsId>;
  hasComments!: Sequelize.HasManyHasAssociationsMixin<comments, commentsId>;
  countComments!: Sequelize.HasManyCountAssociationsMixin;
  // users hasMany curators via userId
  curators!: curators[];
  getCurators!: Sequelize.HasManyGetAssociationsMixin<curators>;
  setCurators!: Sequelize.HasManySetAssociationsMixin<curators, curatorsId>;
  addCurator!: Sequelize.HasManyAddAssociationMixin<curators, curatorsId>;
  addCurators!: Sequelize.HasManyAddAssociationsMixin<curators, curatorsId>;
  createCurator!: Sequelize.HasManyCreateAssociationMixin<curators>;
  removeCurator!: Sequelize.HasManyRemoveAssociationMixin<curators, curatorsId>;
  removeCurators!: Sequelize.HasManyRemoveAssociationsMixin<curators, curatorsId>;
  hasCurator!: Sequelize.HasManyHasAssociationMixin<curators, curatorsId>;
  hasCurators!: Sequelize.HasManyHasAssociationsMixin<curators, curatorsId>;
  countCurators!: Sequelize.HasManyCountAssociationsMixin;
  // users hasMany deliverables via userId
  deliverables!: deliverables[];
  getDeliverables!: Sequelize.HasManyGetAssociationsMixin<deliverables>;
  setDeliverables!: Sequelize.HasManySetAssociationsMixin<deliverables, deliverablesId>;
  addDeliverable!: Sequelize.HasManyAddAssociationMixin<deliverables, deliverablesId>;
  addDeliverables!: Sequelize.HasManyAddAssociationsMixin<deliverables, deliverablesId>;
  createDeliverable!: Sequelize.HasManyCreateAssociationMixin<deliverables>;
  removeDeliverable!: Sequelize.HasManyRemoveAssociationMixin<deliverables, deliverablesId>;
  removeDeliverables!: Sequelize.HasManyRemoveAssociationsMixin<deliverables, deliverablesId>;
  hasDeliverable!: Sequelize.HasManyHasAssociationMixin<deliverables, deliverablesId>;
  hasDeliverables!: Sequelize.HasManyHasAssociationsMixin<deliverables, deliverablesId>;
  countDeliverables!: Sequelize.HasManyCountAssociationsMixin;
  // users hasMany issues via userId
  issues!: issues[];
  getIssues!: Sequelize.HasManyGetAssociationsMixin<issues>;
  setIssues!: Sequelize.HasManySetAssociationsMixin<issues, issuesId>;
  addIssue!: Sequelize.HasManyAddAssociationMixin<issues, issuesId>;
  addIssues!: Sequelize.HasManyAddAssociationsMixin<issues, issuesId>;
  createIssue!: Sequelize.HasManyCreateAssociationMixin<issues>;
  removeIssue!: Sequelize.HasManyRemoveAssociationMixin<issues, issuesId>;
  removeIssues!: Sequelize.HasManyRemoveAssociationsMixin<issues, issuesId>;
  hasIssue!: Sequelize.HasManyHasAssociationMixin<issues, issuesId>;
  hasIssues!: Sequelize.HasManyHasAssociationsMixin<issues, issuesId>;
  countIssues!: Sequelize.HasManyCountAssociationsMixin;
  // users hasMany kyc_sessions via user_id
  kyc_sessions!: kyc_sessions[];
  getKyc_sessions!: Sequelize.HasManyGetAssociationsMixin<kyc_sessions>;
  setKyc_sessions!: Sequelize.HasManySetAssociationsMixin<kyc_sessions, kyc_sessionsId>;
  addKyc_session!: Sequelize.HasManyAddAssociationMixin<kyc_sessions, kyc_sessionsId>;
  addKyc_sessions!: Sequelize.HasManyAddAssociationsMixin<kyc_sessions, kyc_sessionsId>;
  createKyc_session!: Sequelize.HasManyCreateAssociationMixin<kyc_sessions>;
  removeKyc_session!: Sequelize.HasManyRemoveAssociationMixin<kyc_sessions, kyc_sessionsId>;
  removeKyc_sessions!: Sequelize.HasManyRemoveAssociationsMixin<kyc_sessions, kyc_sessionsId>;
  hasKyc_session!: Sequelize.HasManyHasAssociationMixin<kyc_sessions, kyc_sessionsId>;
  hasKyc_sessions!: Sequelize.HasManyHasAssociationsMixin<kyc_sessions, kyc_sessionsId>;
  countKyc_sessions!: Sequelize.HasManyCountAssociationsMixin;
  // users hasMany notifications via userId
  notifications!: notifications[];
  getNotifications!: Sequelize.HasManyGetAssociationsMixin<notifications>;
  setNotifications!: Sequelize.HasManySetAssociationsMixin<notifications, notificationsId>;
  addNotification!: Sequelize.HasManyAddAssociationMixin<notifications, notificationsId>;
  addNotifications!: Sequelize.HasManyAddAssociationsMixin<notifications, notificationsId>;
  createNotification!: Sequelize.HasManyCreateAssociationMixin<notifications>;
  removeNotification!: Sequelize.HasManyRemoveAssociationMixin<notifications, notificationsId>;
  removeNotifications!: Sequelize.HasManyRemoveAssociationsMixin<notifications, notificationsId>;
  hasNotification!: Sequelize.HasManyHasAssociationMixin<notifications, notificationsId>;
  hasNotifications!: Sequelize.HasManyHasAssociationsMixin<notifications, notificationsId>;
  countNotifications!: Sequelize.HasManyCountAssociationsMixin;
  // users hasMany user_settings via userId
  user_settings!: user_settings[];
  getUser_settings!: Sequelize.HasManyGetAssociationsMixin<user_settings>;
  setUser_settings!: Sequelize.HasManySetAssociationsMixin<user_settings, user_settingsId>;
  addUser_setting!: Sequelize.HasManyAddAssociationMixin<user_settings, user_settingsId>;
  addUser_settings!: Sequelize.HasManyAddAssociationsMixin<user_settings, user_settingsId>;
  createUser_setting!: Sequelize.HasManyCreateAssociationMixin<user_settings>;
  removeUser_setting!: Sequelize.HasManyRemoveAssociationMixin<user_settings, user_settingsId>;
  removeUser_settings!: Sequelize.HasManyRemoveAssociationsMixin<user_settings, user_settingsId>;
  hasUser_setting!: Sequelize.HasManyHasAssociationMixin<user_settings, user_settingsId>;
  hasUser_settings!: Sequelize.HasManyHasAssociationsMixin<user_settings, user_settingsId>;
  countUser_settings!: Sequelize.HasManyCountAssociationsMixin;
  // users hasMany users_locked_registry via userId
  users_locked_registries!: users_locked_registry[];
  getUsers_locked_registries!: Sequelize.HasManyGetAssociationsMixin<users_locked_registry>;
  setUsers_locked_registries!: Sequelize.HasManySetAssociationsMixin<users_locked_registry, users_locked_registryId>;
  addUsers_locked_registry!: Sequelize.HasManyAddAssociationMixin<users_locked_registry, users_locked_registryId>;
  addUsers_locked_registries!: Sequelize.HasManyAddAssociationsMixin<users_locked_registry, users_locked_registryId>;
  createUsers_locked_registry!: Sequelize.HasManyCreateAssociationMixin<users_locked_registry>;
  removeUsers_locked_registry!: Sequelize.HasManyRemoveAssociationMixin<users_locked_registry, users_locked_registryId>;
  removeUsers_locked_registries!: Sequelize.HasManyRemoveAssociationsMixin<users_locked_registry, users_locked_registryId>;
  hasUsers_locked_registry!: Sequelize.HasManyHasAssociationMixin<users_locked_registry, users_locked_registryId>;
  hasUsers_locked_registries!: Sequelize.HasManyHasAssociationsMixin<users_locked_registry, users_locked_registryId>;
  countUsers_locked_registries!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof users {
    return sequelize.define('users', {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      address: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: "users_address_key"
      },
      handle: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: "users_handle_key"
      },
      resetedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: "users_email_key"
      },
      isEmailConfirmed: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      emailVerificationCode: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      emailVerificationSentAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    }, {
      tableName: 'users',
      schema: 'public',
      timestamps: true,
      indexes: [
        {
          name: "users_address_key",
          unique: true,
          fields: [
            {name: "address"},
          ]
        },
        {
          name: "users_email_key",
          unique: true,
          fields: [
            {name: "email"},
          ]
        },
        {
          name: "users_handle_key",
          unique: true,
          fields: [
            {name: "handle"},
          ]
        },
        {
          name: "users_pkey",
          unique: true,
          fields: [
            {name: "id"},
          ]
        },
      ]
    }) as typeof users;
  }
}

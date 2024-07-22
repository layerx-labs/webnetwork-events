import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { users, usersId } from './users';

export interface notification_settingsAttributes {
  id: number;
  userId?: number;
  taskOpen?: boolean;
  deliverableReady?: boolean;
  proposalCreated?: boolean;
  proposalDisputed?: boolean;
  commentsOnTasks?: boolean;
  commentsOnDeliverables?: boolean;
  commentsOnProposals?: boolean;
  subscriptions?: number[];
}

export type notification_settingsPk = "id";
export type notification_settingsId = notification_settings[notification_settingsPk];
export type notification_settingsOptionalAttributes = "id" | "userId" | "taskOpen" | "deliverableReady" | "proposalCreated" | "proposalDisputed" | "commentsOnTasks" | "commentsOnDeliverables" | "commentsOnProposals" | "subscriptions";
export type notification_settingsCreationAttributes = Optional<notification_settingsAttributes, notification_settingsOptionalAttributes>;

export class notification_settings extends Model<notification_settingsAttributes, notification_settingsCreationAttributes> implements notification_settingsAttributes {
  id!: number;
  userId?: number;
  taskOpen?: boolean;
  deliverableReady?: boolean;
  proposalCreated?: boolean;
  proposalDisputed?: boolean;
  commentsOnTasks?: boolean;
  commentsOnDeliverables?: boolean;
  commentsOnProposals?: boolean;
  subscriptions?: number[];

  // notification_settings belongsTo users via userId
  user!: users;
  getUser!: Sequelize.BelongsToGetAssociationMixin<users>;
  setUser!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createUser!: Sequelize.BelongsToCreateAssociationMixin<users>;

  static initModel(sequelize: Sequelize.Sequelize): typeof notification_settings {
    return sequelize.define('notification_settings', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      unique: "notification_settings_userId_key"
    },
    taskOpen: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    },
    deliverableReady: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    },
    proposalCreated: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    },
    proposalDisputed: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    },
    commentsOnTasks: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    },
    commentsOnDeliverables: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    },
    commentsOnProposals: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    },
    subscriptions: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: true
    }
  }, {
    tableName: 'notification_settings',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "notification_settings_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "notification_settings_userId_key",
        unique: true,
        fields: [
          { name: "userId" },
        ]
      },
    ]
  }) as typeof notification_settings;
  }
}

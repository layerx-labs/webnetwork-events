import * as Sequelize from 'sequelize';
import {DataTypes, Model, Optional} from 'sequelize';
import type {users, usersId} from './users';

export interface notificationsAttributes {
  id: number;
  userId?: number;
  type?: string;
  read?: boolean;
  hide?: boolean;
  uuid?: string;
  template?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type notificationsPk = "id";
export type notificationsId = notifications[notificationsPk];
export type notificationsOptionalAttributes = "id" | "userId" | "type" | "read" | "hide" | "uuid" | "template" | "createdAt" | "updatedAt";
export type notificationsCreationAttributes = Optional<notificationsAttributes, notificationsOptionalAttributes>;

export class notifications extends Model<notificationsAttributes, notificationsCreationAttributes> implements notificationsAttributes {
  id!: number;
  userId?: number;
  type?: string;
  read?: boolean;
  hide?: boolean;
  uuid?: string;
  template?: string;
  createdAt!: Date;
  updatedAt!: Date;

  // notifications belongsTo users via userId
  user!: users;
  getUser!: Sequelize.BelongsToGetAssociationMixin<users>;
  setUser!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createUser!: Sequelize.BelongsToCreateAssociationMixin<users>;

  static initModel(sequelize: Sequelize.Sequelize): typeof notifications {
    return sequelize.define('notifications', {
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
      }
    },
    type: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    read: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    hide: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    uuid: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: "notifications_uuid_key"
    },
    template: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'notifications',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "notifications_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "notifications_user_id",
        fields: [
          { name: "userId" },
        ]
      },
      {
        name: "notifications_uuid_key",
        unique: true,
        fields: [
          { name: "uuid" },
        ]
      },
    ]
  }) as typeof notifications;
  }
}

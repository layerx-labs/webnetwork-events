import * as Sequelize from 'sequelize';
import {DataTypes, Model, Optional} from 'sequelize';
import type {users, usersId} from './users';

export interface notificationsAttributes {
  id: number;
  type?: string;
  userId?: number;
  read?: boolean;
  uuid?: string;
}

export type notificationsPk = "id";
export type notificationsId = notifications[notificationsPk];
export type notificationsOptionalAttributes = "id" | "type" | "userId" | "read" | "uuid";
export type notificationsCreationAttributes = Optional<notificationsAttributes, notificationsOptionalAttributes>;

export class notifications extends Model<notificationsAttributes, notificationsCreationAttributes> implements notificationsAttributes {
  id!: number;
  type?: string;
  userId?: number;
  read?: boolean;
  uuid?: string;

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
      type: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      read: {
        type: DataTypes.BOOLEAN,
        allowNull: true
      },
      uuid: {
        type: DataTypes.STRING(255),
        allowNull: true
      }
    }, {
      tableName: 'notifications',
      schema: 'public',
      timestamps: false,
      indexes: [
        {
          name: "notifications_pkey",
          unique: true,
          fields: [
            {name: "id"},
          ]
        },
        {
          name: "notifications_user_id",
          fields: [
            {name: "userId"},
          ]
        },
      ]
    }) as typeof notifications;
  }
}

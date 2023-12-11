import * as Sequelize from 'sequelize';
import {DataTypes, Model, Optional} from 'sequelize';
import type {users, usersId} from './users';

export interface user_settingsAttributes {
  id: number;
  userId?: number;
  notifications?: boolean;
  language?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type user_settingsPk = "id";
export type user_settingsId = user_settings[user_settingsPk];
export type user_settingsOptionalAttributes =
  "id"
  | "userId"
  | "notifications"
  | "language"
  | "createdAt"
  | "updatedAt";
export type user_settingsCreationAttributes = Optional<user_settingsAttributes, user_settingsOptionalAttributes>;

export class user_settings extends Model<user_settingsAttributes, user_settingsCreationAttributes> implements user_settingsAttributes {
  id!: number;
  userId?: number;
  notifications?: boolean;
  language?: string;
  createdAt!: Date;
  updatedAt!: Date;

  // user_settings belongsTo users via userId
  user!: users;
  getUser!: Sequelize.BelongsToGetAssociationMixin<users>;
  setUser!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createUser!: Sequelize.BelongsToCreateAssociationMixin<users>;

  static initModel(sequelize: Sequelize.Sequelize): typeof user_settings {
    return sequelize.define('user_settings', {
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
      notifications: {
        type: DataTypes.BOOLEAN,
        allowNull: true
      },
      language: {
        type: DataTypes.STRING(255),
        allowNull: true
      }
    }, {
      tableName: 'user_settings',
      schema: 'public',
      timestamps: true,
      indexes: [
        {
          name: "user_settings_pkey",
          unique: true,
          fields: [
            {name: "id"},
          ]
        },
        {
          name: "user_settings_user_id",
          fields: [
            {name: "userId"},
          ]
        },
      ]
    }) as typeof user_settings;
  }
}

import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { kyc_sessions, kyc_sessionsId } from './kyc_sessions';

export interface usersAttributes {
  id: number;
  githubHandle?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
  githubLogin?: string;
  resetedAt?: Date;
}

export type usersPk = "id";
export type usersId = users[usersPk];
export type usersOptionalAttributes = "id" | "githubHandle" | "address" | "createdAt" | "updatedAt" | "githubLogin" | "resetedAt";
export type usersCreationAttributes = Optional<usersAttributes, usersOptionalAttributes>;

export class users extends Model<usersAttributes, usersCreationAttributes> implements usersAttributes {
  id!: number;
  githubHandle?: string;
  address?: string;
  createdAt!: Date;
  updatedAt!: Date;
  githubLogin?: string;
  resetedAt?: Date;

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

  static initModel(sequelize: Sequelize.Sequelize): typeof users {
    return sequelize.define('users', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    githubHandle: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: "users_address_key"
    },
    githubLogin: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: "users_githubLogin_key"
    },
    resetedAt: {
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
          { name: "address" },
        ]
      },
      {
        name: "users_githubLogin_key",
        unique: true,
        fields: [
          { name: "githubLogin" },
        ]
      },
      {
        name: "users_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  }) as typeof users;
  }
}

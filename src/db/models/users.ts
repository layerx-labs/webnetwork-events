import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface usersAttributes {
  id: number;
  githubHandle?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
  githubLogin?: string;
  accessToken?: string;
}

export type usersPk = "id";
export type usersId = users[usersPk];
export type usersOptionalAttributes = "id" | "githubHandle" | "address" | "createdAt" | "updatedAt" | "githubLogin" | "accessToken";
export type usersCreationAttributes = Optional<usersAttributes, usersOptionalAttributes>;

export class users extends Model<usersAttributes, usersCreationAttributes> implements usersAttributes {
  id!: number;
  githubHandle?: string;
  address?: string;
  createdAt!: Date;
  updatedAt!: Date;
  githubLogin?: string;
  accessToken?: string;


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
    accessToken: {
      type: DataTypes.STRING(255),
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

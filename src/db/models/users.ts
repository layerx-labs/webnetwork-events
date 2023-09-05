import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { comments, commentsId } from './comments';
import type { issues, issuesId } from './issues';
import type { kyc_sessions, kyc_sessionsId } from './kyc_sessions';

export interface usersAttributes {
  id: number;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
  githubLogin?: string;
  resetedAt?: Date;
  email?: string;
  isEmailConfirmed?: boolean;
  emailVerificationCode?: string;
  emailVerificationSentAt?: Date;
}

export type usersPk = "id";
export type usersId = users[usersPk];
export type usersOptionalAttributes = "id" | "address" | "createdAt" | "updatedAt" | "githubLogin" | "resetedAt" | "email" | "isEmailConfirmed" | "emailVerificationCode" | "emailVerificationSentAt";
export type usersCreationAttributes = Optional<usersAttributes, usersOptionalAttributes>;

export class users extends Model<usersAttributes, usersCreationAttributes> implements usersAttributes {
  id!: number;
  address?: string;
  createdAt!: Date;
  updatedAt!: Date;
  githubLogin?: string;
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
    githubLogin: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: "users_githubLogin_key"
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
          { name: "address" },
        ]
      },
      {
        name: "users_email_key",
        unique: true,
        fields: [
          { name: "email" },
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

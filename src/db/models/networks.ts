import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { issues, issuesId } from './issues';
import type { network_tokens, network_tokensId } from './network_tokens';
import type { repositories, repositoriesId } from './repositories';

export interface networksAttributes {
  id: number;
  creatorAddress: string;
  name: string;
  description: string;
  colors?: object;
  networkAddress?: string;
  logoIcon?: string;
  fullLogo?: string;
  createdAt: Date;
  updatedAt: Date;
  isClosed?: boolean;
  allowCustomTokens?: boolean;
  councilMembers?: string[];
  isRegistered?: boolean;
}

export type networksPk = "id";
export type networksId = networks[networksPk];
export type networksOptionalAttributes = "id" | "colors" | "networkAddress" | "logoIcon" | "fullLogo" | "createdAt" | "updatedAt" | "isClosed" | "allowCustomTokens" | "councilMembers" | "isRegistered";
export type networksCreationAttributes = Optional<networksAttributes, networksOptionalAttributes>;

export class networks extends Model<networksAttributes, networksCreationAttributes> implements networksAttributes {
  id!: number;
  creatorAddress!: string;
  name!: string;
  description!: string;
  colors?: object;
  networkAddress?: string;
  logoIcon?: string;
  fullLogo?: string;
  createdAt!: Date;
  updatedAt!: Date;
  isClosed?: boolean;
  allowCustomTokens?: boolean;
  councilMembers?: string[];
  isRegistered?: boolean;

  // networks hasMany issues via network_id
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
  // networks hasMany network_tokens via networkId
  network_tokens!: network_tokens[];
  getNetwork_tokens!: Sequelize.HasManyGetAssociationsMixin<network_tokens>;
  setNetwork_tokens!: Sequelize.HasManySetAssociationsMixin<network_tokens, network_tokensId>;
  addNetwork_token!: Sequelize.HasManyAddAssociationMixin<network_tokens, network_tokensId>;
  addNetwork_tokens!: Sequelize.HasManyAddAssociationsMixin<network_tokens, network_tokensId>;
  createNetwork_token!: Sequelize.HasManyCreateAssociationMixin<network_tokens>;
  removeNetwork_token!: Sequelize.HasManyRemoveAssociationMixin<network_tokens, network_tokensId>;
  removeNetwork_tokens!: Sequelize.HasManyRemoveAssociationsMixin<network_tokens, network_tokensId>;
  hasNetwork_token!: Sequelize.HasManyHasAssociationMixin<network_tokens, network_tokensId>;
  hasNetwork_tokens!: Sequelize.HasManyHasAssociationsMixin<network_tokens, network_tokensId>;
  countNetwork_tokens!: Sequelize.HasManyCountAssociationsMixin;
  // networks hasMany repositories via network_id
  repositories!: repositories[];
  getRepositories!: Sequelize.HasManyGetAssociationsMixin<repositories>;
  setRepositories!: Sequelize.HasManySetAssociationsMixin<repositories, repositoriesId>;
  addRepository!: Sequelize.HasManyAddAssociationMixin<repositories, repositoriesId>;
  addRepositories!: Sequelize.HasManyAddAssociationsMixin<repositories, repositoriesId>;
  createRepository!: Sequelize.HasManyCreateAssociationMixin<repositories>;
  removeRepository!: Sequelize.HasManyRemoveAssociationMixin<repositories, repositoriesId>;
  removeRepositories!: Sequelize.HasManyRemoveAssociationsMixin<repositories, repositoriesId>;
  hasRepository!: Sequelize.HasManyHasAssociationMixin<repositories, repositoriesId>;
  hasRepositories!: Sequelize.HasManyHasAssociationsMixin<repositories, repositoriesId>;
  countRepositories!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof networks {
    return sequelize.define('networks', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    creatorAddress: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "networks_name_key"
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    colors: {
      type: DataTypes.JSON,
      allowNull: true
    },
    networkAddress: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    logoIcon: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    fullLogo: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    isClosed: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    allowCustomTokens: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    councilMembers: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true
    },
    isRegistered: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    }
  }, {
    tableName: 'networks',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "networks_name_key",
        unique: true,
        fields: [
          { name: "name" },
        ]
      },
      {
        name: "networks_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  }) as typeof networks;
  }
}

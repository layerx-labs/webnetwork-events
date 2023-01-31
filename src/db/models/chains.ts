import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { issues, issuesId } from './issues';
import type { networks, networksId } from './networks';
import type { tokens, tokensId } from './tokens';

export interface chainsAttributes {
  id: number;
  chainId?: number;
  chainRpc: string;
  chainName: string;
  chainShortName: string;
  chainCurrencyName: string;
  chainCurrencySymbol: string;
  chainCurrencyDecimals: number;
  registryAddress?: string;
  eventsApi?: string;
  blockScanner?: string;
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
  color?: string;
}

export type chainsPk = "id";
export type chainsId = chains[chainsPk];
export type chainsOptionalAttributes = "id" | "chainId" | "registryAddress" | "eventsApi" | "blockScanner" | "isDefault" | "createdAt" | "updatedAt" | "color";
export type chainsCreationAttributes = Optional<chainsAttributes, chainsOptionalAttributes>;

export class chains extends Model<chainsAttributes, chainsCreationAttributes> implements chainsAttributes {
  id!: number;
  chainId?: number;
  chainRpc!: string;
  chainName!: string;
  chainShortName!: string;
  chainCurrencyName!: string;
  chainCurrencySymbol!: string;
  chainCurrencyDecimals!: number;
  registryAddress?: string;
  eventsApi?: string;
  blockScanner?: string;
  isDefault?: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  color?: string;

  // chains hasMany issues via chain_id
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
  // chains hasMany networks via chain_id
  networks!: networks[];
  getNetworks!: Sequelize.HasManyGetAssociationsMixin<networks>;
  setNetworks!: Sequelize.HasManySetAssociationsMixin<networks, networksId>;
  addNetwork!: Sequelize.HasManyAddAssociationMixin<networks, networksId>;
  addNetworks!: Sequelize.HasManyAddAssociationsMixin<networks, networksId>;
  createNetwork!: Sequelize.HasManyCreateAssociationMixin<networks>;
  removeNetwork!: Sequelize.HasManyRemoveAssociationMixin<networks, networksId>;
  removeNetworks!: Sequelize.HasManyRemoveAssociationsMixin<networks, networksId>;
  hasNetwork!: Sequelize.HasManyHasAssociationMixin<networks, networksId>;
  hasNetworks!: Sequelize.HasManyHasAssociationsMixin<networks, networksId>;
  countNetworks!: Sequelize.HasManyCountAssociationsMixin;
  // chains hasMany tokens via chain_id
  tokens!: tokens[];
  getTokens!: Sequelize.HasManyGetAssociationsMixin<tokens>;
  setTokens!: Sequelize.HasManySetAssociationsMixin<tokens, tokensId>;
  addToken!: Sequelize.HasManyAddAssociationMixin<tokens, tokensId>;
  addTokens!: Sequelize.HasManyAddAssociationsMixin<tokens, tokensId>;
  createToken!: Sequelize.HasManyCreateAssociationMixin<tokens>;
  removeToken!: Sequelize.HasManyRemoveAssociationMixin<tokens, tokensId>;
  removeTokens!: Sequelize.HasManyRemoveAssociationsMixin<tokens, tokensId>;
  hasToken!: Sequelize.HasManyHasAssociationMixin<tokens, tokensId>;
  hasTokens!: Sequelize.HasManyHasAssociationsMixin<tokens, tokensId>;
  countTokens!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof chains {
    return sequelize.define('chains', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    chainId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      unique: "chains_chainId_key"
    },
    chainRpc: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    chainName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "chains_chainName_key"
    },
    chainShortName: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    chainCurrencyName: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    chainCurrencySymbol: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    chainCurrencyDecimals: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    registryAddress: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    eventsApi: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    blockScanner: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    color: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'chains',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "chains_chainId_key",
        unique: true,
        fields: [
          { name: "chainId" },
        ]
      },
      {
        name: "chains_chainName_key",
        unique: true,
        fields: [
          { name: "chainName" },
        ]
      },
      {
        name: "chains_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  }) as typeof chains;
  }
}

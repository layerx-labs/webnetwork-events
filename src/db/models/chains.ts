import * as Sequelize from 'sequelize';
import {DataTypes, Model, Optional} from 'sequelize';
import type {delegations, delegationsId} from './delegations';
import type {issues, issuesId} from './issues';
import type {networks, networksId} from './networks';
import type {tokens, tokensId} from './tokens';
import type {users_locked_registry, users_locked_registryId} from './users_locked_registry';

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
  color?: string;
  createdAt: Date;
  updatedAt: Date;
  icon?: string;
  lockAmountForNetworkCreation?: string;
  networkCreationFeePercentage?: number;
  closeFeePercentage?: number;
  cancelFeePercentage?: number;
}

export type chainsPk = "id";
export type chainsId = chains[chainsPk];
export type chainsOptionalAttributes =
  "id"
  | "chainId"
  | "registryAddress"
  | "eventsApi"
  | "blockScanner"
  | "isDefault"
  | "color"
  | "createdAt"
  | "updatedAt"
  | "icon"
  | "lockAmountForNetworkCreation"
  | "networkCreationFeePercentage"
  | "closeFeePercentage"
  | "cancelFeePercentage";
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
  color?: string;
  createdAt!: Date;
  updatedAt!: Date;
  icon?: string;
  lockAmountForNetworkCreation?: string;
  networkCreationFeePercentage?: number;
  closeFeePercentage?: number;
  cancelFeePercentage?: number;

  // chains hasMany delegations via chainId
  delegations!: delegations[];
  getDelegations!: Sequelize.HasManyGetAssociationsMixin<delegations>;
  setDelegations!: Sequelize.HasManySetAssociationsMixin<delegations, delegationsId>;
  addDelegation!: Sequelize.HasManyAddAssociationMixin<delegations, delegationsId>;
  addDelegations!: Sequelize.HasManyAddAssociationsMixin<delegations, delegationsId>;
  createDelegation!: Sequelize.HasManyCreateAssociationMixin<delegations>;
  removeDelegation!: Sequelize.HasManyRemoveAssociationMixin<delegations, delegationsId>;
  removeDelegations!: Sequelize.HasManyRemoveAssociationsMixin<delegations, delegationsId>;
  hasDelegation!: Sequelize.HasManyHasAssociationMixin<delegations, delegationsId>;
  hasDelegations!: Sequelize.HasManyHasAssociationsMixin<delegations, delegationsId>;
  countDelegations!: Sequelize.HasManyCountAssociationsMixin;
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
  // chains hasMany users_locked_registry via chainId
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
      },
      icon: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      lockAmountForNetworkCreation: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      networkCreationFeePercentage: {
        type: DataTypes.DOUBLE,
        allowNull: true
      },
      closeFeePercentage: {
        type: DataTypes.DOUBLE,
        allowNull: true
      },
      cancelFeePercentage: {
        type: DataTypes.DOUBLE,
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
            {name: "chainId"},
          ]
        },
        {
          name: "chains_chainName_key",
          unique: true,
          fields: [
            {name: "chainName"},
          ]
        },
        {
          name: "chains_pkey",
          unique: true,
          fields: [
            {name: "id"},
          ]
        },
      ]
    }) as typeof chains;
  }
}

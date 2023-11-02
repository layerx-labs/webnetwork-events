import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { chains, chainsId } from './chains';
import type { issues, issuesId } from './issues';
import type { network_tokens, network_tokensId } from './network_tokens';
import type { networks, networksId } from './networks';
import type { users_locked_registry, users_locked_registryId } from './users_locked_registry';

export interface tokensAttributes {
  id: number;
  name: string;
  symbol: string;
  address: string;
  isTransactional: boolean;
  isAllowed?: boolean;
  chain_id?: number;
  minimum?: string;
  last_price_used?: object;
  icon?: string;
  isReward: boolean;
}

export type tokensPk = "id";
export type tokensId = tokens[tokensPk];
export type tokensOptionalAttributes = "id" | "isAllowed" | "chain_id" | "minimum" | "last_price_used" | "icon";
export type tokensCreationAttributes = Optional<tokensAttributes, tokensOptionalAttributes>;

export class tokens extends Model<tokensAttributes, tokensCreationAttributes> implements tokensAttributes {
  id!: number;
  name!: string;
  symbol!: string;
  address!: string;
  isTransactional!: boolean;
  isAllowed?: boolean;
  chain_id?: number;
  minimum?: string;
  last_price_used?: object;
  icon?: string;
  isReward!: boolean;

  // tokens belongsTo chains via chain_id
  chain!: chains;
  getChain!: Sequelize.BelongsToGetAssociationMixin<chains>;
  setChain!: Sequelize.BelongsToSetAssociationMixin<chains, chainsId>;
  createChain!: Sequelize.BelongsToCreateAssociationMixin<chains>;
  // tokens hasMany issues via rewardTokenId
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
  // tokens hasMany issues via transactionalTokenId
  transactionalToken_issues!: issues[];
  getTransactionalToken_issues!: Sequelize.HasManyGetAssociationsMixin<issues>;
  setTransactionalToken_issues!: Sequelize.HasManySetAssociationsMixin<issues, issuesId>;
  addTransactionalToken_issue!: Sequelize.HasManyAddAssociationMixin<issues, issuesId>;
  addTransactionalToken_issues!: Sequelize.HasManyAddAssociationsMixin<issues, issuesId>;
  createTransactionalToken_issue!: Sequelize.HasManyCreateAssociationMixin<issues>;
  removeTransactionalToken_issue!: Sequelize.HasManyRemoveAssociationMixin<issues, issuesId>;
  removeTransactionalToken_issues!: Sequelize.HasManyRemoveAssociationsMixin<issues, issuesId>;
  hasTransactionalToken_issue!: Sequelize.HasManyHasAssociationMixin<issues, issuesId>;
  hasTransactionalToken_issues!: Sequelize.HasManyHasAssociationsMixin<issues, issuesId>;
  countTransactionalToken_issues!: Sequelize.HasManyCountAssociationsMixin;
  // tokens hasMany network_tokens via tokenId
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
  // tokens hasMany networks via network_token_id
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
  // tokens hasMany users_locked_registry via tokenId
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

  static initModel(sequelize: Sequelize.Sequelize): typeof tokens {
    return sequelize.define('tokens', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    symbol: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    isTransactional: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    isAllowed: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    chain_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'chains',
        key: 'chainId'
      }
    },
    minimum: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: "0"
    },
    isReward: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    last_price_used: {
      type: DataTypes.JSON,
      allowNull: true
    },
    icon: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
  }, {
    tableName: 'tokens',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tokens_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  }) as typeof tokens;
  }
}

import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { chains, chainsId } from './chains';
import type { curators, curatorsId } from './curators';
import type { delegations, delegationsId } from './delegations';
import type { issues, issuesId } from './issues';
import type { merge_proposals, merge_proposalsId } from './merge_proposals';
import type { network_tokens, network_tokensId } from './network_tokens';
import type { repositories, repositoriesId } from './repositories';
import type { tokens, tokensId } from './tokens';

export interface networksAttributes {
  id: number;
  creatorAddress: string;
  name?: string;
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
  isDefault?: boolean;
  chain_id?: number;
  network_token_id?: number;
  councilAmount?: string;
  disputableTime?: number;
  draftTime?: number;
  oracleExchangeRate?: number;
  mergeCreatorFeeShare?: number;
  percentageNeededForDispute?: number;
  cancelableTime?: number;
  proposerFeeShare?: number;
  allowMerge?: boolean;
}

export type networksPk = "id";
export type networksId = networks[networksPk];
export type networksOptionalAttributes = "id" | "name" | "colors" | "networkAddress" | "logoIcon" | "fullLogo" | "createdAt" | "updatedAt" | "isClosed" | "allowCustomTokens" | "councilMembers" | "isRegistered" | "isDefault" | "chain_id" | "network_token_id" | "councilAmount" | "disputableTime" | "draftTime" | "oracleExchangeRate" | "mergeCreatorFeeShare" | "percentageNeededForDispute" | "cancelableTime" | "proposerFeeShare" | "allowMerge";
export type networksCreationAttributes = Optional<networksAttributes, networksOptionalAttributes>;

export class networks extends Model<networksAttributes, networksCreationAttributes> implements networksAttributes {
  id!: number;
  creatorAddress!: string;
  name?: string;
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
  isDefault?: boolean;
  chain_id?: number;
  network_token_id?: number;
  councilAmount?: string;
  disputableTime?: number;
  draftTime?: number;
  oracleExchangeRate?: number;
  mergeCreatorFeeShare?: number;
  percentageNeededForDispute?: number;
  cancelableTime?: number;
  proposerFeeShare?: number;
  allowMerge?: boolean;

  // networks belongsTo chains via chain_id
  chain!: chains;
  getChain!: Sequelize.BelongsToGetAssociationMixin<chains>;
  setChain!: Sequelize.BelongsToSetAssociationMixin<chains, chainsId>;
  createChain!: Sequelize.BelongsToCreateAssociationMixin<chains>;
  // networks hasMany curators via networkId
  curators!: curators[];
  getCurators!: Sequelize.HasManyGetAssociationsMixin<curators>;
  setCurators!: Sequelize.HasManySetAssociationsMixin<curators, curatorsId>;
  addCurator!: Sequelize.HasManyAddAssociationMixin<curators, curatorsId>;
  addCurators!: Sequelize.HasManyAddAssociationsMixin<curators, curatorsId>;
  createCurator!: Sequelize.HasManyCreateAssociationMixin<curators>;
  removeCurator!: Sequelize.HasManyRemoveAssociationMixin<curators, curatorsId>;
  removeCurators!: Sequelize.HasManyRemoveAssociationsMixin<curators, curatorsId>;
  hasCurator!: Sequelize.HasManyHasAssociationMixin<curators, curatorsId>;
  hasCurators!: Sequelize.HasManyHasAssociationsMixin<curators, curatorsId>;
  countCurators!: Sequelize.HasManyCountAssociationsMixin;
  // networks hasMany delegations via networkId
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
  // networks hasMany merge_proposals via network_id
  merge_proposals!: merge_proposals[];
  getMerge_proposals!: Sequelize.HasManyGetAssociationsMixin<merge_proposals>;
  setMerge_proposals!: Sequelize.HasManySetAssociationsMixin<merge_proposals, merge_proposalsId>;
  addMerge_proposal!: Sequelize.HasManyAddAssociationMixin<merge_proposals, merge_proposalsId>;
  addMerge_proposals!: Sequelize.HasManyAddAssociationsMixin<merge_proposals, merge_proposalsId>;
  createMerge_proposal!: Sequelize.HasManyCreateAssociationMixin<merge_proposals>;
  removeMerge_proposal!: Sequelize.HasManyRemoveAssociationMixin<merge_proposals, merge_proposalsId>;
  removeMerge_proposals!: Sequelize.HasManyRemoveAssociationsMixin<merge_proposals, merge_proposalsId>;
  hasMerge_proposal!: Sequelize.HasManyHasAssociationMixin<merge_proposals, merge_proposalsId>;
  hasMerge_proposals!: Sequelize.HasManyHasAssociationsMixin<merge_proposals, merge_proposalsId>;
  countMerge_proposals!: Sequelize.HasManyCountAssociationsMixin;
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
  // networks belongsTo tokens via network_token_id
  network_token_token!: tokens;
  getNetwork_token_token!: Sequelize.BelongsToGetAssociationMixin<tokens>;
  setNetwork_token_token!: Sequelize.BelongsToSetAssociationMixin<tokens, tokensId>;
  createNetwork_token_token!: Sequelize.BelongsToCreateAssociationMixin<tokens>;

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
      allowNull: true,
      unique: "network_chain_unique"
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
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    chain_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'chains',
        key: 'chainId'
      },
      unique: "network_chain_unique"
    },
    network_token_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tokens',
        key: 'id'
      }
    },
    councilAmount: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    disputableTime: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    draftTime: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    oracleExchangeRate: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    mergeCreatorFeeShare: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    percentageNeededForDispute: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    cancelableTime: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    proposerFeeShare: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    allowMerge: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    }
  }, {
    tableName: 'networks',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "network_chain_unique",
        unique: true,
        fields: [
          { name: "name" },
          { name: "chain_id" },
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

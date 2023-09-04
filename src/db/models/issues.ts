import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { benefactors, benefactorsId } from './benefactors';
import type { chains, chainsId } from './chains';
import type { developers, developersId } from './developers';
import type { disputes, disputesId } from './disputes';
import type { merge_proposals, merge_proposalsId } from './merge_proposals';
import type { networks, networksId } from './networks';
import type { repositories, repositoriesId } from './repositories';
import type { tokens, tokensId } from './tokens';
import type { users_payments, users_paymentsId } from './users_payments';
import { deliverableId, deliverables } from './deliverables';

export interface issuesAttributes {
  id: number;
  issueId?: string;
  githubId?: string;
  state?: string;
  createdAt: Date;
  updatedAt: Date;
  creatorAddress?: string;
  creatorGithub?: string;
  amount?: string;
  repository_id?: number;
  working?: string[];
  merged?: string;
  title?: string;
  body?: string;
  seoImage?: string;
  branch?: string;
  network_id?: number;
  contractId?: number;
  transactionalTokenId?: number;
  fundingAmount?: string;
  fundedAmount?: string;
  fundedAt?: Date;
  isKyc?: boolean;
  kycTierList?: number[];
  chain_id?: number;
  tags?: string[];
  rewardAmount?: string;
  rewardTokenId?: number;
  visible?: boolean;
  contractCreationDate?: string;
  nftImage?: string;
}

export type issuesPk = "id";
export type issuesId = issues[issuesPk];
export type issuesOptionalAttributes = "id" | "issueId" | "githubId" | "state" | "createdAt" | "updatedAt" | "creatorAddress" | "creatorGithub" | "amount" | "repository_id" | "working" | "merged" | "title" | "body" | "seoImage" | "branch" | "network_id" | "contractId" | "transactionalTokenId" | "fundingAmount" | "fundedAmount" | "fundedAt" | "isKyc" | "kycTierList" | "chain_id" | "tags" | "rewardAmount" | "rewardTokenId" | "visible" | "contractCreationDate" | "nftImage";
export type issuesCreationAttributes = Optional<issuesAttributes, issuesOptionalAttributes>;

export class issues extends Model<issuesAttributes, issuesCreationAttributes> implements issuesAttributes {
  id!: number;
  issueId?: string;
  githubId?: string;
  state?: string;
  createdAt!: Date;
  updatedAt!: Date;
  creatorAddress?: string;
  creatorGithub?: string;
  amount?: string;
  repository_id?: number;
  working?: string[];
  merged?: string;
  title?: string;
  body?: string;
  seoImage?: string;
  branch?: string;
  network_id?: number;
  contractId?: number;
  transactionalTokenId?: number;
  fundingAmount?: string;
  fundedAmount?: string;
  fundedAt?: Date;
  isKyc?: boolean;
  kycTierList?: number[];
  chain_id?: number;
  tags?: string[];
  rewardAmount?: string;
  rewardTokenId?: number;
  visible?: boolean;
  contractCreationDate?: string;
  nftImage?: string;

  // issues belongsTo chains via chain_id
  chain!: chains;
  getChain!: Sequelize.BelongsToGetAssociationMixin<chains>;
  setChain!: Sequelize.BelongsToSetAssociationMixin<chains, chainsId>;
  createChain!: Sequelize.BelongsToCreateAssociationMixin<chains>;
  // issues hasMany benefactors via issueId
  benefactors!: benefactors[];
  getBenefactors!: Sequelize.HasManyGetAssociationsMixin<benefactors>;
  setBenefactors!: Sequelize.HasManySetAssociationsMixin<benefactors, benefactorsId>;
  addBenefactor!: Sequelize.HasManyAddAssociationMixin<benefactors, benefactorsId>;
  addBenefactors!: Sequelize.HasManyAddAssociationsMixin<benefactors, benefactorsId>;
  createBenefactor!: Sequelize.HasManyCreateAssociationMixin<benefactors>;
  removeBenefactor!: Sequelize.HasManyRemoveAssociationMixin<benefactors, benefactorsId>;
  removeBenefactors!: Sequelize.HasManyRemoveAssociationsMixin<benefactors, benefactorsId>;
  hasBenefactor!: Sequelize.HasManyHasAssociationMixin<benefactors, benefactorsId>;
  hasBenefactors!: Sequelize.HasManyHasAssociationsMixin<benefactors, benefactorsId>;
  countBenefactors!: Sequelize.HasManyCountAssociationsMixin;
  // issues hasMany developers via issueId
  developers!: developers[];
  getDevelopers!: Sequelize.HasManyGetAssociationsMixin<developers>;
  setDevelopers!: Sequelize.HasManySetAssociationsMixin<developers, developersId>;
  addDeveloper!: Sequelize.HasManyAddAssociationMixin<developers, developersId>;
  addDevelopers!: Sequelize.HasManyAddAssociationsMixin<developers, developersId>;
  createDeveloper!: Sequelize.HasManyCreateAssociationMixin<developers>;
  removeDeveloper!: Sequelize.HasManyRemoveAssociationMixin<developers, developersId>;
  removeDevelopers!: Sequelize.HasManyRemoveAssociationsMixin<developers, developersId>;
  hasDeveloper!: Sequelize.HasManyHasAssociationMixin<developers, developersId>;
  hasDevelopers!: Sequelize.HasManyHasAssociationsMixin<developers, developersId>;
  countDevelopers!: Sequelize.HasManyCountAssociationsMixin;
  // issues hasMany disputes via issueId
  disputes!: disputes[];
  getDisputes!: Sequelize.HasManyGetAssociationsMixin<disputes>;
  setDisputes!: Sequelize.HasManySetAssociationsMixin<disputes, disputesId>;
  addDispute!: Sequelize.HasManyAddAssociationMixin<disputes, disputesId>;
  addDisputes!: Sequelize.HasManyAddAssociationsMixin<disputes, disputesId>;
  createDispute!: Sequelize.HasManyCreateAssociationMixin<disputes>;
  removeDispute!: Sequelize.HasManyRemoveAssociationMixin<disputes, disputesId>;
  removeDisputes!: Sequelize.HasManyRemoveAssociationsMixin<disputes, disputesId>;
  hasDispute!: Sequelize.HasManyHasAssociationMixin<disputes, disputesId>;
  hasDisputes!: Sequelize.HasManyHasAssociationsMixin<disputes, disputesId>;
  countDisputes!: Sequelize.HasManyCountAssociationsMixin;
  // issues hasMany merge_proposals via issueId
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
  // issues hasMany deliverables via issueId
  deliverables!: deliverables[]; 
  getDeliverables!: Sequelize.HasManyGetAssociationsMixin<deliverables>;
  setDeliverables!: Sequelize.HasManySetAssociationsMixin<deliverables, deliverableId>;
  addDeliverable!: Sequelize.HasManyAddAssociationMixin<deliverables, deliverableId>;
  addDeliverables!: Sequelize.HasManyAddAssociationsMixin<deliverables, deliverableId>;
  createDeliverable!: Sequelize.HasManyCreateAssociationMixin<deliverables>;
  removeDeliverable!: Sequelize.HasManyRemoveAssociationMixin<deliverables, deliverableId>;
  removeDeliverables!: Sequelize.HasManyRemoveAssociationsMixin<deliverables, deliverableId>;
  hasDeliverable!: Sequelize.HasManyHasAssociationMixin<deliverables, deliverableId>;
  hasDeliverables!: Sequelize.HasManyHasAssociationsMixin<deliverables, deliverableId>;
  countDeliverables!: Sequelize.HasManyCountAssociationsMixin;
  // issues hasMany users_payments via issueId
  users_payments!: users_payments[];
  getUsers_payments!: Sequelize.HasManyGetAssociationsMixin<users_payments>;
  setUsers_payments!: Sequelize.HasManySetAssociationsMixin<users_payments, users_paymentsId>;
  addUsers_payment!: Sequelize.HasManyAddAssociationMixin<users_payments, users_paymentsId>;
  addUsers_payments!: Sequelize.HasManyAddAssociationsMixin<users_payments, users_paymentsId>;
  createUsers_payment!: Sequelize.HasManyCreateAssociationMixin<users_payments>;
  removeUsers_payment!: Sequelize.HasManyRemoveAssociationMixin<users_payments, users_paymentsId>;
  removeUsers_payments!: Sequelize.HasManyRemoveAssociationsMixin<users_payments, users_paymentsId>;
  hasUsers_payment!: Sequelize.HasManyHasAssociationMixin<users_payments, users_paymentsId>;
  hasUsers_payments!: Sequelize.HasManyHasAssociationsMixin<users_payments, users_paymentsId>;
  countUsers_payments!: Sequelize.HasManyCountAssociationsMixin;
  // issues belongsTo networks via network_id
  network!: networks;
  getNetwork!: Sequelize.BelongsToGetAssociationMixin<networks>;
  setNetwork!: Sequelize.BelongsToSetAssociationMixin<networks, networksId>;
  createNetwork!: Sequelize.BelongsToCreateAssociationMixin<networks>;
  // issues belongsTo repositories via repository_id
  repository!: repositories;
  getRepository!: Sequelize.BelongsToGetAssociationMixin<repositories>;
  setRepository!: Sequelize.BelongsToSetAssociationMixin<repositories, repositoriesId>;
  createRepository!: Sequelize.BelongsToCreateAssociationMixin<repositories>;
  // issues belongsTo tokens via rewardTokenId
  rewardToken!: tokens;
  getRewardToken!: Sequelize.BelongsToGetAssociationMixin<tokens>;
  setRewardToken!: Sequelize.BelongsToSetAssociationMixin<tokens, tokensId>;
  createRewardToken!: Sequelize.BelongsToCreateAssociationMixin<tokens>;
  // issues belongsTo tokens via transactionalTokenId
  transactionalToken!: tokens;
  getTransactionalToken!: Sequelize.BelongsToGetAssociationMixin<tokens>;
  setTransactionalToken!: Sequelize.BelongsToSetAssociationMixin<tokens, tokensId>;
  createTransactionalToken!: Sequelize.BelongsToCreateAssociationMixin<tokens>;

  static initModel(sequelize: Sequelize.Sequelize): typeof issues {
    return sequelize.define('issues', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    issueId: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    githubId: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    state: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    creatorAddress: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    creatorGithub: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    amount: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    repository_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'repositories',
        key: 'id'
      }
    },
    working: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: ["(ARRAY[]"]
    },
    merged: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    seoImage: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    branch: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    network_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'networks',
        key: 'id'
      }
    },
    contractId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    transactionalTokenId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tokens',
        key: 'id'
      }
    },
    fundingAmount: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: "0"
    },
    fundedAmount: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: "0"
    },
    fundedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isKyc: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    kycTierList: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
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
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true
    },
    rewardAmount: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: "0"
    },
    rewardTokenId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tokens',
        key: 'id'
      }
    },
    visible: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    },
    contractCreationDate: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    nftImage: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'issues',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "issues_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  }) as typeof issues;
  }
}

import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { issues, issuesId } from './issues';
import type { networks, networksId } from './networks';
import type { pull_requests, pull_requestsId } from './pull_requests';

export interface merge_proposalsAttributes {
  id: number;
  issueId?: number;
  pullRequestId?: number;
  createdAt: Date;
  updatedAt: Date;
  githubLogin?: string;
  contractId?: number;
  creator?: string;
  network_id?: number;
}

export type merge_proposalsPk = "id";
export type merge_proposalsId = merge_proposals[merge_proposalsPk];
export type merge_proposalsOptionalAttributes = "id" | "issueId" | "pullRequestId" | "createdAt" | "updatedAt" | "githubLogin" | "contractId" | "creator" | "network_id";
export type merge_proposalsCreationAttributes = Optional<merge_proposalsAttributes, merge_proposalsOptionalAttributes>;

export class merge_proposals extends Model<merge_proposalsAttributes, merge_proposalsCreationAttributes> implements merge_proposalsAttributes {
  id!: number;
  issueId?: number;
  pullRequestId?: number;
  createdAt!: Date;
  updatedAt!: Date;
  githubLogin?: string;
  contractId?: number;
  creator?: string;
  network_id?: number;

  // merge_proposals belongsTo issues via issueId
  issue!: issues;
  getIssue!: Sequelize.BelongsToGetAssociationMixin<issues>;
  setIssue!: Sequelize.BelongsToSetAssociationMixin<issues, issuesId>;
  createIssue!: Sequelize.BelongsToCreateAssociationMixin<issues>;
  // merge_proposals belongsTo networks via network_id
  network!: networks;
  getNetwork!: Sequelize.BelongsToGetAssociationMixin<networks>;
  setNetwork!: Sequelize.BelongsToSetAssociationMixin<networks, networksId>;
  createNetwork!: Sequelize.BelongsToCreateAssociationMixin<networks>;
  // merge_proposals belongsTo pull_requests via pullRequestId
  pullRequest!: pull_requests;
  getPullRequest!: Sequelize.BelongsToGetAssociationMixin<pull_requests>;
  setPullRequest!: Sequelize.BelongsToSetAssociationMixin<pull_requests, pull_requestsId>;
  createPullRequest!: Sequelize.BelongsToCreateAssociationMixin<pull_requests>;

  static initModel(sequelize: Sequelize.Sequelize): typeof merge_proposals {
    return sequelize.define('merge_proposals', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    issueId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'issues',
        key: 'id'
      }
    },
    pullRequestId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'pull_requests',
        key: 'id'
      }
    },
    githubLogin: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    contractId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    creator: {
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
    }
  }, {
    tableName: 'merge_proposals',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "merge_proposals_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  }) as typeof merge_proposals;
  }
}

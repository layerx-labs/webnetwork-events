import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { issues, issuesId } from './issues';
import type { merge_proposals, merge_proposalsId } from './merge_proposals';

export interface deliverableAttributes {
  id: number;
  deliverableUrl: string;
  ipfsLink: string;
  title: string;
  description: string;
  canceled: boolean;
  markedReadyForReview: boolean;
  accepted: boolean;
  issueId: number;
  prContractId?: number;
  bountyId?: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export type deliverablePk = "id";
export type deliverableId = deliverables[deliverablePk];
export type deliverableOptionalAttributes = "id" | "bountyId" | "prContractId" | "canceled" | "markedReadyForReview" | "accepted" | "createdAt" | "updatedAt";
export type deliverableCreationAttributes = Optional<deliverableAttributes, deliverableOptionalAttributes>;

export class deliverables extends Model<deliverableAttributes, deliverableCreationAttributes> implements deliverableAttributes {
  id!: number;
  deliverableUrl!: string;
  ipfsLink!: string;
  title!: string;
  description!: string;
  canceled: boolean;
  markedReadyForReview: boolean;
  accepted: boolean;
  issueId!: number;
  prContractId?: number;
  bountyId?: number;
  userId!: number;
  createdAt!: Date;
  updatedAt!: Date;
  // deliverables belongsTo issues via issueId
  issue!: issues;
  getIssue!: Sequelize.BelongsToGetAssociationMixin<issues>;
  setIssue!: Sequelize.BelongsToSetAssociationMixin<issues, issuesId>;
  createIssue!: Sequelize.BelongsToCreateAssociationMixin<issues>;
  // deliverables hasMany merge_proposals via deliverableId
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

  static initModel(sequelize: Sequelize.Sequelize): typeof deliverables {
    return sequelize.define('deliverables', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    deliverableUrl: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    ipfsLink: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    title: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    canceled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    markedReadyForReview: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    accepted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    issueId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'issues',
        key: 'id'
      }
    },
    prContractId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    bountyId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'deliverables',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "deliverables_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  }) as typeof deliverables;
  }
}
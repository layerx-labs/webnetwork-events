import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { comments, commentsId } from './comments';
import type { issues, issuesId } from './issues';
import type { merge_proposals, merge_proposalsId } from './merge_proposals';
import type { users, usersId } from './users';

export interface deliverablesAttributes {
  id: number;
  deliverableUrl: string;
  ipfsLink: string;
  title: string;
  description: string;
  canceled?: boolean;
  markedReadyForReview?: boolean;
  accepted?: boolean;
  issueId?: number;
  bountyId?: number;
  prContractId?: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export type deliverablesPk = "id";
export type deliverablesId = deliverables[deliverablesPk];
export type deliverablesOptionalAttributes = "id" | "canceled" | "markedReadyForReview" | "accepted" | "issueId" | "bountyId" | "prContractId" | "createdAt" | "updatedAt";
export type deliverablesCreationAttributes = Optional<deliverablesAttributes, deliverablesOptionalAttributes>;

export class deliverables extends Model<deliverablesAttributes, deliverablesCreationAttributes> implements deliverablesAttributes {
  id!: number;
  deliverableUrl!: string;
  ipfsLink!: string;
  title!: string;
  description!: string;
  canceled?: boolean;
  markedReadyForReview?: boolean;
  accepted?: boolean;
  issueId?: number;
  bountyId?: number;
  prContractId?: number;
  userId!: number;
  createdAt!: Date;
  updatedAt!: Date;

  // deliverables hasMany comments via deliverableId
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
  // deliverables belongsTo issues via issueId
  issue!: issues;
  getIssue!: Sequelize.BelongsToGetAssociationMixin<issues>;
  setIssue!: Sequelize.BelongsToSetAssociationMixin<issues, issuesId>;
  createIssue!: Sequelize.BelongsToCreateAssociationMixin<issues>;
  // deliverables belongsTo users via userId
  user!: users;
  getUser!: Sequelize.BelongsToGetAssociationMixin<users>;
  setUser!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createUser!: Sequelize.BelongsToCreateAssociationMixin<users>;

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
      allowNull: true,
      defaultValue: false
    },
    markedReadyForReview: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    accepted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    issueId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'issues',
        key: 'id'
      }
    },
    bountyId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    prContractId: {
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

import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { deliverables, deliverablesId } from './deliverables';
import type { issues, issuesId } from './issues';
import type { merge_proposals, merge_proposalsId } from './merge_proposals';
import type { users, usersId } from './users';

export interface commentsAttributes {
  id: number;
  comment: string;
  hidden?: boolean;
  type: string;
  issueId: number;
  proposalId?: number;
  userId: number;
  userAddress: string;
  replyId?: number;
  createdAt: Date;
  updatedAt: Date;
  deliverableId?: number;
}

export type commentsPk = "id";
export type commentsId = comments[commentsPk];
export type commentsOptionalAttributes = "id" | "hidden" | "proposalId" | "replyId" | "createdAt" | "updatedAt" | "deliverableId";
export type commentsCreationAttributes = Optional<commentsAttributes, commentsOptionalAttributes>;

export class comments extends Model<commentsAttributes, commentsCreationAttributes> implements commentsAttributes {
  id!: number;
  comment!: string;
  hidden?: boolean;
  type!: string;
  issueId!: number;
  proposalId?: number;
  userId!: number;
  userAddress!: string;
  replyId?: number;
  createdAt!: Date;
  updatedAt!: Date;
  deliverableId?: number;

  // comments belongsTo comments via replyId
  reply!: comments;
  getReply!: Sequelize.BelongsToGetAssociationMixin<comments>;
  setReply!: Sequelize.BelongsToSetAssociationMixin<comments, commentsId>;
  createReply!: Sequelize.BelongsToCreateAssociationMixin<comments>;
  // comments belongsTo deliverables via deliverableId
  deliverable!: deliverables;
  getDeliverable!: Sequelize.BelongsToGetAssociationMixin<deliverables>;
  setDeliverable!: Sequelize.BelongsToSetAssociationMixin<deliverables, deliverablesId>;
  createDeliverable!: Sequelize.BelongsToCreateAssociationMixin<deliverables>;
  // comments belongsTo issues via issueId
  issue!: issues;
  getIssue!: Sequelize.BelongsToGetAssociationMixin<issues>;
  setIssue!: Sequelize.BelongsToSetAssociationMixin<issues, issuesId>;
  createIssue!: Sequelize.BelongsToCreateAssociationMixin<issues>;
  // comments belongsTo merge_proposals via proposalId
  proposal!: merge_proposals;
  getProposal!: Sequelize.BelongsToGetAssociationMixin<merge_proposals>;
  setProposal!: Sequelize.BelongsToSetAssociationMixin<merge_proposals, merge_proposalsId>;
  createProposal!: Sequelize.BelongsToCreateAssociationMixin<merge_proposals>;
  // comments belongsTo users via userId
  user!: users;
  getUser!: Sequelize.BelongsToGetAssociationMixin<users>;
  setUser!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createUser!: Sequelize.BelongsToCreateAssociationMixin<users>;

  static initModel(sequelize: Sequelize.Sequelize): typeof comments {
    return sequelize.define('comments', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    hidden: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    type: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    issueId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'issues',
        key: 'id'
      }
    },
    proposalId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'merge_proposals',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    userAddress: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    replyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'comments',
        key: 'id'
      }
    },
    deliverableId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'deliverables',
        key: 'id'
      }
    }
  }, {
    tableName: 'comments',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "comments_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  }) as typeof comments;
  }
}

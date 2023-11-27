import * as Sequelize from 'sequelize';
import {DataTypes, Model, Optional} from 'sequelize';
import type {issues, issuesId} from './issues';
import type {merge_proposals, merge_proposalsId} from './merge_proposals';

export interface disputesAttributes {
  id: number;
  issueId: number;
  address: string;
  proposalId: number;
  weight?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type disputesPk = "id";
export type disputesId = disputes[disputesPk];
export type disputesOptionalAttributes = "id" | "weight" | "createdAt" | "updatedAt";
export type disputesCreationAttributes = Optional<disputesAttributes, disputesOptionalAttributes>;

export class disputes extends Model<disputesAttributes, disputesCreationAttributes> implements disputesAttributes {
  id!: number;
  issueId!: number;
  address!: string;
  proposalId!: number;
  weight?: string;
  createdAt!: Date;
  updatedAt!: Date;

  // disputes belongsTo issues via issueId
  issue!: issues;
  getIssue!: Sequelize.BelongsToGetAssociationMixin<issues>;
  setIssue!: Sequelize.BelongsToSetAssociationMixin<issues, issuesId>;
  createIssue!: Sequelize.BelongsToCreateAssociationMixin<issues>;
  // disputes belongsTo merge_proposals via proposalId
  proposal!: merge_proposals;
  getProposal!: Sequelize.BelongsToGetAssociationMixin<merge_proposals>;
  setProposal!: Sequelize.BelongsToSetAssociationMixin<merge_proposals, merge_proposalsId>;
  createProposal!: Sequelize.BelongsToCreateAssociationMixin<merge_proposals>;

  static initModel(sequelize: Sequelize.Sequelize): typeof disputes {
    return sequelize.define('disputes', {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      issueId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'issues',
          key: 'id'
        }
      },
      address: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      proposalId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'merge_proposals',
          key: 'id'
        }
      },
      weight: {
        type: DataTypes.STRING(255),
        allowNull: true
      }
    }, {
      tableName: 'disputes',
      schema: 'public',
      timestamps: true,
      indexes: [
        {
          name: "disputes_pkey",
          unique: true,
          fields: [
            {name: "id"},
          ]
        },
      ]
    }) as typeof disputes;
  }
}

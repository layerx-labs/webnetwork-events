import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import { issues, issuesId } from './issues';
import { merge_proposals, merge_proposalsId } from './merge_proposals';

export interface disputeAttributes {
  id: number;
  issueId: number;
  address: string;
  proposalId: number;
  weight?: string;
}

export type disputePk = "id";
export type disputeId = disputes[disputePk];
export type disputeOptionalAttributes = "id";
export type disputeCreationAttributes = Optional<disputeAttributes, disputeOptionalAttributes>;

export class disputes extends Model<disputeAttributes, disputeCreationAttributes> implements disputeAttributes {
  proposalId!: number;
  address!: string;
  issueId!: number;
  weight: string;
  id!: number;

  // disputes hasMany issue via issueId
  issue!: issues;
  getIssue!: Sequelize.BelongsToGetAssociationMixin<issues>;
  setIssue!: Sequelize.BelongsToSetAssociationMixin<issues, issuesId>;
  createIssue!: Sequelize.BelongsToCreateAssociationMixin<issues>;

  // disputes hasMany merge_proposals via proposalId
  merge_proposal!: merge_proposals;
  getMerge_proposal!: Sequelize.BelongsToGetAssociationMixin<merge_proposals>;
  setMerge_proposal!: Sequelize.BelongsToSetAssociationMixin<merge_proposals, merge_proposalsId>;
  createMerge_proposal!: Sequelize.BelongsToCreateAssociationMixin<merge_proposals>;

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
        model: "issue",
        key: "id"
      }
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false
    },    
    proposalId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "mergeProposal",
          key: "id"
        }
    },    
    weight: {
        type: DataTypes.STRING,
        allowNull: true,
      },
  }, {
    tableName: 'disputes',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "disputes_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  }) as typeof disputes;
  }
}
import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import { merge_proposals, merge_proposalsId } from './merge_proposals';

export interface proposalDistributionsAttributes {
  id: number;
  address: string;
  percentage: number;
  proposalId: number;
  createdAt: Date;
  updatedAt: Date;
}

export type proposalDistributionsPk = "id";
export type proposalDistributionsId = proposalDistributions[proposalDistributionsPk];
export type proposalDistributionsOptionalAttributes = "id" | "createdAt" | "updatedAt";
export type proposalDistributionsCreationAttributes = Optional<proposalDistributionsAttributes, proposalDistributionsOptionalAttributes>;

export class proposalDistributions extends Model<proposalDistributionsAttributes, proposalDistributionsCreationAttributes> implements proposalDistributionsAttributes {
  id!: number;
  address!: string;
  percentage!: number;
  proposalId!: number;
  createdAt!: Date;
  updatedAt!: Date;

  // proposal distributions belongsTo proposal via proposalId
  proposal!: merge_proposals;
  getProposal!: Sequelize.BelongsToGetAssociationMixin<merge_proposals>;
  setProposal!: Sequelize.BelongsToSetAssociationMixin<merge_proposals, merge_proposalsId>;
  createProposal!: Sequelize.BelongsToCreateAssociationMixin<merge_proposals>;

  static initModel(sequelize: Sequelize.Sequelize): typeof proposalDistributions {
    return sequelize.define('proposal_distributions', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    percentage: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    proposalId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'merge_proposals',
        key: 'id'
      }
    }
  }, {
    tableName: 'proposal_distributions',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "proposal_distributions_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  }) as typeof proposalDistributions;
  }
}

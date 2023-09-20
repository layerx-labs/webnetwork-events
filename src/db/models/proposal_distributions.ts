import * as Sequelize from 'sequelize';
import {DataTypes, Model, Optional} from 'sequelize';
import type {merge_proposals, merge_proposalsId} from './merge_proposals';

export interface proposal_distributionsAttributes {
  id: number;
  recipient: string;
  percentage: number;
  proposalId: number;
  createdAt: Date;
  updatedAt: Date;
}

export type proposal_distributionsPk = "id";
export type proposal_distributionsId = proposal_distributions[proposal_distributionsPk];
export type proposal_distributionsOptionalAttributes = "id" | "createdAt" | "updatedAt";
export type proposal_distributionsCreationAttributes = Optional<proposal_distributionsAttributes, proposal_distributionsOptionalAttributes>;

export class proposal_distributions extends Model<proposal_distributionsAttributes, proposal_distributionsCreationAttributes> implements proposal_distributionsAttributes {
  id!: number;
  recipient!: string;
  percentage!: number;
  proposalId!: number;
  createdAt!: Date;
  updatedAt!: Date;

  // proposal_distributions belongsTo merge_proposals via proposalId
  proposal!: merge_proposals;
  getProposal!: Sequelize.BelongsToGetAssociationMixin<merge_proposals>;
  setProposal!: Sequelize.BelongsToSetAssociationMixin<merge_proposals, merge_proposalsId>;
  createProposal!: Sequelize.BelongsToCreateAssociationMixin<merge_proposals>;

  static initModel(sequelize: Sequelize.Sequelize): typeof proposal_distributions {
    return sequelize.define('proposal_distributions', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    recipient: {
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
  }) as typeof proposal_distributions;
  }
}

import * as Sequelize from 'sequelize';
import {DataTypes, Model, Optional} from 'sequelize';
import type {issues, issuesId} from './issues';

export interface benefactorsAttributes {
  id: number;
  amount: string;
  address: string;
  contractId: number;
  issueId: number;
  createdAt: Date;
  updatedAt: Date;
  withdrawn?: boolean;
}

export type benefactorsPk = "id";
export type benefactorsId = benefactors[benefactorsPk];
export type benefactorsOptionalAttributes = "id" | "createdAt" | "updatedAt" | "withdrawn";
export type benefactorsCreationAttributes = Optional<benefactorsAttributes, benefactorsOptionalAttributes>;

export class benefactors extends Model<benefactorsAttributes, benefactorsCreationAttributes> implements benefactorsAttributes {
  id!: number;
  amount!: string;
  address!: string;
  contractId!: number;
  issueId!: number;
  createdAt!: Date;
  updatedAt!: Date;
  withdrawn?: boolean;

  // benefactors belongsTo issues via issueId
  issue!: issues;
  getIssue!: Sequelize.BelongsToGetAssociationMixin<issues>;
  setIssue!: Sequelize.BelongsToSetAssociationMixin<issues, issuesId>;
  createIssue!: Sequelize.BelongsToCreateAssociationMixin<issues>;

  static initModel(sequelize: Sequelize.Sequelize): typeof benefactors {
    return sequelize.define('benefactors', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    amount: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    contractId: {
      type: DataTypes.INTEGER,
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
    withdrawn: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    }
  }, {
    tableName: 'benefactors',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "benefactors_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  }) as typeof benefactors;
  }
}

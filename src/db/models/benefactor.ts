import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import { issues, issuesId } from './issues';

export interface benefactorAttributes {
  id: number;
  amount: string;
  address: string;
  contractId: number;
  issueId: number;
}

export type benefactorPk = "id";
export type benefactorId = benefactors[benefactorPk];
export type benefactorOptionalAttributes = "id";
export type benefactorCreationAttributes = Optional<benefactorAttributes, benefactorOptionalAttributes>;

export class benefactors extends Model<benefactorAttributes, benefactorCreationAttributes> implements benefactorAttributes {
  amount!: string;
  address!: string;
  contractId!: number;
  issueId!: number;
  id!: number;

  issue!: issues;
  getIssue!: Sequelize.BelongsToGetAssociationMixin<issues>;
  setIssue!: Sequelize.BelongsToSetAssociationMixin<issues, issuesId>;
  createIssue!: Sequelize.BelongsToCreateAssociationMixin<issues>;

  static initModel(sequelize: Sequelize.Sequelize): typeof benefactors {
    return sequelize.define('benefactor', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    amount: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contractId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    issueId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "issue",
        key: "id"
      }
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

import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { issues, issuesId } from './issues';

export interface users_paymentsAttributes {
  id: number;
  address: string;
  ammount: number;
  issueId: number;
  transactionHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type users_paymentsPk = "id";
export type users_paymentsId = users_payments[users_paymentsPk];
export type users_paymentsOptionalAttributes = "id" | "transactionHash" | "createdAt" | "updatedAt";
export type users_paymentsCreationAttributes = Optional<users_paymentsAttributes, users_paymentsOptionalAttributes>;

export class users_payments extends Model<users_paymentsAttributes, users_paymentsCreationAttributes> implements users_paymentsAttributes {
  id!: number;
  address!: string;
  ammount!: number;
  issueId!: number;
  transactionHash?: string;
  createdAt!: Date;
  updatedAt!: Date;

  // users_payments belongsTo issues via issueId
  issue!: issues;
  getIssue!: Sequelize.BelongsToGetAssociationMixin<issues>;
  setIssue!: Sequelize.BelongsToSetAssociationMixin<issues, issuesId>;
  createIssue!: Sequelize.BelongsToCreateAssociationMixin<issues>;

  static initModel(sequelize: Sequelize.Sequelize): typeof users_payments {
    return users_payments.init({
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
    ammount: {
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
    transactionHash: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'users_payments',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "users_payments_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}

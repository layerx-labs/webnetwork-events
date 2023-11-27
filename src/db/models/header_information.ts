import * as Sequelize from 'sequelize';
import {DataTypes, Model, Optional} from 'sequelize';

export interface header_informationAttributes {
  id: number;
  bounties: number;
  TVL?: string;
  number_of_network: number;
  last_price_used?: object;
  createdAt: Date;
  updatedAt: Date;
}

export type header_informationPk = "id";
export type header_informationId = header_information[header_informationPk];
export type header_informationOptionalAttributes =
  "id"
  | "bounties"
  | "TVL"
  | "number_of_network"
  | "last_price_used"
  | "createdAt"
  | "updatedAt";
export type header_informationCreationAttributes = Optional<header_informationAttributes, header_informationOptionalAttributes>;

export class header_information extends Model<header_informationAttributes, header_informationCreationAttributes> implements header_informationAttributes {
  id!: number;
  bounties!: number;
  TVL?: string;
  number_of_network!: number;
  last_price_used?: object;
  createdAt!: Date;
  updatedAt!: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof header_information {
    return sequelize.define('header_information', {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      bounties: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      TVL: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      number_of_network: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      last_price_used: {
        type: DataTypes.JSON,
        allowNull: true
      }
    }, {
      tableName: 'header_information',
      schema: 'public',
      timestamps: true,
      indexes: [
        {
          name: "header_information_pkey",
          unique: true,
          fields: [
            {name: "id"},
          ]
        },
      ]
    }) as typeof header_information;
  }
}

import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface chainsAttributes {
  id: number;
  chainId?: number;
  chainRpc: string;
  chainName: string;
  chainShortName: string;
  chainCurrencyName: string;
  chainCurrencySymbol: string;
  chainCurrencyDecimals: number;
  registryAddress?: string;
  eventsApi?: string;
  blockScanner?: string;
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type chainsPk = "id";
export type chainsId = chains[chainsPk];
export type chainsOptionalAttributes = "id" | "chainId" | "registryAddress" | "eventsApi" | "blockScanner" | "isDefault" | "createdAt" | "updatedAt";
export type chainsCreationAttributes = Optional<chainsAttributes, chainsOptionalAttributes>;

export class chains extends Model<chainsAttributes, chainsCreationAttributes> implements chainsAttributes {
  id!: number;
  chainId?: number;
  chainRpc!: string;
  chainName!: string;
  chainShortName!: string;
  chainCurrencyName!: string;
  chainCurrencySymbol!: string;
  chainCurrencyDecimals!: number;
  registryAddress?: string;
  eventsApi?: string;
  blockScanner?: string;
  isDefault?: boolean;
  createdAt!: Date;
  updatedAt!: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof chains {
    return sequelize.define('chains', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    chainId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      unique: "chains_chainId_key"
    },
    chainRpc: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    chainName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "chains_chainName_key"
    },
    chainShortName: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    chainCurrencyName: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    chainCurrencySymbol: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    chainCurrencyDecimals: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    registryAddress: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    eventsApi: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    blockScanner: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  }, {
    tableName: 'chains',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "chains_chainId_key",
        unique: true,
        fields: [
          { name: "chainId" },
        ]
      },
      {
        name: "chains_chainName_key",
        unique: true,
        fields: [
          { name: "chainName" },
        ]
      },
      {
        name: "chains_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  }) as typeof chains;
  }
}

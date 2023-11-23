import * as Sequelize from 'sequelize';
import {DataTypes, Model, Optional} from 'sequelize';
import type {chains, chainsId} from './chains';
import type {curators, curatorsId} from './curators';
import type {networks, networksId} from './networks';

export interface delegationsAttributes {
  id: number;
  from: string;
  to: string;
  amount: string;
  contractId: number;
  networkId?: number;
  chainId?: number;
  curatorId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type delegationsPk = "id";
export type delegationsId = delegations[delegationsPk];
export type delegationsOptionalAttributes = "id" | "from" | "to" | "amount" | "networkId" | "chainId" | "curatorId" | "createdAt" | "updatedAt";
export type delegationsCreationAttributes = Optional<delegationsAttributes, delegationsOptionalAttributes>;

export class delegations extends Model<delegationsAttributes, delegationsCreationAttributes> implements delegationsAttributes {
  id!: number;
  from!: string;
  to!: string;
  amount!: string;
  contractId!: number;
  networkId?: number;
  chainId?: number;
  curatorId?: number;
  createdAt?: Date;
  updatedAt?: Date;

  // delegations belongsTo chains via chainId
  chain!: chains;
  getChain!: Sequelize.BelongsToGetAssociationMixin<chains>;
  setChain!: Sequelize.BelongsToSetAssociationMixin<chains, chainsId>;
  createChain!: Sequelize.BelongsToCreateAssociationMixin<chains>;
  // delegations belongsTo curators via curatorId
  curator!: curators;
  getCurator!: Sequelize.BelongsToGetAssociationMixin<curators>;
  setCurator!: Sequelize.BelongsToSetAssociationMixin<curators, curatorsId>;
  createCurator!: Sequelize.BelongsToCreateAssociationMixin<curators>;
  // delegations belongsTo networks via networkId
  network!: networks;
  getNetwork!: Sequelize.BelongsToGetAssociationMixin<networks>;
  setNetwork!: Sequelize.BelongsToSetAssociationMixin<networks, networksId>;
  createNetwork!: Sequelize.BelongsToCreateAssociationMixin<networks>;

  static initModel(sequelize: Sequelize.Sequelize): typeof delegations {
    return sequelize.define('delegations', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    from: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "0x0000000000000000000000000000000000000000"
    },
    to: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "0x0000000000000000000000000000000000000000"
    },
    amount: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "0"
    },
    contractId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    networkId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'networks',
        key: 'id'
      }
    },
    chainId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'chains',
        key: 'chainId'
      }
    },
    curatorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'curators',
        key: 'id'
      }
    }
  }, {
    tableName: 'delegations',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "delegations_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  }) as typeof delegations;
  }
}

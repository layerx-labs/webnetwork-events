import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import { networks, networksId } from './networks';

export interface curatorAttributes {
  id: number;
  address: string;
  tokensLocked?: string;
  acceptedProposals?: number;
  disputedProposals?: number;
  networkId: number;
  isCurrentlyCurator: boolean;
}

export type curatorPk = "id";
export type curatorId = curators[curatorPk];
export type curatorOptionalAttributes = "id";
export type curatorCreationAttributes = Optional<curatorAttributes, curatorOptionalAttributes>;

export class curators extends Model<curatorAttributes, curatorCreationAttributes> implements curatorAttributes {
  address!: string;
  networkId!: number;
  id!: number;
  isCurrentlyCurator!: boolean;
  tokensLocked: string;
  acceptedProposals: number;
  disputedProposals: number;

  network!: networks;
  getNetwork!: Sequelize.BelongsToGetAssociationMixin<networks>;
  setNetwork!: Sequelize.BelongsToSetAssociationMixin<networks, networksId>;
  createNetwork!: Sequelize.BelongsToCreateAssociationMixin<networks>;

  static initModel(sequelize: Sequelize.Sequelize): typeof curators {
    return sequelize.define('curators', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    acceptedProposals: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    disputedProposals: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tokensLocked: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isCurrentlyCurator: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    networkId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "network",
        key: "id"
      }
    }
  }, {
    tableName: 'curators',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "curators_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  }) as typeof curators;
  }
}
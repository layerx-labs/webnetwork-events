import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { delegations, delegationsId } from './delegations';
import type { networks, networksId } from './networks';

export interface curatorsAttributes {
  id: number;
  address: string;
  acceptedProposals?: number;
  disputedProposals?: number;
  tokensLocked?: string;
  networkId: number;
  isCurrentlyCurator: boolean;
  createdAt: Date;
  updatedAt: Date;
  delegatedToMe?: string;
}

export type curatorsPk = "id";
export type curatorsId = curators[curatorsPk];
export type curatorsOptionalAttributes = "id" | "acceptedProposals" | "disputedProposals" | "tokensLocked" | "createdAt" | "updatedAt" | "delegatedToMe";
export type curatorsCreationAttributes = Optional<curatorsAttributes, curatorsOptionalAttributes>;

export class curators extends Model<curatorsAttributes, curatorsCreationAttributes> implements curatorsAttributes {
  id!: number;
  address!: string;
  acceptedProposals?: number;
  disputedProposals?: number;
  tokensLocked?: string;
  networkId!: number;
  isCurrentlyCurator!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  delegatedToMe?: string;

  // curators hasMany delegations via curatorId
  delegations!: delegations[];
  getDelegations!: Sequelize.HasManyGetAssociationsMixin<delegations>;
  setDelegations!: Sequelize.HasManySetAssociationsMixin<delegations, delegationsId>;
  addDelegation!: Sequelize.HasManyAddAssociationMixin<delegations, delegationsId>;
  addDelegations!: Sequelize.HasManyAddAssociationsMixin<delegations, delegationsId>;
  createDelegation!: Sequelize.HasManyCreateAssociationMixin<delegations>;
  removeDelegation!: Sequelize.HasManyRemoveAssociationMixin<delegations, delegationsId>;
  removeDelegations!: Sequelize.HasManyRemoveAssociationsMixin<delegations, delegationsId>;
  hasDelegation!: Sequelize.HasManyHasAssociationMixin<delegations, delegationsId>;
  hasDelegations!: Sequelize.HasManyHasAssociationsMixin<delegations, delegationsId>;
  countDelegations!: Sequelize.HasManyCountAssociationsMixin;
  // curators belongsTo networks via networkId
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
      type: DataTypes.STRING(255),
      allowNull: false
    },
    acceptedProposals: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    disputedProposals: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    tokensLocked: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    networkId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'networks',
        key: 'id'
      }
    },
    isCurrentlyCurator: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    delegatedToMe: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: "0"
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

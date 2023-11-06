import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { chains, chainsId } from './chains';
import type { tokens, tokensId } from './tokens';
import type { users, usersId } from './users';

export interface users_locked_registryAttributes {
  id: number;
  address: string;
  userId?: number;
  amountLocked: string;
  chainId: number;
  tokenId: number;
  createdAt: Date;
  updatedAt: Date;
}

export type users_locked_registryPk = "id";
export type users_locked_registryId = users_locked_registry[users_locked_registryPk];
export type users_locked_registryOptionalAttributes = "id" | "userId" | "createdAt" | "updatedAt";
export type users_locked_registryCreationAttributes = Optional<users_locked_registryAttributes, users_locked_registryOptionalAttributes>;

export class users_locked_registry extends Model<users_locked_registryAttributes, users_locked_registryCreationAttributes> implements users_locked_registryAttributes {
  id!: number;
  address!: string;
  userId?: number;
  amountLocked!: string;
  chainId!: number;
  tokenId!: number;
  createdAt!: Date;
  updatedAt!: Date;

  // users_locked_registry belongsTo chains via chainId
  chain!: chains;
  getChain!: Sequelize.BelongsToGetAssociationMixin<chains>;
  setChain!: Sequelize.BelongsToSetAssociationMixin<chains, chainsId>;
  createChain!: Sequelize.BelongsToCreateAssociationMixin<chains>;
  // users_locked_registry belongsTo tokens via tokenId
  token!: tokens;
  getToken!: Sequelize.BelongsToGetAssociationMixin<tokens>;
  setToken!: Sequelize.BelongsToSetAssociationMixin<tokens, tokensId>;
  createToken!: Sequelize.BelongsToCreateAssociationMixin<tokens>;
  // users_locked_registry belongsTo users via userId
  user!: users;
  getUser!: Sequelize.BelongsToGetAssociationMixin<users>;
  setUser!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createUser!: Sequelize.BelongsToCreateAssociationMixin<users>;

  static initModel(sequelize: Sequelize.Sequelize): typeof users_locked_registry {
    return sequelize.define('users_locked_registry', {
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
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    amountLocked: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    chainId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'chains',
        key: 'chainId'
      }
    },
    tokenId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tokens',
        key: 'id'
      }
    }
  }, {
    tableName: 'users_locked_registry',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "users_locked_registry_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  }) as typeof users_locked_registry;
  }
}

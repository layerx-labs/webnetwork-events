import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { networks, networksId } from './networks';
import type { tokens, tokensId } from './tokens';

export interface network_tokensAttributes {
  id: number;
  networkId: number;
  tokenId: number;
}

export type network_tokensPk = "id";
export type network_tokensId = network_tokens[network_tokensPk];
export type network_tokensOptionalAttributes = "id";
export type network_tokensCreationAttributes = Optional<network_tokensAttributes, network_tokensOptionalAttributes>;

export class network_tokens extends Model<network_tokensAttributes, network_tokensCreationAttributes> implements network_tokensAttributes {
  id!: number;
  networkId!: number;
  tokenId!: number;

  // network_tokens belongsTo networks via networkId
  network!: networks;
  getNetwork!: Sequelize.BelongsToGetAssociationMixin<networks>;
  setNetwork!: Sequelize.BelongsToSetAssociationMixin<networks, networksId>;
  createNetwork!: Sequelize.BelongsToCreateAssociationMixin<networks>;
  // network_tokens belongsTo tokens via tokenId
  token!: tokens;
  getToken!: Sequelize.BelongsToGetAssociationMixin<tokens>;
  setToken!: Sequelize.BelongsToSetAssociationMixin<tokens, tokensId>;
  createToken!: Sequelize.BelongsToCreateAssociationMixin<tokens>;

  static initModel(sequelize: Sequelize.Sequelize): typeof network_tokens {
    return sequelize.define('network_tokens', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    networkId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'networks',
        key: 'id'
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
    tableName: 'network_tokens',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "network_tokens_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  }) as typeof network_tokens;
  }
}

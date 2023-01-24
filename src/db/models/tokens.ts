import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { issues, issuesId } from './issues';
import type { network_tokens, network_tokensId } from './network_tokens';

export interface tokensAttributes {
  id: number;
  name: string;
  symbol: string;
  address: string;
  isTransactional: boolean;
  isAllowed?: boolean;
  isReward: boolean;
}

export type tokensPk = "id";
export type tokensId = tokens[tokensPk];
export type tokensOptionalAttributes = "id" | "isAllowed";
export type tokensCreationAttributes = Optional<tokensAttributes, tokensOptionalAttributes>;

export class tokens extends Model<tokensAttributes, tokensCreationAttributes> implements tokensAttributes {
  id!: number;
  name!: string;
  symbol!: string;
  address!: string;
  isTransactional!: boolean;
  isAllowed?: boolean;
  isReward!: boolean;
  
  // tokens hasMany issues via tokenId
  issues!: issues[];
  getIssues!: Sequelize.HasManyGetAssociationsMixin<issues>;
  setIssues!: Sequelize.HasManySetAssociationsMixin<issues, issuesId>;
  addIssue!: Sequelize.HasManyAddAssociationMixin<issues, issuesId>;
  addIssues!: Sequelize.HasManyAddAssociationsMixin<issues, issuesId>;
  createIssue!: Sequelize.HasManyCreateAssociationMixin<issues>;
  removeIssue!: Sequelize.HasManyRemoveAssociationMixin<issues, issuesId>;
  removeIssues!: Sequelize.HasManyRemoveAssociationsMixin<issues, issuesId>;
  hasIssue!: Sequelize.HasManyHasAssociationMixin<issues, issuesId>;
  hasIssues!: Sequelize.HasManyHasAssociationsMixin<issues, issuesId>;
  countIssues!: Sequelize.HasManyCountAssociationsMixin;
  // tokens hasMany network_tokens via tokenId
  network_tokens!: network_tokens[];
  getNetwork_tokens!: Sequelize.HasManyGetAssociationsMixin<network_tokens>;
  setNetwork_tokens!: Sequelize.HasManySetAssociationsMixin<network_tokens, network_tokensId>;
  addNetwork_token!: Sequelize.HasManyAddAssociationMixin<network_tokens, network_tokensId>;
  addNetwork_tokens!: Sequelize.HasManyAddAssociationsMixin<network_tokens, network_tokensId>;
  createNetwork_token!: Sequelize.HasManyCreateAssociationMixin<network_tokens>;
  removeNetwork_token!: Sequelize.HasManyRemoveAssociationMixin<network_tokens, network_tokensId>;
  removeNetwork_tokens!: Sequelize.HasManyRemoveAssociationsMixin<network_tokens, network_tokensId>;
  hasNetwork_token!: Sequelize.HasManyHasAssociationMixin<network_tokens, network_tokensId>;
  hasNetwork_tokens!: Sequelize.HasManyHasAssociationsMixin<network_tokens, network_tokensId>;
  countNetwork_tokens!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof tokens {
    return sequelize.define('tokens', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    symbol: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    isTransactional: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    isAllowed: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    isReward: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
  }, {
    tableName: 'tokens',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tokens_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  }) as typeof tokens;
  }
}

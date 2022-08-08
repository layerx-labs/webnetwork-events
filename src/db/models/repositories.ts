import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { issues, issuesId } from './issues';
import type { networks, networksId } from './networks';

export interface repositoriesAttributes {
  id: number;
  githubPath: string;
  network_id?: number;
}

export type repositoriesPk = "id";
export type repositoriesId = repositories[repositoriesPk];
export type repositoriesOptionalAttributes = "id" | "network_id";
export type repositoriesCreationAttributes = Optional<repositoriesAttributes, repositoriesOptionalAttributes>;

export class repositories extends Model<repositoriesAttributes, repositoriesCreationAttributes> implements repositoriesAttributes {
  id!: number;
  githubPath!: string;
  network_id?: number;

  // repositories belongsTo networks via network_id
  network!: networks;
  getNetwork!: Sequelize.BelongsToGetAssociationMixin<networks>;
  setNetwork!: Sequelize.BelongsToSetAssociationMixin<networks, networksId>;
  createNetwork!: Sequelize.BelongsToCreateAssociationMixin<networks>;
  // repositories hasMany issues via repository_id
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

  static initModel(sequelize: Sequelize.Sequelize): typeof repositories {
    return sequelize.define('repositories', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    githubPath: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "repositories_githubPath_key"
    },
    network_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'networks',
        key: 'id'
      }
    }
  }, {
    tableName: 'repositories',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "repositories_githubPath_key",
        unique: true,
        fields: [
          { name: "githubPath" },
        ]
      },
      {
        name: "repositories_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  }) as typeof repositories;
  }
}

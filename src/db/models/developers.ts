import * as Sequelize from 'sequelize';
import {DataTypes, Model, Optional} from 'sequelize';
import type {issues, issuesId} from './issues';

export interface developersAttributes {
  id: number;
  githubHandle?: string;
  address?: string;
  issueId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type developersPk = "id";
export type developersId = developers[developersPk];
export type developersOptionalAttributes = "id" | "githubHandle" | "address" | "issueId" | "createdAt" | "updatedAt";
export type developersCreationAttributes = Optional<developersAttributes, developersOptionalAttributes>;

export class developers extends Model<developersAttributes, developersCreationAttributes> implements developersAttributes {
  id!: number;
  githubHandle?: string;
  address?: string;
  issueId?: number;
  createdAt!: Date;
  updatedAt!: Date;

  // developers belongsTo issues via issueId
  issue!: issues;
  getIssue!: Sequelize.BelongsToGetAssociationMixin<issues>;
  setIssue!: Sequelize.BelongsToSetAssociationMixin<issues, issuesId>;
  createIssue!: Sequelize.BelongsToCreateAssociationMixin<issues>;

  static initModel(sequelize: Sequelize.Sequelize): typeof developers {
    return sequelize.define('developers', {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      githubHandle: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      address: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      issueId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'issues',
          key: 'id'
        }
      }
    }, {
      tableName: 'developers',
      schema: 'public',
      timestamps: true,
      indexes: [
        {
          name: "developers_pkey",
          unique: true,
          fields: [
            {name: "id"},
          ]
        },
      ]
    }) as typeof developers;
  }
}

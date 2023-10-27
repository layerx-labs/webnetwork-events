import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { issues, issuesId } from './issues';
import type { networks, networksId } from './networks';

export interface pull_requestsAttributes {
  id: number;
  githubId?: string;
  issueId?: number;
  createdAt: Date;
  updatedAt: Date;
  githubLogin?: string;
  reviewers?: string[];
  userRepo?: string;
  userBranch?: string;
  status?: string;
  contractId?: number;
  userAddress?: string;
  network_id?: number;
}

export type pull_requestsPk = "id";
export type pull_requestsId = pull_requests[pull_requestsPk];
export type pull_requestsOptionalAttributes = "id" | "githubId" | "issueId" | "createdAt" | "updatedAt" | "githubLogin" | "reviewers" | "userRepo" | "userBranch" | "status" | "contractId" | "userAddress" | "network_id";
export type pull_requestsCreationAttributes = Optional<pull_requestsAttributes, pull_requestsOptionalAttributes>;

export class pull_requests extends Model<pull_requestsAttributes, pull_requestsCreationAttributes> implements pull_requestsAttributes {
  id!: number;
  githubId?: string;
  issueId?: number;
  createdAt!: Date;
  updatedAt!: Date;
  githubLogin?: string;
  reviewers?: string[];
  userRepo?: string;
  userBranch?: string;
  status?: string;
  contractId?: number;
  userAddress?: string;
  network_id?: number;

  // pull_requests belongsTo issues via issueId
  issue!: issues;
  getIssue!: Sequelize.BelongsToGetAssociationMixin<issues>;
  setIssue!: Sequelize.BelongsToSetAssociationMixin<issues, issuesId>;
  createIssue!: Sequelize.BelongsToCreateAssociationMixin<issues>;
  // pull_requests belongsTo networks via network_id
  network!: networks;
  getNetwork!: Sequelize.BelongsToGetAssociationMixin<networks>;
  setNetwork!: Sequelize.BelongsToSetAssociationMixin<networks, networksId>;
  createNetwork!: Sequelize.BelongsToCreateAssociationMixin<networks>;

  static initModel(sequelize: Sequelize.Sequelize): typeof pull_requests {
    return sequelize.define('pull_requests', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    githubId: {
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
    },
    githubLogin: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    reviewers: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: ["(ARRAY[]"]
    },
    userRepo: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    userBranch: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    contractId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    userAddress: {
      type: DataTypes.STRING(255),
      allowNull: true
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
    tableName: 'pull_requests',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "pull_requests_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  }) as typeof pull_requests;
  }
}

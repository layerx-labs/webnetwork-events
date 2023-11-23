import * as Sequelize from 'sequelize';
import {DataTypes, Model, Optional} from 'sequelize';

export interface leaderboardAttributes {
  id: number;
  address: string;
  numberNfts?: number;
  createdAt: Date;
  updatedAt: Date;
  ownedBountiesOpened?: number;
  ownedBountiesClosed?: number;
  ownedBountiesCanceled?: number;
  ownedProposalCreated?: number;
  ownedProposalAccepted?: number;
  ownedProposalRejected?: number;
}

export type leaderboardPk = "id";
export type leaderboardId = leaderboard[leaderboardPk];
export type leaderboardOptionalAttributes = "id" | "numberNfts" | "createdAt" | "updatedAt" | "ownedBountiesOpened" | "ownedBountiesClosed" | "ownedBountiesCanceled" | "ownedProposalCreated" | "ownedProposalAccepted" | "ownedProposalRejected";
export type leaderboardCreationAttributes = Optional<leaderboardAttributes, leaderboardOptionalAttributes>;

export class leaderboard extends Model<leaderboardAttributes, leaderboardCreationAttributes> implements leaderboardAttributes {
  id!: number;
  address!: string;
  numberNfts?: number;
  createdAt!: Date;
  updatedAt!: Date;
  ownedBountiesOpened?: number;
  ownedBountiesClosed?: number;
  ownedBountiesCanceled?: number;
  ownedProposalCreated?: number;
  ownedProposalAccepted?: number;
  ownedProposalRejected?: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof leaderboard {
    return sequelize.define('leaderboard', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "leaderboard_address_key"
    },
    numberNfts: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    ownedBountiesOpened: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ownedBountiesClosed: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ownedBountiesCanceled: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ownedProposalCreated: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ownedProposalAccepted: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    ownedProposalRejected: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'leaderboard',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "leaderboard_address_key",
        unique: true,
        fields: [
          { name: "address" },
        ]
      },
      {
        name: "leaderboard_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  }) as typeof leaderboard;
  }
}

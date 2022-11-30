import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface leaderboardAttributes {
  id: number;
  address: string;
  numberNfts: number;
}

export type leaderboardPk = "id";
export type leaderboardId = leaderboard[leaderboardPk];
export type leaderboardOptionalAttributes = "id";
export type leaderboardCreationAttributes = Optional<leaderboardAttributes, leaderboardOptionalAttributes>;

export class leaderboard extends Model<leaderboardAttributes, leaderboardCreationAttributes> implements leaderboardAttributes {
  address!: string;
  id!: number;
  numberNfts: number;

  static initModel(sequelize: Sequelize.Sequelize): typeof leaderboard {
    return sequelize.define('leaderboard', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    numberNfts: {
      type: DataTypes.INTEGER,
      allowNull: true
    },    
  }, {
    tableName: 'leaderboard',
    schema: 'public',
    timestamps: true,
    indexes: [
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
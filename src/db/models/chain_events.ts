import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface chain_eventsAttributes {
  id: number;
  name: string;
  lastBlock?: number;
  createdAt: Date;
  updatedAt: Date;
  chain_id?: number;
}

export type chain_eventsPk = "id";
export type chain_eventsId = chain_events[chain_eventsPk];
export type chain_eventsOptionalAttributes = "id" | "lastBlock" | "createdAt" | "updatedAt" | "chain_id";
export type chain_eventsCreationAttributes = Optional<chain_eventsAttributes, chain_eventsOptionalAttributes>;

export class chain_events extends Model<chain_eventsAttributes, chain_eventsCreationAttributes> implements chain_eventsAttributes {
  id!: number;
  name!: string;
  lastBlock?: number;
  createdAt!: Date;
  updatedAt!: Date;
  chain_id?: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof chain_events {
    return sequelize.define('chain_events', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "chain_events_name_key"
    },
    lastBlock: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    chain_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'chain_events',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "chain_events_name_key",
        unique: true,
        fields: [
          { name: "name" },
        ]
      },
    ]
  }) as typeof chain_events;
  }
}

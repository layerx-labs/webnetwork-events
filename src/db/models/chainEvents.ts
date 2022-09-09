import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface chainEventsAttributes {
  id: number;
  name: string;
  lastBlock?: number;
}

export type chainEventsPk = "id";
export type chainEventsId = chainEvents[chainEventsPk];
export type chainEventsOptionalAttributes = "id" | "lastBlock";
export type chainEventsCreationAttributes = Optional<chainEventsAttributes, chainEventsOptionalAttributes>;

export class chainEvents extends Model<chainEventsAttributes, chainEventsCreationAttributes> implements chainEventsAttributes {
  id!: number;
  name!: string;
  lastBlock?: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof chainEvents {
    return sequelize.define('chainEvents', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "chainEvents_name_key"
    },
    lastBlock: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'chainEvents',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "chainEvents_name_key",
        unique: true,
        fields: [
          { name: "name" },
        ]
      },
      {
        name: "chainEvents_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  }) as typeof chainEvents;
  }
}

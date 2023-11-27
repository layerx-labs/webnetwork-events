import * as Sequelize from 'sequelize';
import {DataTypes, Model, Optional} from 'sequelize';

export interface settingsAttributes {
  id: number;
  key: string;
  value: string;
  type: "string" | "boolean" | "number" | "json";
  visibility: "public" | "private";
  group?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type settingsPk = "id";
export type settingsId = settings[settingsPk];
export type settingsOptionalAttributes = "id" | "type" | "visibility" | "group" | "createdAt" | "updatedAt";
export type settingsCreationAttributes = Optional<settingsAttributes, settingsOptionalAttributes>;

export class settings extends Model<settingsAttributes, settingsCreationAttributes> implements settingsAttributes {
  id!: number;
  key!: string;
  value!: string;
  type!: "string" | "boolean" | "number" | "json";
  visibility!: "public" | "private";
  group?: string;
  createdAt!: Date;
  updatedAt!: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof settings {
    return sequelize.define('settings', {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      key: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: "unique_settings_key_value"
      },
      value: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: "unique_settings_key_value"
      },
      type: {
        type: DataTypes.ENUM("string", "boolean", "number", "json"),
        allowNull: false,
        defaultValue: "string"
      },
      visibility: {
        type: DataTypes.ENUM("public", "private"),
        allowNull: false,
        defaultValue: "public"
      },
      group: {
        type: DataTypes.STRING(255),
        allowNull: true
      }
    }, {
      tableName: 'settings',
      schema: 'public',
      timestamps: true,
      indexes: [
        {
          name: "settings_pkey",
          unique: true,
          fields: [
            {name: "id"},
          ]
        },
        {
          name: "unique_settings_key_value",
          unique: true,
          fields: [
            {name: "key"},
            {name: "value"},
          ]
        },
      ]
    }) as typeof settings;
  }
}

import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { points_events, points_eventsId } from './points_events';

export interface points_baseAttributes {
  id: number;
  actionName: string;
  pointsPerAction: number;
  scalingFactor?: number;
  counter: string;
}

export type points_basePk = "id";
export type points_baseId = points_base[points_basePk];
export type points_baseOptionalAttributes = "id" | "scalingFactor";
export type points_baseCreationAttributes = Optional<points_baseAttributes, points_baseOptionalAttributes>;

export class points_base extends Model<points_baseAttributes, points_baseCreationAttributes> implements points_baseAttributes {
  id!: number;
  actionName!: string;
  pointsPerAction!: number;
  scalingFactor?: number;
  counter!: string;

  // points_base hasMany points_events via actionName
  points_events!: points_events[];
  getPoints_events!: Sequelize.HasManyGetAssociationsMixin<points_events>;
  setPoints_events!: Sequelize.HasManySetAssociationsMixin<points_events, points_eventsId>;
  addPoints_event!: Sequelize.HasManyAddAssociationMixin<points_events, points_eventsId>;
  addPoints_events!: Sequelize.HasManyAddAssociationsMixin<points_events, points_eventsId>;
  createPoints_event!: Sequelize.HasManyCreateAssociationMixin<points_events>;
  removePoints_event!: Sequelize.HasManyRemoveAssociationMixin<points_events, points_eventsId>;
  removePoints_events!: Sequelize.HasManyRemoveAssociationsMixin<points_events, points_eventsId>;
  hasPoints_event!: Sequelize.HasManyHasAssociationMixin<points_events, points_eventsId>;
  hasPoints_events!: Sequelize.HasManyHasAssociationsMixin<points_events, points_eventsId>;
  countPoints_events!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof points_base {
    return sequelize.define('points_base', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    actionName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "points_base_actionName_key"
    },
    pointsPerAction: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    scalingFactor: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 1
    },
    counter: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    tableName: 'points_base',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "points_base_actionName_key",
        unique: true,
        fields: [
          { name: "actionName" },
        ]
      },
      {
        name: "points_base_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  }) as typeof points_base;
  }
}

import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { points_base, points_baseId } from './points_base';
import type { users, usersId } from './users';

export interface points_eventsAttributes {
  id: number;
  userId: number;
  actionName: string;
  pointsWon: number;
  pointsCounted?: boolean;
  createdAt: Date;
  updatedAt: Date;
  info?: object;
}

export type points_eventsPk = "id";
export type points_eventsId = points_events[points_eventsPk];
export type points_eventsOptionalAttributes = "id" | "pointsCounted" | "createdAt" | "updatedAt" | "info";
export type points_eventsCreationAttributes = Optional<points_eventsAttributes, points_eventsOptionalAttributes>;

export class points_events extends Model<points_eventsAttributes, points_eventsCreationAttributes> implements points_eventsAttributes {
  id!: number;
  userId!: number;
  actionName!: string;
  pointsWon!: number;
  pointsCounted?: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  info?: object;

  // points_events belongsTo points_base via actionName
  actionName_points_base!: points_base;
  getActionName_points_base!: Sequelize.BelongsToGetAssociationMixin<points_base>;
  setActionName_points_base!: Sequelize.BelongsToSetAssociationMixin<points_base, points_baseId>;
  createActionName_points_base!: Sequelize.BelongsToCreateAssociationMixin<points_base>;
  // points_events belongsTo users via userId
  user!: users;
  getUser!: Sequelize.BelongsToGetAssociationMixin<users>;
  setUser!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createUser!: Sequelize.BelongsToCreateAssociationMixin<users>;

  static initModel(sequelize: Sequelize.Sequelize): typeof points_events {
    return sequelize.define('points_events', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    actionName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      references: {
        model: 'points_base',
        key: 'actionName'
      }
    },
    pointsWon: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    pointsCounted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    info: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    tableName: 'points_events',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "points_events_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  }) as typeof points_events;
  }
}

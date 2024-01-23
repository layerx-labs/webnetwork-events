import * as Sequelize from 'sequelize';
import {DataTypes, Model, Optional} from 'sequelize';
import type {users, usersId} from './users';

export interface kyc_sessionsAttributes {
  id: number;
  user_id: number;
  session_id: string;
  status?: string;
  steps?: object;
  tiers?: number[];
  validatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type kyc_sessionsPk = "id";
export type kyc_sessionsId = kyc_sessions[kyc_sessionsPk];
export type kyc_sessionsOptionalAttributes = "id" | "status" | "steps" | "tiers" | "validatedAt" | "createdAt" | "updatedAt";
export type kyc_sessionsCreationAttributes = Optional<kyc_sessionsAttributes, kyc_sessionsOptionalAttributes>;

export class kyc_sessions extends Model<kyc_sessionsAttributes, kyc_sessionsCreationAttributes> implements kyc_sessionsAttributes {
  id!: number;
  user_id!: number;
  session_id!: string;
  status?: string;
  steps?: object;
  tiers?: number[];
  validatedAt?: Date;
  createdAt!: Date;
  updatedAt!: Date;

  // kyc_sessions belongsTo users via user_id
  user!: users;
  getUser!: Sequelize.BelongsToGetAssociationMixin<users>;
  setUser!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createUser!: Sequelize.BelongsToCreateAssociationMixin<users>;

  static initModel(sequelize: Sequelize.Sequelize): typeof kyc_sessions {
    return sequelize.define('kyc_sessions', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    session_id: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    steps: {
      type: DataTypes.JSON,
      allowNull: true
    },
    tiers: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: true
    },
    validatedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'kyc_sessions',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "kyc_sessions_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  }) as typeof kyc_sessions;
  }
}

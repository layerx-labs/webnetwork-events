import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class chain_events extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
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
      allowNull: true
    }
  }, {
    sequelize,
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
      {
        name: "chain_events_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}

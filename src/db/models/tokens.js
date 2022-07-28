import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class tokens extends Model {
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
      allowNull: false
    },
    symbol: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "tokens_address_key"
    }
  }, {
    sequelize,
    tableName: 'tokens',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "tokens_address_key",
        unique: true,
        fields: [
          { name: "address" },
        ]
      },
      {
        name: "tokens_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}

import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class network_tokens extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    networkId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'networks',
        key: 'id'
      }
    },
    tokenId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tokens',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'network_tokens',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "network_tokens_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}

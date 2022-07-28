import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class users_payments extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    ammount: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    issueId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'issues',
        key: 'id'
      }
    },
    transactionHash: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'users_payments',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "users_payments_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}

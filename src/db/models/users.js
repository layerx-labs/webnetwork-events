import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class users extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    githubHandle: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: "users_address_key"
    },
    githubLogin: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: "users_githubLogin_key"
    },
    accessToken: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'users',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "users_address_key",
        unique: true,
        fields: [
          { name: "address" },
        ]
      },
      {
        name: "users_githubLogin_key",
        unique: true,
        fields: [
          { name: "githubLogin" },
        ]
      },
      {
        name: "users_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}

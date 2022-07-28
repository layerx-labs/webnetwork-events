import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class networks extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    creatorAddress: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "networks_name_key"
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    colors: {
      type: DataTypes.JSON,
      allowNull: true
    },
    networkAddress: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    logoIcon: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    fullLogo: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    isClosed: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    allowCustomTokens: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    councilMembers: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'networks',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "networks_name_key",
        unique: true,
        fields: [
          { name: "name" },
        ]
      },
      {
        name: "networks_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}

import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class repositories extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    githubPath: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "repositories_githubPath_key"
    },
    network_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'networks',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'repositories',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "repositories_githubPath_key",
        unique: true,
        fields: [
          { name: "githubPath" },
        ]
      },
      {
        name: "repositories_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}

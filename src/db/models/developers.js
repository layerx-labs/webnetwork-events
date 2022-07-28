import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class developers extends Model {
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
      allowNull: true
    },
    issueId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'issues',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'developers',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "developers_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}

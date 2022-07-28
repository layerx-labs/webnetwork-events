import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class pull_requests extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    githubId: {
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
    },
    githubLogin: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    branch: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    reviewers: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: ["(ARRAY[]"]
    },
    userRepo: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    userBranch: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    contractId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'pull_requests',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "pull_requests_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}

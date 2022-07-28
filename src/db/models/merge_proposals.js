import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class merge_proposals extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    scMergeId: {
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
    pullRequestId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'pull_requests',
        key: 'id'
      }
    },
    githubLogin: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    contractId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    creator: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'merge_proposals',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "merge_proposals_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}

import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class issues extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    issueId: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    githubId: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    state: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    creatorAddress: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    creatorGithub: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    repository_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'repositories',
        key: 'id'
      }
    },
    working: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: ["(ARRAY[]"]
    },
    merged: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    seoImage: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    branch: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    network_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'networks',
        key: 'id'
      }
    },
    contractId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    tokenId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tokens',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'issues',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "issues_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}

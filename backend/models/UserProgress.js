const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserProgress = sequelize.define('UserProgress', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lessonId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'lessons',
      key: 'id'
    }
  },
  conversationId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'conversations',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('not_started', 'in_progress', 'completed', 'paused'),
    defaultValue: 'not_started'
  },
  progressPercentage: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  currentStep: {
    type: DataTypes.STRING, // Current lesson step/section
    allowNull: true
  },
  completedSteps: {
    type: DataTypes.JSON, // Array of completed steps
    defaultValue: []
  },
  timeSpent: {
    type: DataTypes.INTEGER, // Time in minutes
    defaultValue: 0
  },
  score: {
    type: DataTypes.INTEGER, // Performance score (0-100)
    allowNull: true
  },
  mistakes: {
    type: DataTypes.JSON, // Array of mistakes made for learning
    defaultValue: []
  },
  achievements: {
    type: DataTypes.JSON, // Array of achievements earned
    defaultValue: []
  },
  lastPosition: {
    type: DataTypes.STRING, // Last FEN position viewed
    allowNull: true
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'user_progress',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'lessonId']
    }
  ]
});

module.exports = UserProgress;

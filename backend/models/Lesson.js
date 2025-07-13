const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Lesson = sequelize.define('Lesson', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  topic: {
    type: DataTypes.ENUM('openings', 'tactics', 'endgames', 'strategy', 'advanced'),
    allowNull: false
  },
  difficulty: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  objectives: {
    type: DataTypes.JSON, // Array of learning objectives
    defaultValue: []
  },
  positions: {
    type: DataTypes.JSON, // Array of FEN positions with metadata
    defaultValue: []
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  estimatedDuration: {
    type: DataTypes.INTEGER, // Duration in minutes
    defaultValue: 30
  }
}, {
  tableName: 'lessons',
  timestamps: true
});

module.exports = Lesson;

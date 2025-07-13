const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ConversationInsight = sequelize.define('ConversationInsight', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  conversation_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'conversations',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  insight_type: {
    type: DataTypes.ENUM(
      'skill_assessment',
      'mistake_pattern',
      'learning_preference',
      'topic_interest',
      'difficulty_level',
      'question_pattern',
      'progress_indicator',
      'emotional_state',
      'confusion_point',
      'breakthrough_moment'
    ),
    allowNull: false
  },
  topic: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  summary: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  confidence_score: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.5,
    validate: {
      min: 0.0,
      max: 1.0
    }
  },
  keywords: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  context_data: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  relevance_tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'conversation_insights',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['conversation_id']
    },
    {
      fields: ['insight_type']
    },
    {
      fields: ['topic']
    },
    {
      fields: ['confidence_score']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['is_active']
    }
  ]
});

module.exports = ConversationInsight;

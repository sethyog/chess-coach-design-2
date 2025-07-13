const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CoachingProfile = sequelize.define('CoachingProfile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  skill_level: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced', 'expert'),
    allowNull: false,
    defaultValue: 'beginner'
  },
  estimated_rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 400,
      max: 3000
    }
  },
  common_mistakes: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  strengths: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  weaknesses: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  learning_style: {
    type: DataTypes.ENUM('visual', 'analytical', 'tactical', 'positional', 'mixed'),
    allowNull: false,
    defaultValue: 'mixed'
  },
  preferred_openings: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  progress_metrics: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      lessons_completed: 0,
      topics_mastered: [],
      improvement_areas: [],
      session_count: 0,
      avg_session_duration: 0,
      last_active: null
    }
  },
  coaching_goals: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  personality_traits: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      patience_level: 'medium',
      detail_preference: 'medium',
      challenge_preference: 'medium',
      feedback_style: 'constructive'
    }
  }
}, {
  tableName: 'coaching_profiles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['skill_level']
    },
    {
      fields: ['estimated_rating']
    }
  ]
});

module.exports = CoachingProfile;

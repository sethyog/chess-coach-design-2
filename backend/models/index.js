const { sequelize } = require('../config/database');
const Conversation = require('./Conversation');
const Message = require('./Message');
const CoachingProfile = require('./CoachingProfile');
const ConversationInsight = require('./ConversationInsight');
const Lesson = require('./Lesson');
const UserProgress = require('./UserProgress');

// Define associations
Conversation.hasMany(Message, {
  foreignKey: 'conversation_id',
  as: 'messages'
});

Message.belongsTo(Conversation, {
  foreignKey: 'conversation_id',
  as: 'conversation'
});

Conversation.hasMany(ConversationInsight, {
  foreignKey: 'conversation_id',
  as: 'insightRecords' // changed from 'insights' to avoid naming collision
});

ConversationInsight.belongsTo(Conversation, {
  foreignKey: 'conversation_id',
  as: 'conversation'
});

// Lesson and UserProgress associations
Lesson.hasMany(UserProgress, {
  foreignKey: 'lessonId',
  as: 'userProgress'
});

UserProgress.belongsTo(Lesson, {
  foreignKey: 'lessonId',
  as: 'lesson'
});

UserProgress.belongsTo(Conversation, {
  foreignKey: 'conversationId',
  as: 'conversation'
});

Conversation.hasOne(UserProgress, {
  foreignKey: 'conversationId',
  as: 'lessonProgress'
});

// Sync database (create tables if they don't exist)
const syncDatabase = async () => {
  try {
    //await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing database:', error);
  }
};

module.exports = {
  sequelize,
  Conversation,
  Message,
  CoachingProfile,
  ConversationInsight,
  Lesson,
  UserProgress,
  syncDatabase
};

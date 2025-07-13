const { sequelize } = require('../config/database');
const Conversation = require('./Conversation');
const Message = require('./Message');
const CoachingProfile = require('./CoachingProfile');
const ConversationInsight = require('./ConversationInsight');

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
  syncDatabase
};

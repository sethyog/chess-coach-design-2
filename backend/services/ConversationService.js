const { Conversation, Message } = require('../models');
const { Op } = require('sequelize');

class ConversationService {
  
  // Create a new conversation
  async createConversation(userId, title = 'New Conversation', metadata = {}) {
    try {
      const conversation = await Conversation.create({
        user_id: userId,
        title,
        metadata
      });
      return conversation;
    } catch (error) {
      throw new Error(`Failed to create conversation: ${error.message}`);
    }
  }

  // Get all conversations for a user
  async getUserConversations(userId, limit = 50, offset = 0) {
    try {
      const conversations = await Conversation.findAll({
        where: { user_id: userId },
        include: [{
          model: Message,
          as: 'messages',
          limit: 1,
          order: [['timestamp', 'DESC']],
          attributes: ['content', 'timestamp', 'role']
        }],
        order: [['updated_at', 'DESC']],
        limit,
        offset
      });
      return conversations;
    } catch (error) {
      throw new Error(`Failed to get user conversations: ${error.message}`);
    }
  }

  // Get a specific conversation with messages
  async getConversation(conversationId, userId) {
    try {
      const conversation = await Conversation.findOne({
        where: { 
          id: conversationId,
          user_id: userId 
        },
        include: [{
          model: Message,
          as: 'messages',
          order: [['timestamp', 'ASC']]
        }]
      });
      
      if (!conversation) {
        throw new Error('Conversation not found');
      }
      
      return conversation;
    } catch (error) {
      throw new Error(`Failed to get conversation: ${error.message}`);
    }
  }

  // Update conversation title
  async updateConversationTitle(conversationId, userId, title) {
    try {
      const [updatedRows] = await Conversation.update(
        { title },
        { 
          where: { 
            id: conversationId,
            user_id: userId 
          }
        }
      );
      
      if (updatedRows === 0) {
        throw new Error('Conversation not found');
      }
      
      return await this.getConversation(conversationId, userId);
    } catch (error) {
      throw new Error(`Failed to update conversation: ${error.message}`);
    }
  }

  // Delete a conversation
  async deleteConversation(conversationId, userId) {
    try {
      const deletedRows = await Conversation.destroy({
        where: { 
          id: conversationId,
          user_id: userId 
        }
      });
      
      if (deletedRows === 0) {
        throw new Error('Conversation not found');
      }
      
      return true;
    } catch (error) {
      throw new Error(`Failed to delete conversation: ${error.message}`);
    }
  }

  // Add a message to a conversation
  async addMessage(conversationId, role, content, metadata = {}) {
    try {
      console.log(`Adding message to conversation ${conversationId} with role ${role}`);
      const message = await Message.create({
        conversation_id: conversationId,
        role,
        content,
        metadata
      });

      // Update conversation's updated_at timestamp
      await Conversation.update(
        { updated_at: new Date() },
        { where: { id: conversationId } }
      );

      return message;
    } catch (error) {
      throw new Error(`Failed to add message: ${error.message}`);
    }
  }

  // Get conversation messages (with pagination)
  async getConversationMessages(conversationId, userId, limit = 50, offset = 0) {
    try {
      // First verify the conversation belongs to the user
      const conversation = await Conversation.findOne({
        where: { 
          id: conversationId,
          user_id: userId 
        }
      });

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      const messages = await Message.findAll({
        where: { conversation_id: conversationId },
        order: [['timestamp', 'ASC']],
        limit,
        offset
      });

      return messages;
    } catch (error) {
      throw new Error(`Failed to get messages: ${error.message}`);
    }
  }

  // Get or create conversation for a user
  async getOrCreateConversation(userId, conversationId = null) {
    try {
      if (conversationId) {
        // Try to get existing conversation
        const conversation = await this.getConversation(conversationId, userId);
        return conversation;
      } else {
        // Create new conversation
        const conversation = await this.createConversation(userId);
        return conversation;
      }
    } catch (error) {
      // If conversation not found, create a new one
      if (error.message.includes('not found')) {
        return await this.createConversation(userId);
      }
      throw error;
    }
  }

  // Auto-generate conversation title from first message
  async generateConversationTitle(conversationId, firstMessage) {
    try {
      // Extract first 50 characters and clean up
      let title = firstMessage.substring(0, 50).trim();
      
      // Remove incomplete words at the end
      const lastSpaceIndex = title.lastIndexOf(' ');
      if (lastSpaceIndex > 20) {
        title = title.substring(0, lastSpaceIndex);
      }
      
      // Add ellipsis if truncated
      if (firstMessage.length > 50) {
        title += '...';
      }
      
      // Update the conversation title
      await Conversation.update(
        { title },
        { where: { id: conversationId } }
      );
      
      return title;
    } catch (error) {
      console.error('Failed to generate conversation title:', error);
      return 'New Conversation';
    }
  }

  // Search conversations by content
  async searchConversations(userId, query, limit = 20) {
    try {
      const conversations = await Conversation.findAll({
        where: {
          user_id: userId,
          [Op.or]: [
            { title: { [Op.iLike]: `%${query}%` } }
          ]
        },
        include: [{
          model: Message,
          as: 'messages',
          where: {
            content: { [Op.iLike]: `%${query}%` }
          },
          required: false,
          limit: 3,
          order: [['timestamp', 'DESC']]
        }],
        order: [['updated_at', 'DESC']],
        limit
      });
      
      return conversations;
    } catch (error) {
      throw new Error(`Failed to search conversations: ${error.message}`);
    }
  }
}

module.exports = new ConversationService();

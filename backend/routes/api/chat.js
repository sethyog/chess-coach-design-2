const express = require('express');
const router = express.Router();
const ConversationService = require('../../services/ConversationService');

// Minimal LangChain setup
let OpenAI;
let ConversationChain;
let BufferMemory;
try {
  ({ OpenAI } = require('langchain/llms/openai'));
  ({ ConversationChain } = require('langchain/chains'));
  ({ BufferMemory } = require('langchain/memory'));
} catch (err) {
  // LangChain not installed; create mock classes for development
  OpenAI = class { async call(input) { return { text: `Echo: ${input}` }; } };
  ConversationChain = class {
    constructor(opts) { this.llm = opts.llm; this.memory = opts.memory; }
    async call({ input }) { return { response: (await this.llm.call(input)).text }; }
  };
  BufferMemory = class { constructor() {} };
}

// Create LangChain conversation with memory from database
async function createConversationChain(conversationId, userId) {
  const model = new OpenAI({ openAIApiKey: process.env.OPENAI_API_KEY });
  const memory = new BufferMemory();
  
  // Load previous messages from database to restore context
  try {
    const messages = await ConversationService.getConversationMessages(conversationId, userId);
    
    // Build conversation history for LangChain memory
    let conversationHistory = '';
    for (const message of messages) {
      if (message.role === 'user') {
        conversationHistory += `Human: ${message.content}\n`;
      } else {
        conversationHistory += `Assistant: ${message.content}\n`;
      }
    }
    
    // Initialize memory with conversation history
    if (conversationHistory) {
      memory.chatHistory = conversationHistory;
    }
  } catch (error) {
    console.error('Failed to load conversation history:', error);
  }
  
  return new ConversationChain({ llm: model, memory });
}

// POST /api/chat/message
router.post('/message', async (req, res) => {
  const { message, userId, conversationId } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Get or create conversation
    const conversation = await ConversationService.getOrCreateConversation(userId, conversationId);
    
    // Save user message to database
    await ConversationService.addMessage(conversation.id, 'user', message);
    
    // Generate title for new conversations
    if (!conversationId && conversation.title === 'New Conversation') {
      await ConversationService.generateConversationTitle(conversation.id, message);
    }
    
    // Create LangChain conversation with loaded context
    const chain = await createConversationChain(conversation.id, userId);
    
    // Generate AI response
    const result = await chain.call({ input: message });
    const response = result.response;
    
    // Save assistant response to database
    await ConversationService.addMessage(conversation.id, 'assistant', response);
    
    res.json({ 
      response,
      conversationId: conversation.id,
      title: conversation.title
    });
    
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// GET /api/chat/conversations - Get all conversations for a user
router.get('/conversations', async (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const conversations = await ConversationService.getUserConversations(userId);
    res.json(conversations);
  } catch (err) {
    console.error('Error fetching conversations:', err.message);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// GET /api/chat/conversations/:id - Get specific conversation
router.get('/conversations/:id', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const conversation = await ConversationService.getConversation(id, userId);
    res.json(conversation);
  } catch (err) {
    console.error('Error fetching conversation:', err.message);
    res.status(404).json({ error: 'Conversation not found' });
  }
});

// PUT /api/chat/conversations/:id - Update conversation title
router.put('/conversations/:id', async (req, res) => {
  const { id } = req.params;
  const { userId, title } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const conversation = await ConversationService.updateConversationTitle(id, userId, title);
    res.json(conversation);
  } catch (err) {
    console.error('Error updating conversation:', err.message);
    res.status(404).json({ error: 'Conversation not found' });
  }
});

// DELETE /api/chat/conversations/:id - Delete conversation
router.delete('/conversations/:id', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    await ConversationService.deleteConversation(id, userId);
    res.json({ message: 'Conversation deleted successfully' });
  } catch (err) {
    console.error('Error deleting conversation:', err.message);
    res.status(404).json({ error: 'Conversation not found' });
  }
});

// GET /api/chat/search - Search conversations
router.get('/search', async (req, res) => {
  const { userId, query } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const conversations = await ConversationService.searchConversations(userId, query);
    res.json(conversations);
  } catch (err) {
    console.error('Error searching conversations:', err.message);
    res.status(500).json({ error: 'Failed to search conversations' });
  }
});

module.exports = router;

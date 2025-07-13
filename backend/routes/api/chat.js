const express = require('express');
const router = express.Router();
const ConversationService = require('../../services/ConversationService');
const LessonService = require('../../services/LessonService');

// Minimal LangChain setup
let OpenAI;
let ConversationChain;
let BufferMemory;
try {
  ({ OpenAI } = require('@langchain/openai'));
  ({ ConversationChain } = require('langchain/chains'));
  ({ BufferMemory } = require('langchain/memory'));
} catch (err) {
  // LangChain not installed; create mock classes for development
  console.log('Error: ' + err.message);
  OpenAI = class { async call(input) { return { text: `Echo4: ${input}` }; } };
  ConversationChain = class {
    constructor(opts) { this.llm = opts.llm; this.memory = opts.memory; }
    async call({ input }) { return { response: (await this.llm.call(input)).text }; }
  };
  BufferMemory = class { 
    constructor() {} 
    async saveContext(input, output) {
      // Mock implementation - does nothing in development
    }
  };
}

// Create LangChain conversation with memory from database
async function createConversationChain(conversationId, userId) {
  const model = new OpenAI({ 
    openAIApiKey: process.env.OPENAI_API_KEY,
    maxTokens: 2000, // Allow longer responses
    temperature: 0.7 // Add some creativity for coaching
  });
  const memory = new BufferMemory();
  
  // Add system prompt to establish chess coach persona
  const systemPrompt = `You are an adaptive chess coach AI assistant. Your role is to:

1. **Assess the player's skill level** through their questions and game analysis requests
2. **Provide personalized coaching** tailored to their current abilities and learning style
3. **Explain chess concepts clearly** using appropriate terminology for their level
4. **Offer strategic and tactical advice** that helps them improve step by step
5. **Encourage growth mindset** and positive learning experiences
6. **Analyze positions and games** when requested, highlighting key insights
7. **Suggest training exercises** appropriate for their skill level
8. **Adapt your teaching style** based on their responses and progress

Key principles:
- Be patient, encouraging, and supportive
- Break complex concepts into digestible pieces
- Use analogies and examples when helpful
- Ask clarifying questions to better understand their needs
- Celebrate improvements and learning moments
- Focus on practical, actionable advice

Remember that every chess player is unique, so adapt your coaching approach to what works best for each individual.`;

  await memory.saveContext({ input: systemPrompt }, { output: "I understand. I'm ready to be your adaptive chess coach, tailoring my guidance to your specific needs and skill level. How can I help you improve your chess today?" });
  
  // Load previous messages from database to restore context
  try {
    const messages = await ConversationService.getConversationMessages(conversationId, userId);
    const meta = await ConversationService.getConversationMetadata(conversationId, userId);
    
    // Add insights as system context if available
    if (meta && Array.isArray(meta.insights) && meta.insights.length > 0) {
      const insightsContext = `Previous insights about this player: ${meta.insights.join(', ')}`;
      await memory.saveContext({ input: insightsContext }, { output: "I'll keep these insights in mind to provide better personalized coaching." });
    }
    
    // Add previous messages to memory in the correct format
    for (const message of messages) {
      if (message.role === 'user') {
        // Find the corresponding assistant response
        const nextMessage = messages.find(m => m.id > message.id && m.role === 'assistant');
        if (nextMessage) {
          await memory.saveContext({ input: message.content }, { output: nextMessage.content });
        }
      }
    }
  } catch (error) {
    console.error('Failed to load conversation history:', error);
  }
  
  return new ConversationChain({ llm: model, memory });
}

// Create lesson-aware conversation chain with enhanced context
async function createLessonAwareChain(conversationId, userId, lessonContext) {
  const model = new OpenAI({ 
    openAIApiKey: process.env.OPENAI_API_KEY,
    maxTokens: 2000,
    temperature: 0.7
  });
  const memory = new BufferMemory();
  
  // Enhanced system prompt for lesson-driven coaching
  const lessonPrompt = `You are an adaptive chess coach AI assistant integrated with interactive lessons. Your role is to:

1. **Guide students through structured lessons** while maintaining conversational coaching
2. **Adapt to lesson context** including current position, objectives, and student progress
3. **Provide hints and explanations** that align with lesson goals
4. **Suggest moves or concepts** relevant to the current lesson topic
5. **Track progress** and provide encouragement based on lesson completion

Current lesson context: ${lessonContext ? JSON.stringify(lessonContext) : 'General coaching session'}

When providing responses:
- Reference the current board position if available
- Align guidance with lesson objectives
- Suggest next steps that advance the lesson
- Provide explanations appropriate for the lesson difficulty level
- Use chess notation when discussing moves

You can provide special instructions by using these formats:
- BOARD_UPDATE: {fen: "position", highlight: ["squares"]} - to update the board display
- PROGRESS_UPDATE: {completed: boolean, score: number} - to update lesson progress
- LESSON_ACTION: {action: "next|previous|hint|reset"} - to control lesson flow`;

  await memory.saveContext({ input: lessonPrompt }, { output: "I understand. I'm ready to provide lesson-aware chess coaching, guiding you through structured learning while adapting to your current lesson context and progress." });
  
  // Load previous messages from database to restore context
  try {
    const messages = await ConversationService.getConversationMessages(conversationId, userId);
    const meta = await ConversationService.getConversationMetadata(conversationId, userId);
    
    // Add insights and lesson context as system context
    if (meta && Array.isArray(meta.insights) && meta.insights.length > 0) {
      const insightsContext = `Previous insights about this player: ${meta.insights.join(', ')}`;
      await memory.saveContext({ input: insightsContext }, { output: "I'll keep these insights in mind for personalized lesson coaching." });
    }
    
    // Add previous messages to memory
    for (const message of messages) {
      if (message.role === 'user') {
        const nextMessage = messages.find(m => m.id > message.id && m.role === 'assistant');
        if (nextMessage) {
          await memory.saveContext({ input: message.content }, { output: nextMessage.content });
        }
      }
    }
  } catch (error) {
    console.error('Failed to load lesson conversation history:', error);
  }
  
  return new ConversationChain({ llm: model, memory });
}

// Parse lesson response for special instructions
function parseLessonResponse(response, lessonContext) {
  const parsed = {
    text: response,
    boardUpdate: null,
    progressUpdate: null,
    lessonAction: null
  };
  
  // Extract board updates
  const boardMatch = response.match(/BOARD_UPDATE:\s*({[^}]+})/);
  if (boardMatch) {
    try {
      parsed.boardUpdate = JSON.parse(boardMatch[1]);
      parsed.text = response.replace(boardMatch[0], '').trim();
    } catch (error) {
      console.error('Failed to parse board update:', error);
    }
  }
  
  // Extract progress updates
  const progressMatch = response.match(/PROGRESS_UPDATE:\s*({[^}]+})/);
  if (progressMatch) {
    try {
      parsed.progressUpdate = JSON.parse(progressMatch[1]);
      parsed.text = parsed.text.replace(progressMatch[0], '').trim();
    } catch (error) {
      console.error('Failed to parse progress update:', error);
    }
  }
  
  // Extract lesson actions
  const actionMatch = response.match(/LESSON_ACTION:\s*({[^}]+})/);
  if (actionMatch) {
    try {
      parsed.lessonAction = JSON.parse(actionMatch[1]);
      parsed.text = parsed.text.replace(actionMatch[0], '').trim();
    } catch (error) {
      console.error('Failed to parse lesson action:', error);
    }
  }
  
  return parsed;
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
    console.log
    res.json(conversation);
  } catch (err) {
    console.error('Error fetching conversation:', err.message);
    res.status(404).json({ error: 'Conversation not found' });
  }
});

// GET /api/chat/conversations/:id/metadata - Get conversation metadata
router.get('/conversations/:id/metadata', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const meta = await ConversationService.getConversationMetadata(id, userId);
    res.json(meta);
  } catch (err) {
    console.error('Error fetching metadata:', err.message);
    res.status(404).json({ error: 'Conversation not found' });
  }
});

// PUT /api/chat/conversations/:id/metadata - Update coaching metadata or insights
router.put('/conversations/:id/metadata', async (req, res) => {
  const { id } = req.params;
  const { userId, coachingMetadata, insights } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    let updatedMeta = {};
    if (coachingMetadata) {
      updatedMeta.coaching = await ConversationService.updateCoachingMetadata(id, userId, coachingMetadata);
    }
    if (insights) {
      updatedMeta.insights = await ConversationService.addInsights(id, userId, insights);
    }
    res.json(updatedMeta);
  } catch (err) {
    console.error('Error updating metadata:', err.message);
    res.status(500).json({ error: 'Failed to update metadata' });
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

// POST /api/chat/lesson-message - Enhanced chat for lesson-driven conversations
router.post('/lesson-message', async (req, res) => {
  const { message, userId, conversationId, lessonContext } = req.body;
  
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
    
    // Create lesson-aware chain with enhanced context
    const chain = await createLessonAwareChain(conversation.id, userId, lessonContext);
    
    // Generate AI response with lesson context
    const result = await chain.call({ input: message });
    let response = result.response;
    
    // Parse response for board updates and lesson actions
    const parsedResponse = parseLessonResponse(response, lessonContext);
    
    // Save assistant response to database
    await ConversationService.addMessage(conversation.id, 'assistant', response);
    
    res.json({ 
      response: parsedResponse.text,
      conversationId: conversation.id,
      title: conversation.title,
      boardUpdate: parsedResponse.boardUpdate,
      progressUpdate: parsedResponse.progressUpdate,
      lessonAction: parsedResponse.lessonAction
    });
    
  } catch (err) {
    console.error('Lesson chat error:', err.message);
    res.status(500).json({ error: 'Failed to generate lesson response' });
  }
});

module.exports = router;

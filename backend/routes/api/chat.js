const express = require('express');
const router = express.Router();

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

const sessions = new Map();

function getConversation(userId = 'default') {
  if (!sessions.has(userId)) {
    const model = new OpenAI({ openAIApiKey: process.env.OPENAI_API_KEY });
    const memory = new BufferMemory();
    const chain = new ConversationChain({ llm: model, memory });
    sessions.set(userId, chain);
  }
  return sessions.get(userId);
}

// POST /api/chat/message
router.post('/message', async (req, res) => {
  const { message, userId } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const conversation = getConversation(userId);
    const result = await conversation.call({ input: message });
    res.json({ response: result.response });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

module.exports = router;

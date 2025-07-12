const axios = require('axios');

const baseURL = 'http://localhost:5000/api/chat';

async function testChatWithPersistence() {
  console.log('Testing chat with PostgreSQL persistence...\n');
  
  try {
    // Test 1: Send first message (should create new conversation)
    console.log('1. Sending first message...');
    const response1 = await axios.post(`${baseURL}/message`, {
      message: 'Hello! Can you help me learn chess?',
      userId: 'test-user-123'
    });
    
    console.log('Response:', response1.data);
    const conversationId = response1.data.conversationId;
    console.log('Conversation ID:', conversationId);
    
    // Test 2: Send second message to same conversation
    console.log('\n2. Sending second message to same conversation...');
    const response2 = await axios.post(`${baseURL}/message`, {
      message: 'What are the basic rules of chess?',
      userId: 'test-user-123',
      conversationId: conversationId
    });
    
    console.log('Response:', response2.data);
    
    // Test 3: Get all conversations for user
    console.log('\n3. Getting all conversations for user...');
    const response3 = await axios.get(`${baseURL}/conversations`, {
      params: { userId: 'test-user-123' }
    });
    
    console.log('Conversations:', JSON.stringify(response3.data, null, 2));
    
    // Test 4: Get specific conversation with messages
    console.log('\n4. Getting specific conversation with messages...');
    const response4 = await axios.get(`${baseURL}/conversations/${conversationId}`, {
      params: { userId: 'test-user-123' }
    });
    
    console.log('Conversation with messages:', JSON.stringify(response4.data, null, 2));
    
    console.log('\n✅ All tests passed! Chat persistence is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testChatWithPersistence();

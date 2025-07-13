import React, { useState, useEffect, useRef } from 'react';

const ChatbotPanel = ({ onBoardUpdate, currentPosition, lessonContext, onLessonAction }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [userId, setUserId] = useState('');
  const [conversations, setConversations] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  // Generate or retrieve user ID on component mount
  useEffect(() => {
    let storedUserId = localStorage.getItem('chess-coach-user-id');
    
    if (!storedUserId) {
      // Generate a unique user ID
      storedUserId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('chess-coach-user-id', storedUserId);
    }
    
    setUserId(storedUserId);
  }, []);

  useEffect(() => {
    if (userId) {
      fetchConversations();
    }
  }, [userId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const res = await fetch(`/api/chat/conversations?userId=${userId}`);
      const data = await res.json();
      setConversations(data);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  const loadConversation = async (id) => {
    try {
      const res = await fetch(`/api/chat/conversations/${id}?userId=${userId}`);
      const data = await res.json();
      setConversationId(id);
      if (data.messages) {
        setMessages(
          data.messages.map((m) => ({
            from: m.role === 'user' ? 'user' : 'bot',
            text: m.content
          }))
        );
      }
    } catch (err) {
      console.error('Failed to load conversation:', err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !userId) return;
    const userText = input;
    setMessages((prev) => [...prev, { from: 'user', text: userText }]);
    setInput('');

    try {
      // Use enhanced lesson endpoint if lesson context is available
      const endpoint = lessonContext ? '/api/chat/lesson-message' : '/api/chat/message';
      console.debug('here**************************');
      const payload = {
        message: userText,
        userId: userId,
        conversationId: conversationId
      };
      
      // Add lesson context for enhanced teaching
      if (lessonContext) {
        payload.lessonContext = {
          ...lessonContext,
          currentPosition: currentPosition
        };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      // Handle conversation setup
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
        fetchConversations();
      }
      
      // Handle AI response
      if (data.response) {
        setMessages((prev) => [...prev, { from: 'bot', text: data.response }]);
        
        // Handle board updates from lesson-driven chat
        if (data.boardUpdate && onBoardUpdate) {
          onBoardUpdate(data.boardUpdate);
        }
        
        // Handle lesson actions (progress updates, navigation)
        if (data.lessonAction && onLessonAction) {
          onLessonAction(data.lessonAction);
        }
        
        // Handle progress updates
        if (data.progressUpdate) {
          console.log('Lesson progress updated:', data.progressUpdate);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          { from: 'bot', text: 'No response received from AI' }
        ]);
      }
    } catch (err) {
      console.error('Chat API error:', err);
      setMessages((prev) => [
        ...prev,
        { from: 'bot', text: 'Error connecting to AI service: ' + err.message }
      ]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="card" style={{ marginTop: '20px', width: '100%', maxWidth: 'none' }}>
      <div className="card-header">
        <h3>Chess Coach</h3>
      </div>
      {conversations.length > 0 && (
        <div style={{ padding: '0 15px' }}>
          <label htmlFor="conv-select">Past Conversations:</label>
          <select
            id="conv-select"
            className="form-control"
            value={conversationId || ''}
            onChange={(e) => loadConversation(e.target.value)}
            style={{ marginBottom: '10px' }}
          >
            <option value="">New Conversation</option>
            {conversations.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      )}
      <div
        className="card-body"
        style={{
          height: '60vh', // Use viewport height for better responsiveness
          minHeight: '400px', // Minimum height to ensure usability
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '15px'
        }}
      >
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            style={{ 
              marginBottom: '15px',
              padding: '10px',
              backgroundColor: msg.from === 'user' ? '#f8f9fa' : '#e3f2fd',
              borderRadius: '8px',
              whiteSpace: 'pre-wrap', // preserve line breaks and wrap long lines
              wordBreak: 'break-word', // break long words
              lineHeight: '1.4'
            }}
          >
            <strong style={{ 
              color: msg.from === 'user' ? '#007bff' : '#2e7d32',
              marginBottom: '5px',
              display: 'block'
            }}>
              {msg.from === 'user' ? 'You' : 'Coach'}:
            </strong>
            <div style={{ 
              color: '#333',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              maxWidth: '100%',
              width: '100%'
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="card-footer" style={{ display: 'flex' }}>
        <input
          type="text"
          className="form-control"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your question..."
          style={{ marginRight: '10px' }}
        />
        <button className="btn btn-primary" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatbotPanel;

import React, { useState, useEffect } from 'react';

const ChatbotPanel = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [userId, setUserId] = useState('');

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

  const sendMessage = async () => {
    if (!input.trim() || !userId) return;
    const userText = input;
    setMessages(prev => [...prev, { from: 'user', text: userText }]);
    setInput('');

    try {
      const res = await fetch('/py-api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userText,
          userId: userId
        })
      });
      const data = await res.json();
      if (data.response) {
        setMessages(prev => [...prev, { from: 'bot', text: data.response }]);
      } else {
        setMessages(prev => [...prev, { from: 'bot', text: 'No response received from AI' }]);
      }
    } catch (err) {
      console.error('Chat API error:', err);
      setMessages(prev => [...prev, { from: 'bot', text: 'Error connecting to AI service: ' + err.message }]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="card" style={{ marginTop: '20px' }}>
      <div className="card-header">
        <h3>Chatbot</h3>
      </div>
      <div
        className="card-body"
        style={{ maxHeight: '200px', overflowY: 'auto' }}
      >
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: '10px' }}>
            <strong>{msg.from === 'user' ? 'You' : 'Coach'}:</strong> {msg.text}
          </div>
        ))}
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

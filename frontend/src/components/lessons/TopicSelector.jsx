import React, { useState, useEffect } from 'react';

const TopicSelector = ({ onTopicSelected, onClose }) => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedSubtopic, setSelectedSubtopic] = useState('');
  const [userLevel, setUserLevel] = useState('beginner');

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await fetch('/api/chat/topics');
      const data = await response.json();
      setTopics(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching topics:', error);
      setLoading(false);
    }
  };

  const handleStartLesson = () => {
    if (selectedTopic && selectedSubtopic) {
      const selectedTopicData = topics.find(t => t.topic === selectedTopic);
      const selectedSubtopicData = selectedTopicData?.subtopics.find(s => s.subtopic === selectedSubtopic);
      
      onTopicSelected({
        topic: selectedTopic,
        subtopic: selectedSubtopic,
        userLevel: userLevel,
        lessonData: selectedSubtopicData
      });
    }
  };

  const topicIcons = {
    tactics: '🎯',
    openings: '🚀',
    endgames: '🏁',
    strategy: '🧠',
    advanced: '⚡'
  };

  if (loading) {
    return (
      <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <div className="card" style={{ width: '400px', padding: '20px' }}>
          <div className="text-center">Loading topics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="card" style={{ width: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Choose Your Chess Lesson</h3>
          <button onClick={onClose} className="btn btn-secondary">×</button>
        </div>
        
        <div className="card-body">
          {/* User Level Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label><strong>Your Chess Level:</strong></label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              {['beginner', 'intermediate', 'advanced'].map(level => (
                <button
                  key={level}
                  onClick={() => setUserLevel(level)}
                  className={`btn ${userLevel === level ? 'btn-primary' : 'btn-outline-secondary'}`}
                  style={{ textTransform: 'capitalize' }}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Topic Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label><strong>Choose a Topic:</strong></label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginTop: '10px' }}>
              {topics.map(topicData => (
                <button
                  key={topicData.topic}
                  onClick={() => {
                    setSelectedTopic(topicData.topic);
                    setSelectedSubtopic('');
                  }}
                  className={`btn ${selectedTopic === topicData.topic ? 'btn-primary' : 'btn-outline-primary'}`}
                  style={{ padding: '15px', textAlign: 'center', textTransform: 'capitalize' }}
                >
                  <div style={{ fontSize: '24px', marginBottom: '5px' }}>
                    {topicIcons[topicData.topic] || '📚'}
                  </div>
                  {topicData.topic}
                </button>
              ))}
            </div>
          </div>

          {/* Subtopic Selection */}
          {selectedTopic && (
            <div style={{ marginBottom: '20px' }}>
              <label><strong>Choose a Lesson:</strong></label>
              <div style={{ marginTop: '10px' }}>
                {topics.find(t => t.topic === selectedTopic)?.subtopics.map(subtopicData => (
                  <div
                    key={subtopicData.subtopic}
                    onClick={() => setSelectedSubtopic(subtopicData.subtopic)}
                    className={`card ${selectedSubtopic === subtopicData.subtopic ? 'bg-primary text-white' : ''}`}
                    style={{ 
                      margin: '10px 0',
                      padding: '15px',
                      cursor: 'pointer',
                      border: selectedSubtopic === subtopicData.subtopic ? '2px solid #007bff' : '1px solid #dee2e6'
                    }}
                  >
                    <h5 style={{ margin: '0 0 5px 0' }}>{subtopicData.title}</h5>
                    <p style={{ margin: '0', fontSize: '14px' }}>{subtopicData.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Start Lesson Button */}
          <div style={{ textAlign: 'center', paddingTop: '20px', borderTop: '1px solid #dee2e6' }}>
            <button
              onClick={handleStartLesson}
              disabled={!selectedTopic || !selectedSubtopic}
              className="btn btn-success btn-lg"
              style={{ padding: '10px 30px' }}
            >
              Start Learning with AI Coach
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicSelector;

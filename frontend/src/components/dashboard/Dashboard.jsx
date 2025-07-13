import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TopicSelector from '../lessons/TopicSelector';

const Dashboard = () => {
  const [lessons, setLessons] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, this would fetch data from an API
    // For now, we'll use mock data
    const mockLessons = [
      {
        id: 1,
        title: 'Opening Principles for Beginners',
        date: '2025-06-15',
        description: 'Learn the key principles to follow in the opening phase of your chess games.',
        difficulty: 'Beginner',
        completed: false
      },
      {
        id: 2,
        title: 'Tactical Patterns: Pins and Skewers',
        date: '2025-06-18',
        description: 'Master two of the most common tactical motifs in chess.',
        difficulty: 'Intermediate',
        completed: false
      },
      {
        id: 3,
        title: 'Endgame Essentials: King and Pawn vs King',
        date: '2025-06-20',
        description: 'Essential knowledge for converting winning endgame positions.',
        difficulty: 'Intermediate',
        completed: true
      }
    ];

    const mockProfile = {
      name: 'John Doe',
      rating: 1250,
      gamesAnalyzed: 45,
      lessonsCompleted: 12,
      strengths: ['Endgames', 'Positional play'],
      weaknesses: ['Tactical awareness', 'Time management'],
      style: 'Positional'
    };

    // Simulate API call
    setTimeout(() => {
      setLessons(mockLessons);
      setUserProfile(mockProfile);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <h1 className="text-primary">Dashboard</h1>
      
      {userProfile && (
        <div className="card">
          <div className="card-header">
            <h2>Your Chess Profile</h2>
          </div>
          <div className="grid">
            <div>
              <h3>{userProfile.name}</h3>
              <p>Rating: {userProfile.rating}</p>
              <p>Games Analyzed: {userProfile.gamesAnalyzed}</p>
              <p>Lessons Completed: {userProfile.lessonsCompleted}</p>
            </div>
            <div>
              <h3>Playing Style: {userProfile.style}</h3>
              <div>
                <h4>Strengths</h4>
                <ul>
                  {userProfile.strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4>Areas to Improve</h4>
                <ul>
                  {userProfile.weaknesses.map((weakness, index) => (
                    <li key={index}>{weakness}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2>Your Lessons</h2>
        </div>
        <div>
          {lessons.length > 0 ? (
            <div className="grid">
              {lessons.map(lesson => (
                <div key={lesson.id} className={`card lesson-card ${lesson.completed ? 'bg-light' : ''}`}>
                  <h3>{lesson.title}</h3>
                  <p>{lesson.description}</p>
                  <p>Difficulty: {lesson.difficulty}</p>
                  <p>Date: {lesson.date}</p>
                  {lesson.completed ? (
                    <span className="text-success">Completed</span>
                  ) : (
                    <Link to={`/lessons/${lesson.id}`} className="btn btn-primary">
                      Start Lesson
                    </Link>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>No lessons available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Main Components
import Dashboard from './components/dashboard/Dashboard';
import Navbar from './components/layout/Navbar';
import LessonPlayer from './components/lessons/LessonPlayer';
import ChessboardDemo from './components/chess/ChessboardDemo';

// Context placeholder - would be implemented in a real app
const AuthContext = React.createContext();

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // This would connect to Firebase in a real implementation
  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      <div className="app">
        <Navbar />
        <main className="container">
          <Routes>
            <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/lessons/:id" element={isAuthenticated ? <LessonPlayer /> : <Navigate to="/login" />} />
            <Route path="/demo" element={<ChessboardDemo />} />
          </Routes>
        </main>
      </div>
    </AuthContext.Provider>
  );
}

export default App;
export { AuthContext };

import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

// Simple test components
const Home = () => <div style={{ padding: '20px', textAlign: 'center' }}>Home Page</div>;
const LoginTest = () => <div style={{ padding: '20px', textAlign: 'center' }}>Login Page</div>;
const RegisterTest = () => <div style={{ padding: '20px', textAlign: 'center' }}>Register Page</div>;

function TestApp() {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', color: '#3a6ea5' }}>Chess Coach Test</h1>
      
      <nav style={{ display: 'flex', justifyContent: 'center', margin: '20px 0', backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '5px' }}>
        <Link to="/" style={{ margin: '0 10px', color: '#3a6ea5', textDecoration: 'none' }}>Home</Link>
        <Link to="/login" style={{ margin: '0 10px', color: '#3a6ea5', textDecoration: 'none' }}>Login</Link>
        <Link to="/register" style={{ margin: '0 10px', color: '#3a6ea5', textDecoration: 'none' }}>Register</Link>
      </nav>
      
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginTest />} />
          <Route path="/register" element={<RegisterTest />} />
        </Routes>
      </div>
    </div>
  );
}

export default TestApp;

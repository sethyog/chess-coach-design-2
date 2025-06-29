import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../App';
import { auth, provider } from '../../firebase';
import { signInWithPopup } from 'firebase/auth';

const Login = () => {
  const { isAuthenticated, login } = useContext(AuthContext);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      login();
    } catch (error) {
      alert('Google sign-in failed: ' + error.message);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="container" style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '5px', marginTop: '50px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
      <h1 className="text-primary" style={{ color: '#3a6ea5' }}>Sign In</h1>
      <p className="lead" style={{ fontSize: '1.2rem', marginBottom: '20px' }}>
        <i className="fas fa-user"></i> Sign in with your Google account
      </p>
      <button
        onClick={handleGoogleLogin}
        className="btn btn-primary"
        style={{
          backgroundColor: '#3a6ea5',
          color: 'white',
          padding: '10px 20px',
          fontSize: '16px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        Sign in with Google
      </button>
    </div>
  );
};

export default Login;

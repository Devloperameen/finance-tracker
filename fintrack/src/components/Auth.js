import React, { useState } from 'react';
import axios from 'axios';

export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true); // Login ወይስ Signup መሆኑን መለያ
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      if (isLogin) {
        // 🔐 መግቢያ (Login)
        const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
        const { token, user } = response.data;
        
        // ቶከኑንና የተጠቃሚውን መረጃ በብሮውዘሩ ውስጥ ማቀመጥ
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        onLoginSuccess(); // ወደ ዋናው ዳሽቦርድ ማለፍ
      } else {
        // 📝 አዲስ አካውንት መፍጠሪያ (Signup)
        const response = await axios.post('http://localhost:5000/api/auth/signup', { username, email, password });
        alert(response.data.message);
        setIsLogin(true); // አካውንት ከፈጠረ በኋላ ወደ መግቢያ ገጽ መመለስ
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'ስህተት አጋጥሟል! እባክዎ ድጋሚ ይሞክሩ።');
    }
  };

  return (
    <div className="dashboard-container">
      <div className="main-card" style={{ maxWidth: '400px' }}>
        <h3 className="card-title">{isLogin ? 'Login to FINTRACK' : 'Create an Account'}</h3>
        
        {message && <p style={{ color: '#dc2626', backgroundColor: '#fef2f2', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', textAlign: 'center' }}>{message}</p>}
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="input-group">
              <label>Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your name" required />
            </div>
          )}
          <div className="input-group">
            <label>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" required />
          </div>
          
          <button type="submit" className="submit-btn" style={{ marginTop: '10px' }}>
            {isLogin ? 'Sign In' : 'Register'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: '#64748b' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span 
            onClick={() => { setIsLogin(!isLogin); setMessage(''); }} 
            style={{ color: '#4f46e5', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </span>
        </p>
      </div>
    </div>
  );
}
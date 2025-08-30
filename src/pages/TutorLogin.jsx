import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import blobImg from '../assets/images/blob.png';
import studentsImg from '../assets/images/students.png';
import teacherImg from '../assets/images/Teacher.png';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

function TutorLogin({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
        role: 'tutor'
      }, {
        withCredentials: true
      });
      localStorage.setItem('token', res.data.token);
      const decoded = parseJwt(res.data.token);
      if (decoded && decoded.user) {
        localStorage.setItem('user', JSON.stringify(decoded.user));
        if (setUser) setUser(decoded.user);
      }
      setLoading(false);
      setSuccess(true);
      
      // Handle admin users - redirect to regular dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <div className="login-root" style={{ minHeight: '100vh', background: '#fff', display: 'flex' }}>
      {/* Left Side: Login Form */}
      <div className="login-form-col d-flex flex-column justify-content-center align-items-center" style={{ flex: 1, background: '#fff', minHeight: '100vh', padding: '0 2rem' }}>
        <form className="login-form-box" style={{ width: 360, maxWidth: '100%', background: '#fff', borderRadius: 18, boxShadow: '0 4px 32px rgba(0,0,0,0.07)', padding: '2.5rem 2rem', margin: '2rem 0' }} onSubmit={handleSubmit}>
          <h2 className="fw-bold mb-2" style={{ fontSize: 32 }}>Welcome back</h2>
          <div className="mb-3 text-secondary" style={{ fontSize: 16 }}>Kindly fill in your details to sign in</div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Email Address</label>
            <input type="email" className="form-control" style={{ background: '#f8fafc', borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 16 }} value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="mb-2">
            <label className="form-label fw-semibold">Password</label>
            <input type="password" className="form-control" style={{ background: '#f8fafc', borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 16 }} value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div className="d-flex justify-content-end mb-3">
            <Link to="/forgot-password" className="text-info small fw-semibold text-decoration-none">Forgot password?</Link>
          </div>
          {error && <div className="alert alert-danger py-2 small mb-2">{error}</div>}
          <button type="submit" className="btn w-100 fw-bold mb-3" style={{ background: '#14b8a6', color: '#fff', fontSize: 18, borderRadius: 8 }} disabled={loading}>{loading ? 'Signing in...' : 'SIGN IN'}</button>
          <div className="d-flex align-items-center my-3">
            <div style={{ flex: 1, height: 1, background: '#e0e0e0' }} />
            <span className="mx-2 text-secondary">Or</span>
            <div style={{ flex: 1, height: 1, background: '#e0e0e0' }} />
          </div>
          <button type="button" className="btn w-100 fw-bold mb-2 d-flex align-items-center justify-content-center" style={{ background: '#111', color: '#fff', fontSize: 17, borderRadius: 8 }}>
          <i className="bi bi-google me-2" style={{ fontSize: 20 }}></i>
            CONTINUE WITH GOOGLE
          </button>
          <div className="text-center mt-3 text-secondary" style={{ fontSize: 15 }}>
            Don't have an account? <a href="/register/tutor" className="text-info fw-bold text-decoration-none">Sign up as Tutor</a> | <a href="/register/parent" className="text-info fw-bold text-decoration-none">Sign up as Student</a>
          </div>
          <div className="text-center mt-2 text-secondary" style={{ fontSize: 12 }}>
            <em>Admin users can login from either Student or Tutor login</em>
          </div>
        </form>
      </div>
      {/* Right Side: blob.png as background, students.png centered */}
      <div className="login-illustration d-none d-md-flex flex-column justify-content-center align-items-center" style={{ flex: 1, minHeight: '100vh', padding: 0, background: `url(${blobImg}) center center / cover no-repeat` }}>
        <img src={teacherImg} alt="students" style={{ width: 560, maxWidth: '100%', zIndex: 2 }} />
      </div>
      <style>{`
        .login-root { font-family: 'Inter', sans-serif; }
        .cloud { box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        @media (max-width: 900px) {
          .login-illustration { display: none !important; }
          .login-form-col { flex: 1 1 100%; min-width: 0; }
        }
      `}</style>
    </div>
  );
}

export default TutorLogin; 
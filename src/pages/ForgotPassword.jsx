import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import blobImg from '../assets/images/blob.png';
import studentsImg from '../assets/images/students.png';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

function ForgotPassword() {
  const [email, setEmail] = useState('');
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
      const res = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, {
        email
      });
      
      setLoading(false);
      setSuccess(true);
      
      // Redirect to OTP verification page after 2 seconds
      setTimeout(() => {
        navigate('/reset-password', { state: { email } });
      }, 2000);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.msg || 'Failed to send reset email');
    }
  };

  return (
    <div className="login-root" style={{ minHeight: '100vh', background: '#fff', display: 'flex' }}>
      {/* Left Side: blob.png as background, students.png centered */}
      <div className="login-illustration d-none d-md-flex flex-column justify-content-center align-items-center" style={{ flex: 1, minHeight: '100vh', padding: 0, background: `url(${blobImg}) center center / cover no-repeat` }}>
        <img src={studentsImg} alt="students" style={{ width: 560, maxWidth: '80%', zIndex: 2 }} />
      </div>
      
      {/* Right Side: Forgot Password Form */}
      <div className="login-form-col d-flex flex-column justify-content-center align-items-center" style={{ flex: 1, background: '#fff', minHeight: '100vh', padding: '0 2rem' }}>
        <div className="login-form-box" style={{ width: 360, maxWidth: '100%', background: '#fff', borderRadius: 18, boxShadow: '0 4px 32px rgba(0,0,0,0.07)', padding: '2.5rem 2rem', margin: '2rem 0' }}>
          <div className="text-center mb-4">
            <i className="bi bi-lock-fill" style={{ fontSize: 48, color: '#14b8a6' }}></i>
          </div>
          <h2 className="fw-bold mb-2 text-center" style={{ fontSize: 28 }}>Forgot Password?</h2>
          <div className="mb-4 text-secondary text-center" style={{ fontSize: 16 }}>
            Enter your email address and we'll send you a one-time password to reset your account.
          </div>
          
          {!success ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Email Address</label>
                <input 
                  type="email" 
                  className="form-control" 
                  style={{ background: '#f8fafc', borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 16 }} 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                />
              </div>
              
              {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}
              
              <button 
                type="submit" 
                className="btn w-100 fw-bold mb-3" 
                style={{ background: '#14b8a6', color: '#fff', fontSize: 18, borderRadius: 8 }} 
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Code'}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <div className="alert alert-success py-3 mb-3">
                <i className="bi bi-check-circle-fill me-2"></i>
                Reset code sent successfully!
              </div>
              <p className="text-secondary">Redirecting to verification page...</p>
            </div>
          )}
          
          <div className="text-center mt-4">
            <Link to="/parent-login" className="text-info fw-semibold text-decoration-none">
              <i className="bi bi-arrow-left me-1"></i>
              Back to Login
            </Link>
          </div>
        </div>
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

export default ForgotPassword; 
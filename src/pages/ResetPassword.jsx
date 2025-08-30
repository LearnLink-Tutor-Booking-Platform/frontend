import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import blobImg from '../assets/images/blob.png';
import studentsImg from '../assets/images/students.png';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

function ResetPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get email from navigation state or redirect to forgot password
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      navigate('/forgot-password');
    }
  }, [location.state, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
        email,
        otp,
        newPassword
      });
      
      setLoading(false);
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/parent-login');
      }, 3000);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.msg || 'Failed to reset password');
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    
    try {
      await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, {
        email
      });
      
      setLoading(false);
      alert('New OTP sent to your email!');
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.msg || 'Failed to resend OTP');
    }
  };

  if (!email) {
    return null; // Don't render until email is set
  }

  return (
    <div className="login-root" style={{ minHeight: '100vh', background: '#fff', display: 'flex' }}>
      {/* Left Side: blob.png as background, students.png centered */}
      <div className="login-illustration d-none d-md-flex flex-column justify-content-center align-items-center" style={{ flex: 1, minHeight: '100vh', padding: 0, background: `url(${blobImg}) center center / cover no-repeat` }}>
        <img src={studentsImg} alt="students" style={{ width: 560, maxWidth: '80%', zIndex: 2 }} />
      </div>
      
      {/* Right Side: Reset Password Form */}
      <div className="login-form-col d-flex flex-column justify-content-center align-items-center" style={{ flex: 1, background: '#fff', minHeight: '100vh', padding: '0 2rem' }}>
        <div className="login-form-box" style={{ width: 400, maxWidth: '100%', background: '#fff', borderRadius: 18, boxShadow: '0 4px 32px rgba(0,0,0,0.07)', padding: '2.5rem 2rem', margin: '2rem 0' }}>
          <div className="text-center mb-4">
            <i className="bi bi-shield-lock-fill" style={{ fontSize: 48, color: '#14b8a6' }}></i>
          </div>
          <h2 className="fw-bold mb-2 text-center" style={{ fontSize: 28 }}>Reset Password</h2>
          <div className="mb-4 text-secondary text-center" style={{ fontSize: 16 }}>
            Enter the 6-digit code sent to <strong>{email}</strong> and your new password.
          </div>
          
          {!success ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Verification Code</label>
                <input 
                  type="text" 
                  className="form-control text-center" 
                  style={{ background: '#f8fafc', borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 18, letterSpacing: '2px' }} 
                  value={otp} 
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                  placeholder="000000"
                  maxLength={6}
                  required 
                />
                <div className="form-text">Enter the 6-digit code from your email</div>
              </div>
              
              <div className="mb-3">
                <label className="form-label fw-semibold">New Password</label>
                <div className="input-group">
                  <input 
                    type={showPassword ? "text" : "password"}
                    className="form-control" 
                    style={{ background: '#f8fafc', borderRadius: '8px 0 0 8px', border: '1px solid #e0e0e0', fontSize: 16 }} 
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)} 
                    required 
                  />
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary" 
                    style={{ border: '1px solid #e0e0e0', borderLeft: 'none' }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
              </div>
              
              <div className="mb-3">
                <label className="form-label fw-semibold">Confirm New Password</label>
                <div className="input-group">
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-control" 
                    style={{ background: '#f8fafc', borderRadius: '8px 0 0 8px', border: '1px solid #e0e0e0', fontSize: 16 }} 
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)} 
                    required 
                  />
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary" 
                    style={{ border: '1px solid #e0e0e0', borderLeft: 'none' }}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
              </div>
              
              {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}
              
              <button 
                type="submit" 
                className="btn w-100 fw-bold mb-3" 
                style={{ background: '#14b8a6', color: '#fff', fontSize: 18, borderRadius: 8 }} 
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
              
              <div className="text-center">
                <button 
                  type="button" 
                  className="btn btn-link text-info fw-semibold text-decoration-none"
                  onClick={handleResendOTP}
                  disabled={loading}
                >
                  Didn't receive the code? Resend
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center">
              <div className="alert alert-success py-3 mb-3">
                <i className="bi bi-check-circle-fill me-2"></i>
                Password reset successfully!
              </div>
              <p className="text-secondary">Redirecting to login page...</p>
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

export default ResetPassword; 
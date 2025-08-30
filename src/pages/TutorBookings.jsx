import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import groupImg from '../assets/images/Group.png';
import objectImg from '../assets/images/Object.png';
import Footer from '../components/Footer';

const API_URL = `${import.meta.env.VITE_API_URL}/api/tutor/bookings`;

function TutorBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}?status=confirmed`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        const data = await res.json();
        if (data.success) {
          setBookings(data.data.bookings);
        } else {
          setError(data.message || 'Failed to fetch bookings');
        }
      } catch (err) {
        setError('Failed to fetch bookings');
      }
      setLoading(false);
    };
    fetchBookings();
  }, []);

  const [updatingId, setUpdatingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleMarkCompleted = async (bookingId) => {
    setUpdatingId(bookingId);
    setSuccessMsg(null);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tutor/bookings/${bookingId}/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Booking marked as completed!');
        setBookings(prev => prev.filter(b => b._id !== bookingId));
      } else {
        setError(data.message || 'Failed to update booking');
      }
    } catch (err) {
      setError('Failed to update booking');
    }
    setUpdatingId(null);
  };

  return (
    <div style={{ 
      backgroundColor: '#7ee3f2', 
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Images */}
      <img src={groupImg} alt="clouds" style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        maxWidth: '100vw', 
        zIndex: 0, 
        pointerEvents: 'none' 
      }} />
      <img src={objectImg} alt="buildings" style={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        width: '100%', 
        maxWidth: '100vw', 
        zIndex: 0, 
        pointerEvents: 'none' 
      }} />

      {/* Main Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="container py-5">
          <div className="card border-0 shadow-sm rounded-4 mb-4" style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)'
          }}>
            <div className="card-body p-4">
              <h2 className="fw-bold mb-4 text-center" style={{ color: '#14b8a6' }}>
                <i className="bi bi-calendar-check me-2"></i>
                My Bookings
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="card border-0 shadow-sm rounded-4" style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}>
              <div className="card-body p-5">
                <div className="d-flex justify-content-center align-items-center" style={{minHeight: 200}}>
                  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="40" cy="40" r="36" stroke="#14b8a6" strokeWidth="8" strokeDasharray="56 56" strokeLinecap="round">
                      <animateTransform attributeName="transform" type="rotate" from="0 40 40" to="360 40 40" dur="1s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="40" cy="25" r="6" fill="#14b8a6">
                      <animate attributeName="cy" values="25;15;25" dur="1s" repeatCount="indefinite" />
                    </circle>
                    <rect x="36" y="45" width="8" height="18" rx="4" fill="#14b8a6">
                      <animate attributeName="y" values="45;55;45" dur="1s" repeatCount="indefinite" />
                    </rect>
                  </svg>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="card border-0 shadow-sm rounded-4" style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}>
              <div className="card-body p-4">
                <div className="alert alert-danger text-center" style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)', borderColor: '#dc3545', color: '#dc3545' }}>{error}</div>
              </div>
            </div>
          ) : successMsg ? (
            <div className="card border-0 shadow-sm rounded-4" style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}>
              <div className="card-body p-4">
                <div className="alert alert-success text-center" style={{ backgroundColor: 'rgba(25, 135, 84, 0.1)', borderColor: '#198754', color: '#198754' }}>{successMsg}</div>
              </div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="card border-0 shadow-sm rounded-4" style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}>
              <div className="card-body p-4">
                <div className="alert alert-info text-center" style={{ backgroundColor: 'rgba(20, 184, 166, 0.1)', borderColor: '#14b8a6', color: '#14b8a6' }}>No bookings found.</div>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {bookings.map(booking => (
                <div className="col-md-6 col-lg-4" key={booking._id}>
                  <div className="card border-0 shadow-sm h-100 rounded-4" style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    transition: 'transform 0.2s ease-in-out'
                  }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div className="card-body p-4">
                      <div className="mb-3 text-center">
                        <i className="bi bi-calendar-event display-4" style={{ color: '#14b8a6' }}></i>
                      </div>
                      <h5 className="card-title fw-bold text-center mb-3" style={{ color: '#14b8a6' }}>
                        With {booking.parentId?.name || 'Parent'}
                      </h5>
                      <div className="mb-2 text-center text-secondary">
                        <i className="bi bi-journal-bookmark me-2"></i> {booking.subject?.name || 'Unknown Subject'}
                      </div>
                      <div className="mb-3 text-center text-secondary">
                        <i className="bi bi-clock me-2"></i> {new Date(booking.sessionTime).toLocaleString()}
                      </div>
                      <div className="mb-3 text-center">
                        <span className="badge px-3 py-2" style={{ backgroundColor: '#14b8a6', fontSize: 14 }}>Confirmed</span>
                      </div>
                      <div className="d-grid mt-3">
                        <button
                          className="btn btn-lg fw-bold rounded-pill"
                          style={{ 
                            backgroundColor: updatingId === booking._id ? '#6c757d' : '#198754', 
                            borderColor: updatingId === booking._id ? '#6c757d' : '#198754', 
                            color: 'white' 
                          }}
                          disabled={updatingId === booking._id}
                          onClick={() => handleMarkCompleted(booking._id)}
                        >
                          {updatingId === booking._id ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Updating...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-check-circle me-2"></i>
                              Mark as Completed
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ position: 'relative', zIndex: 2 }}>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default TutorBookings; 
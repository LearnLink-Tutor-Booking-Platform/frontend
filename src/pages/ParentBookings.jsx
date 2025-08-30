import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import blobImg from '../assets/images/blob.png';
import groupImg from '../assets/images/Group.png';
import objectImg from '../assets/images/Object.png';
import Footer from '../components/Footer';

const API_URL = `${import.meta.env.VITE_API_URL}/api/parent/bookings`;
const SUBJECTS_API = `${import.meta.env.VITE_API_URL}/api/subjects`;

const ParentBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(API_URL, {
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

  useEffect(() => {
    // Fetch all subjects for lookup
    fetch(SUBJECTS_API)
      .then(res => res.json())
      .then(data => {
        if (data.success) setSubjects(data.data.subjects);
      });
  }, []);

  // Helper to get subject object by id or name
  const getSubject = (subject) => {
    if (!subject) return null;
    // subject can be id or object or name
    if (typeof subject === 'object' && subject._id) return subject;
    if (typeof subject === 'string') {
      return subjects.find(s => s._id === subject || s.name === subject);
    }
    return null;
  };

  const handleCancel = async (bookingId) => {
    const result = await Swal.fire({
      title: 'Cancel Booking?',
      text: "Are you sure you want to cancel this booking? This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, cancel it!',
      cancelButtonText: 'Keep Booking'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/parent/bookings/cancel`, {
          method: 'POST',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ bookingId }),
        });
        const data = await res.json();
        if (data.success) {
          setBookings(prev => prev.filter(b => b._id !== bookingId));
          Swal.fire({
            icon: 'success',
            title: 'Booking Cancelled!',
            text: 'Your booking has been cancelled successfully.',
            confirmButtonColor: '#14b8a6',
            timer: 2000,
            showConfirmButton: false
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Cancellation Failed',
            text: data.message || 'Failed to cancel booking',
            confirmButtonColor: '#14b8a6'
          });
        }
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to cancel booking',
          confirmButtonColor: '#14b8a6'
        });
      }
    }
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

          {(loading || subjects.length === 0) ? (
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
              {bookings.map(booking => {
                const subj = getSubject(booking.subject);
                return (
                <div className="col-md-6 col-lg-4" key={booking._id}>
                  <div className="card border-0 shadow-sm h-100 rounded-4" style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    transition: 'transform 0.2s ease-in-out'
                  }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                      {/* Subject image banner */}
                      <div style={{ position: 'relative', height: '120px', overflow: 'hidden', borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem', background: '#f2f2f2' }}>
                        <img 
                          src={subj?.imageUrl ? (subj.imageUrl.startsWith('/uploads/') ? `${import.meta.env.VITE_API_URL}${subj.imageUrl}` : subj.imageUrl) : blobImg}
                          alt={subj?.name || 'Subject'} 
                          style={{width: '100%', height: '100%', objectFit: 'cover'}} 
                        />
                      </div>
                      <div className="card-body">
                        <div className="text-uppercase text-info fw-bold text-center mb-1" style={{ fontSize: 15, color: '#14b8a6' }}>
                          {subj?.name || 'Unknown Subject'}
                      </div>
                      <h5 className="card-title fw-bold text-center mb-2">
                        With <Link to={`/parent/tutor/${booking.tutorId._id}`} className="text-decoration-none" style={{ color: '#14b8a6' }}>{booking.tutorId.name}</Link>
                      </h5>
                      <div className="mb-2 text-center text-secondary">
                          <i className="bi bi-journal-bookmark"></i> {subj?.name || 'Unknown Subject'}
                      </div>
                      <div className="mb-2 text-center text-secondary">
                        <i className="bi bi-clock"></i> {new Date(booking.sessionTime).toLocaleString()}
                      </div>
                      <div className="mb-2 text-center">
                        <span className={`badge ${booking.status === 'completed' ? 'bg-success' : booking.status === 'confirmed' ? 'bg-primary' : 'bg-warning text-dark'}`} style={{ fontSize: 14 }}>{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>
                      </div>
                        {booking.status !== 'confirmed' && booking.status !== 'completed' && (
                          <div className="d-grid mt-2">
                            <button className="btn btn-outline-danger btn-sm rounded-pill" onClick={() => handleCancel(booking._id)}>Cancel</button>
                          </div>
                        )}
                      {booking.status === 'completed' && !booking.reviewed && (
                        <div className="text-center mt-2">
                          <Link to={`/parent/add-review/${booking._id}`} className="btn btn-outline-success btn-sm rounded-pill">Add Review</Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ position: 'relative', zIndex: 2 }}>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default ParentBookings; 
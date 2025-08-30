import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import blobImg from '../assets/images/blob.png';
import groupImg from '../assets/images/Group.png';
import objectImg from '../assets/images/Object.png';
import Footer from '../components/Footer';

const API_URL = `${import.meta.env.VITE_API_URL}/api/parent/waitlist`;
const SUBJECTS_API = `${import.meta.env.VITE_API_URL}/api/subjects`;

const ParentWaitlist = () => {
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const fetchWaitlist = async () => {
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
          setWaitlist(data.data.waitlistEntries);
        } else {
          setError(data.message || 'Failed to fetch waitlist');
        }
      } catch (err) {
        setError('Failed to fetch waitlist');
      }
      setLoading(false);
    };
    fetchWaitlist();
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

  const handleCancel = async (waitlistId) => {
    const result = await Swal.fire({
      title: 'Cancel Waitlist Entry?',
      text: "Are you sure you want to cancel this waitlist entry? This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, cancel it!',
      cancelButtonText: 'Keep Entry'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/parent/waitlist/cancel`, {
          method: 'POST',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ waitlistId }),
        });
        const data = await res.json();
        if (data.success) {
          setWaitlist(prev => prev.filter(w => w._id !== waitlistId));
          Swal.fire({
            icon: 'success',
            title: 'Entry Cancelled!',
            text: 'Your waitlist entry has been cancelled successfully.',
            confirmButtonColor: '#14b8a6',
            timer: 2000,
            showConfirmButton: false
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Cancellation Failed',
            text: data.message || 'Failed to cancel waitlist entry',
            confirmButtonColor: '#14b8a6'
          });
        }
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to cancel waitlist entry',
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
                <i className="bi bi-clock-history me-2"></i>
                My Waitlist
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
                  <div className="spinner-border" style={{color: '#14b8a6'}} role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
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
          ) : waitlist.length === 0 ? (
            <div className="card border-0 shadow-sm rounded-4" style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}>
              <div className="card-body p-4">
                <div className="alert alert-info text-center" style={{ backgroundColor: 'rgba(20, 184, 166, 0.1)', borderColor: '#14b8a6', color: '#14b8a6' }}>No waitlist entries found.</div>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {waitlist.map(entry => {
                const subj = getSubject(entry.subject);
                return (
                <div className="col-md-6 col-lg-4" key={entry._id}>
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
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div className="card-body">
                        <div className="text-uppercase text-info fw-bold text-center mb-1" style={{ fontSize: 15, color: '#14b8a6' }}>
                          {subj?.name || 'Unknown Subject'}
                      </div>
                      <h5 className="card-title fw-bold text-center mb-2">
                        Waiting for <Link to={`/parent/tutor/${entry.tutorId._id}`} className="text-decoration-none" style={{ color: '#14b8a6' }}>{entry.tutorId.name}</Link>
                      </h5>
                      <div className="mb-2 text-center text-secondary">
                          <i className="bi bi-journal-bookmark"></i> {subj?.name || 'Unknown Subject'}
                      </div>
                      <div className="mb-2 text-center text-secondary">
                        <i className="bi bi-clock-history"></i> {new Date(entry.requestedTime).toLocaleString()}
                        </div>
                        <div className="d-grid mt-2">
                          <button className="btn btn-outline-danger btn-sm rounded-pill" onClick={() => handleCancel(entry._id)}>Cancel</button>
                        </div>
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

export default ParentWaitlist; 
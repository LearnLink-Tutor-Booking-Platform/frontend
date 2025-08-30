import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import groupImg from '../assets/images/Group.png';
import objectImg from '../assets/images/Object.png';
import Footer from '../components/Footer';

const API_URL = `${import.meta.env.VITE_API_URL}/api/tutor/waitlist`;
const ACCEPT_URL = `${import.meta.env.VITE_API_URL}/api/tutor/waitlist/accept`;
const REMOVE_URL = `${import.meta.env.VITE_API_URL}/api/tutor/waitlist/remove`;
const SUBJECTS_API = `${import.meta.env.VITE_API_URL}/api/subjects`;

const TutorWaitlist = () => {
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalEntry, setModalEntry] = useState(null);
  const [modalDate, setModalDate] = useState('');
  const [modalTime, setModalTime] = useState('');
  const [subjects, setSubjects] = useState([]);

  // Helper to get subject name by id
  const getSubjectName = (subjectId) => {
    if (!subjectId) return 'Unknown Subject';
    const subject = subjects.find(s => s._id === subjectId);
    return subject ? subject.name : 'Unknown Subject';
  };

  const fetchSubjects = async () => {
    try {
      const res = await fetch(SUBJECTS_API);
      const data = await res.json();
      if (data.success) {
        setSubjects(data.data.subjects || []);
      }
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
    }
  };

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

  useEffect(() => {
    fetchSubjects();
    fetchWaitlist();
  }, []);

  const openAcceptModal = (entry) => {
    setModalEntry(entry);
    // Default to waitlist requested date/time
    const dt = new Date(entry.requestedTime);
    setModalDate(dt.toISOString().slice(0, 10));
    setModalTime(dt.toTimeString().slice(0, 5));
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalEntry(null);
    setModalDate('');
    setModalTime('');
  };

  const handleAccept = async () => {
    if (!modalEntry) return;
    setActionLoading(modalEntry._id + '-accept');
    try {
      const token = localStorage.getItem('token');
      // Combine date and time into ISO string
      const sessionTime = new Date(`${modalDate}T${modalTime}`);
      const res = await fetch(ACCEPT_URL, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ waitlistId: modalEntry._id, sessionTime }),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        fetchWaitlist();
        closeModal();
        Swal.fire({
          icon: 'success',
          title: 'Waitlist Accepted!',
          text: 'The waitlist entry has been accepted and converted to a booking.',
          confirmButtonColor: '#14b8a6',
          timer: 3000,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Accept Failed',
          text: data.message || 'Failed to accept waitlist entry',
          confirmButtonColor: '#14b8a6'
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to accept waitlist entry',
        confirmButtonColor: '#14b8a6'
      });
    }
    setActionLoading('');
  };

  const handleRemove = async (waitlistId) => {
    const result = await Swal.fire({
      title: 'Remove Waitlist Entry?',
      text: "Are you sure you want to remove this waitlist entry? This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, remove it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      setActionLoading(waitlistId + '-remove');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(REMOVE_URL, {
          method: 'POST',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ waitlistId }),
          credentials: 'include',
        });
        const data = await res.json();
        if (data.success) {
          fetchWaitlist();
          Swal.fire({
            icon: 'success',
            title: 'Entry Removed!',
            text: 'The waitlist entry has been removed successfully.',
            confirmButtonColor: '#14b8a6',
            timer: 2000,
            showConfirmButton: false
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Remove Failed',
            text: data.message || 'Failed to remove waitlist entry',
            confirmButtonColor: '#14b8a6'
          });
        }
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to remove waitlist entry',
          confirmButtonColor: '#14b8a6'
        });
      }
      setActionLoading('');
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
                <i className="bi bi-hourglass-split me-2"></i>
                My Waitlist (Tutor)
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
              {waitlist.map(entry => (
                <div className="col-md-6 col-lg-4" key={entry._id}>
                  <div className="card border-0 shadow-sm h-100 rounded-4" style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    transition: 'transform 0.2s ease-in-out'
                  }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div className="card-body p-4">
                      <div className="mb-3 text-center">
                        <i className="bi bi-hourglass-split display-4" style={{ color: '#14b8a6' }}></i>
                      </div>
                      <h5 className="card-title fw-bold text-center mb-3" style={{ color: '#14b8a6' }}>
                        {entry.parentId ? (
                          <>Parent: <span style={{ color: '#14b8a6' }}>{entry.parentId.name}</span></>
                        ) : (
                          <span className="text-secondary">Unknown Parent</span>
                        )}
                      </h5>
                      <div className="mb-2 text-center text-secondary">
                        <i className="bi bi-journal-bookmark me-2"></i> {getSubjectName(entry.subject)}
                      </div>
                      <div className="mb-3 text-center text-secondary">
                        <i className="bi bi-clock-history me-2"></i> {new Date(entry.requestedTime).toLocaleString()}
                      </div>
                      <div className="d-flex justify-content-center gap-2 mt-3">
                        <button className="btn btn-lg fw-bold rounded-pill" style={{ backgroundColor: '#198754', borderColor: '#198754', color: 'white' }} onClick={() => openAcceptModal(entry)}>
                          <i className="bi bi-check-circle me-2"></i>
                          Accept
                        </button>
                        <button className="btn btn-lg fw-bold rounded-pill" style={{ backgroundColor: '#dc3545', borderColor: '#dc3545', color: 'white' }} disabled={actionLoading === entry._id + '-remove'} onClick={() => handleRemove(entry._id)}>
                          {actionLoading === entry._id + '-remove' ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Removing...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-trash me-2"></i>
                              Remove
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

      {/* Modal for picking date and time */}
      {showModal && (
        <>
          <div className="modal fade show" style={{display: 'block', position: 'fixed', zIndex: 1051, top: 0, left: 0, width: '100vw', height: '100vh', overflow: 'auto'}} tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content rounded-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)', backdropFilter: 'blur(10px)' }}>
                <div className="modal-header border-0">
                  <h5 className="modal-title fw-bold" style={{ color: '#14b8a6' }}>
                    <i className="bi bi-calendar-plus me-2"></i>
                    Pick Date & Time for Booking
                  </h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold" style={{ color: '#14b8a6' }}>Date</label>
                    <input type="date" className="form-control" value={modalDate} onChange={e => setModalDate(e.target.value)} style={{ borderColor: '#e2e8f0', borderRadius: '0.5rem' }} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold" style={{ color: '#14b8a6' }}>Time</label>
                    <input type="time" className="form-control" value={modalTime} onChange={e => setModalTime(e.target.value)} style={{ borderColor: '#e2e8f0', borderRadius: '0.5rem' }} />
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn rounded-pill" onClick={closeModal} style={{ borderColor: '#6c757d', color: '#6c757d', backgroundColor: 'transparent' }}>
                    <i className="bi bi-x-circle me-2"></i>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-lg fw-bold rounded-pill" style={{ backgroundColor: '#198754', borderColor: '#198754', color: 'white' }} disabled={actionLoading === modalEntry?._id + '-accept'} onClick={handleAccept}>
                    {actionLoading === modalEntry?._id + '-accept' ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Accepting...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Confirm & Book
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Modal backdrop */}
          <div className="modal-backdrop fade show" style={{position: 'fixed', zIndex: 1050, top: 0, left: 0, width: '100vw', height: '100vh'}}></div>
        </>
      )}
    </div>
  );
};

export default TutorWaitlist; 
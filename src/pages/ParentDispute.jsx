import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import groupImg from '../assets/images/Group.png';
import objectImg from '../assets/images/Object.png';
import Footer from '../components/Footer';

const API_URL = `${import.meta.env.VITE_API_URL}/api/parent/disputes`;
const BOOKINGS_URL = `${import.meta.env.VITE_API_URL}/api/parent/bookings-for-dispute`;
const CREATE_URL = `${import.meta.env.VITE_API_URL}/api/parent/disputes`;
const AVATAR_PLACEHOLDER = `https://ui-avatars.com/api/?background=2DB8A1&color=fff&size=128&name=`;

const DISPUTE_TYPES = [
  { value: 'payment', label: 'Payment Issue' },
  { value: 'quality', label: 'Quality Concern' },
  { value: 'scheduling', label: 'Scheduling Problem' },
  { value: 'behavior', label: 'Behavior Issue' },
  { value: 'technical', label: 'Technical Problem' },
  { value: 'other', label: 'Other' }
];

const DisputeListItem = ({ dispute, onSelect }) => (
  <div className="card border-0 shadow-sm rounded-4 mb-3" onClick={() => onSelect(dispute)} style={{ 
    cursor: 'pointer',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    transition: 'transform 0.2s ease-in-out'
  }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
    <div className="card-body p-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h6 className="fw-bold mb-0" style={{ color: '#14b8a6' }}>{dispute.title}</h6>
        <div>
          <span className={`badge px-3 py-2 me-2 ${dispute.status === 'pending' ? 'bg-warning text-dark' : dispute.status === 'under_review' ? 'bg-info' : dispute.status === 'resolved' ? 'bg-success' : 'bg-secondary'}`}>
            {dispute.status.replace('_', ' ')}
          </span>
          <span className="badge px-3 py-2 me-2" style={{ backgroundColor: '#14b8a6' }}>{dispute.disputeType}</span>
          <span className="badge px-3 py-2" style={{ backgroundColor: '#6c757d' }}>{dispute.priority}</span>
        </div>
      </div>
      <div className="text-secondary small mb-3">
        <i className="bi bi-book me-1"></i>
        {dispute.subjectId?.name} | 
        <i className="bi bi-calendar me-1 ms-2"></i>
        Booking #{dispute.bookingId?._id?.slice(-6)}
      </div>
      
      {/* Resolution Summary */}
      {dispute.status === 'resolved' && (
        <div className="mb-3 p-3 rounded-4" style={{ backgroundColor: 'rgba(25, 135, 84, 0.1)', border: '1px solid rgba(25, 135, 84, 0.2)' }}>
          <small className="text-success fw-bold">
            <i className="bi bi-check-circle me-2"></i>
            Resolved: {dispute.resolutionType?.replace('_', ' ')} - {dispute.resolution?.substring(0, 50)}{dispute.resolution?.length > 50 ? '...' : ''}
          </small>
        </div>
      )}
      
      {/* Dismissal Summary */}
      {dispute.status === 'dismissed' && (
        <div className="mb-3 p-3 rounded-4" style={{ backgroundColor: 'rgba(108, 117, 125, 0.1)', border: '1px solid rgba(108, 117, 125, 0.2)' }}>
          <small className="text-secondary fw-bold">
            <i className="bi bi-x-circle me-2"></i>
            Dismissed: {dispute.adminNotes?.substring(0, 50)}{dispute.adminNotes?.length > 50 ? '...' : ''}
          </small>
        </div>
      )}
      
      <div className="text-secondary small">
        <i className="bi bi-clock me-1"></i>
        Created: {new Date(dispute.createdAt).toLocaleDateString()}
        {dispute.resolvedAt && (
          <span className="ms-3">
            <i className="bi bi-check2-circle me-1"></i>
            {dispute.status === 'resolved' ? 'Resolved' : 'Dismissed'}: {new Date(dispute.resolvedAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  </div>
);

const DisputeDetailModal = ({ dispute, onClose }) => {
  if (!dispute) return null;
  return (
    <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050, paddingTop: '80px' }}>
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content rounded-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)', backdropFilter: 'blur(10px)' }}>
          <div className="modal-header border-0">
            <h5 className="modal-title fw-bold" style={{ color: '#14b8a6' }}>
              <i className="bi bi-exclamation-triangle me-2"></i>
              Dispute Details
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <h6 className="fw-bold mb-2" style={{ color: '#14b8a6' }}>{dispute.title}</h6>
            <div className="mb-3 text-secondary">
              <i className="bi bi-book me-1"></i>
              {dispute.subjectId?.name} | 
              <i className="bi bi-calendar me-1 ms-2"></i>
              Booking #{dispute.bookingId?._id?.slice(-6)}
            </div>
            <div className="mb-3">
              <span className="badge px-3 py-2 me-2" style={{ backgroundColor: '#14b8a6' }}>{dispute.disputeType}</span>
              <span className="badge px-3 py-2" style={{ backgroundColor: '#6c757d' }}>{dispute.priority}</span>
            </div>
            <p className="mb-3">{dispute.description}</p>
            <div className="mb-3">
              <strong style={{ color: '#14b8a6' }}>Status:</strong> 
              <span className={`badge px-3 py-2 ms-2 ${dispute.status === 'pending' ? 'bg-warning text-dark' : dispute.status === 'under_review' ? 'bg-info' : dispute.status === 'resolved' ? 'bg-success' : 'bg-secondary'}`}>
                {dispute.status.replace('_', ' ')}
              </span>
            </div>
            
            {/* Resolution Information */}
            {dispute.status === 'resolved' && (
              <div className="mb-4 p-4 rounded-4" style={{ backgroundColor: 'rgba(25, 135, 84, 0.1)', border: '1px solid rgba(25, 135, 84, 0.2)' }}>
                <h6 className="fw-bold text-success mb-3">
                  <i className="bi bi-check-circle me-2"></i>
                  Resolution
                </h6>
                {dispute.resolutionType && (
                  <div className="mb-2">
                    <strong style={{ color: '#14b8a6' }}>Resolution Type:</strong> 
                    <span className="badge bg-success ms-2 px-3 py-2">{dispute.resolutionType.replace('_', ' ')}</span>
                  </div>
                )}
                {dispute.resolution && (
                  <div className="mb-2">
                    <strong style={{ color: '#14b8a6' }}>Resolution Details:</strong>
                    <p className="mb-0 mt-1">{dispute.resolution}</p>
                  </div>
                )}
                {dispute.resolvedBy && (
                  <div className="mb-2">
                    <strong style={{ color: '#14b8a6' }}>Resolved by:</strong> {dispute.resolvedBy?.name || 'Admin'}
                  </div>
                )}
                {dispute.resolvedAt && (
                  <div className="mb-0">
                    <strong style={{ color: '#14b8a6' }}>Resolved on:</strong> {new Date(dispute.resolvedAt).toLocaleString()}
                  </div>
                )}
              </div>
            )}

            {/* Dismissal Information */}
            {dispute.status === 'dismissed' && (
              <div className="mb-4 p-4 rounded-4" style={{ backgroundColor: 'rgba(108, 117, 125, 0.1)', border: '1px solid rgba(108, 117, 125, 0.2)' }}>
                <h6 className="fw-bold text-secondary mb-3">
                  <i className="bi bi-x-circle me-2"></i>
                  Dismissal
                </h6>
                {dispute.adminNotes && (
                  <div className="mb-2">
                    <strong style={{ color: '#14b8a6' }}>Dismissal Reason:</strong>
                    <p className="mb-0 mt-1">{dispute.adminNotes}</p>
                  </div>
                )}
                {dispute.resolvedBy && (
                  <div className="mb-2">
                    <strong style={{ color: '#14b8a6' }}>Dismissed by:</strong> {dispute.resolvedBy?.name || 'Admin'}
                  </div>
                )}
                {dispute.resolvedAt && (
                  <div className="mb-0">
                    <strong style={{ color: '#14b8a6' }}>Dismissed on:</strong> {new Date(dispute.resolvedAt).toLocaleString()}
                  </div>
                )}
              </div>
            )}

            <div>
              <h6 className="fw-bold mb-3" style={{ color: '#14b8a6' }}>
                <i className="bi bi-chat-dots me-2"></i>
                Messages
              </h6>
              <div className="border rounded-4 p-3 mb-3" style={{ maxHeight: 200, overflowY: 'auto', backgroundColor: 'rgba(248, 249, 250, 0.8)' }}>
                {dispute.messages && dispute.messages.length > 0 ? dispute.messages.map((msg, idx) => (
                  <div key={idx} className="mb-2 p-2 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
                    <span className="fw-bold" style={{ color: '#14b8a6' }}>{msg.senderRole}:</span> {msg.message}
                    <span className="text-secondary small ms-2">{new Date(msg.createdAt).toLocaleString()}</span>
                  </div>
                )) : <div className="text-secondary">No messages yet.</div>}
              </div>
            </div>
            {dispute.status !== 'resolved' && dispute.status !== 'dismissed' && (
              <DisputeMessageForm disputeId={dispute._id} onMessageSent={onClose} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DisputeMessageForm = ({ disputeId, onMessageSent }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSend = async () => {
    if (!message) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/parent/disputes/${disputeId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message })
      });
      const data = await res.json();
      if (data.success) {
        setMessage('');
        onMessageSent();
        Swal.fire({
          icon: 'success',
          title: 'Message Sent!',
          text: 'Your message has been sent successfully.',
          confirmButtonColor: '#14b8a6',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Send Failed',
          text: data.message || 'Failed to send message',
          confirmButtonColor: '#14b8a6'
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to send message',
        confirmButtonColor: '#14b8a6'
      });
    }
    setLoading(false);
  };
  return (
    <div className="mt-3">
      <textarea className="form-control mb-3" rows={3} value={message} onChange={e => setMessage(e.target.value)} placeholder="Type your message..." style={{ borderColor: '#e2e8f0', borderRadius: '0.5rem' }} />
      <button className="btn btn-lg fw-bold rounded-pill" style={{ backgroundColor: '#14b8a6', borderColor: '#14b8a6', color: 'white' }} onClick={handleSend} disabled={loading || !message}>
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Sending...
          </>
        ) : (
          <>
            <i className="bi bi-send me-2"></i>
            Send Message
          </>
        )}
      </button>
    </div>
  );
};

const ParentDispute = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({ bookingId: '', disputeType: '', title: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState(null);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_URL, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setDisputes(data.data.disputes);
    } catch {
      //
    }
    setLoading(false);
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(BOOKINGS_URL, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setBookings(data.data);
    } catch {}
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(CREATE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setShowCreate(false);
        setForm({ bookingId: '', disputeType: '', title: '', description: '' });
        fetchDisputes();
        Swal.fire({
          icon: 'success',
          title: 'Dispute Created!',
          text: 'Your dispute has been created successfully and is under review.',
          confirmButtonColor: '#14b8a6',
          timer: 3000,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Creation Failed',
          text: data.message || 'Failed to create dispute',
          confirmButtonColor: '#14b8a6'
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to create dispute',
        confirmButtonColor: '#14b8a6'
      });
    }
    setCreating(false);
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
              <div className="d-flex justify-content-between align-items-center">
                <h2 className="fw-bold mb-0" style={{ color: '#14b8a6' }}>
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  My Disputes
                </h2>
                <button className="btn btn-lg fw-bold rounded-pill" style={{ backgroundColor: '#14b8a6', borderColor: '#14b8a6', color: 'white' }} onClick={() => { setShowCreate(true); fetchBookings(); }}>
                  <i className="bi bi-plus-lg me-2"></i> New Dispute
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="card border-0 shadow-sm rounded-4" style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}>
              <div className="card-body p-5">
                <div className="text-center py-5">
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
          ) : disputes.length === 0 ? (
            <div className="card border-0 shadow-sm rounded-4" style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}>
              <div className="card-body p-4">
                <div className="alert alert-info text-center" style={{ backgroundColor: 'rgba(20, 184, 166, 0.1)', borderColor: '#14b8a6', color: '#14b8a6' }}>
                  <i className="bi bi-info-circle me-2"></i>
                  No disputes found.
                </div>
              </div>
            </div>
          ) : (
            disputes.map(d => <DisputeListItem key={d._id} dispute={d} onSelect={setSelectedDispute} />)
          )}

          {/* Create Dispute Modal */}
          {showCreate && (
            <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050, paddingTop: '80px' }}>
              <div className="modal-dialog" role="document">
                <div className="modal-content rounded-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)', backdropFilter: 'blur(10px)' }}>
                  <div className="modal-header border-0">
                    <h5 className="modal-title fw-bold" style={{ color: '#14b8a6' }}>
                      <i className="bi bi-plus-circle me-2"></i>
                      Create New Dispute
                    </h5>
                    <button type="button" className="btn-close" onClick={() => setShowCreate(false)}></button>
                  </div>
                  <form onSubmit={handleCreate}>
                    <div className="modal-body">
                      <div className="mb-3">
                        <label className="form-label fw-bold" style={{ color: '#14b8a6' }}>
                          <i className="bi bi-calendar me-2"></i>
                          Booking
                        </label>
                        <select className="form-select" required value={form.bookingId} onChange={e => setForm(f => ({ ...f, bookingId: e.target.value }))} style={{ borderColor: '#e2e8f0', borderRadius: '0.5rem' }}>
                          <option value="">Select booking...</option>
                          {bookings.map(b => (
                            <option key={b._id} value={b._id}>
                              {b.subject?.name} | {new Date(b.sessionTime).toLocaleString()} | Tutor: {b.tutorId?.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold" style={{ color: '#14b8a6' }}>
                          <i className="bi bi-tag me-2"></i>
                          Dispute Type
                        </label>
                        <select className="form-select" required value={form.disputeType} onChange={e => setForm(f => ({ ...f, disputeType: e.target.value }))} style={{ borderColor: '#e2e8f0', borderRadius: '0.5rem' }}>
                          <option value="">Select type...</option>
                          {DISPUTE_TYPES.map(dt => <option key={dt.value} value={dt.value}>{dt.label}</option>)}
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold" style={{ color: '#14b8a6' }}>
                          <i className="bi bi-type me-2"></i>
                          Title
                        </label>
                        <input className="form-control" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={{ borderColor: '#e2e8f0', borderRadius: '0.5rem' }} />
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-bold" style={{ color: '#14b8a6' }}>
                          <i className="bi bi-text-paragraph me-2"></i>
                          Description
                        </label>
                        <textarea className="form-control" required rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ borderColor: '#e2e8f0', borderRadius: '0.5rem' }} />
                      </div>
                    </div>
                    <div className="modal-footer border-0">
                      <button type="button" className="btn rounded-pill" onClick={() => setShowCreate(false)} style={{ borderColor: '#6c757d', color: '#6c757d', backgroundColor: 'transparent' }}>
                        <i className="bi bi-x-circle me-2"></i>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-lg fw-bold rounded-pill" style={{ backgroundColor: '#14b8a6', borderColor: '#14b8a6', color: 'white' }} disabled={creating}>
                        {creating ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Creating...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-plus-circle me-2"></i>
                            Create Dispute
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Dispute Detail Modal */}
          {selectedDispute && (
            <DisputeDetailModal dispute={selectedDispute} onClose={() => { setSelectedDispute(null); fetchDisputes(); }} />
          )}
        </div>

        <div style={{ position: 'relative', zIndex: 2 }}>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default ParentDispute; 
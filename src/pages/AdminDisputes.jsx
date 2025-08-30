import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const API_URL = `${import.meta.env.VITE_API_URL}/api/admin/disputes`;
const DISPUTE_DETAILS_URL = `${import.meta.env.VITE_API_URL}/api/admin/disputes`;
const RESOLVE_URL = `${import.meta.env.VITE_API_URL}/api/admin/disputes`;
const AVATAR_PLACEHOLDER = 'https://ui-avatars.com/api/?background=2DB8A1&color=fff&size=128&name=';

const DisputeCard = ({ dispute, onResolve, onPriorityChange, onDismiss, resolvingId, setResolvingId, resolution, adminNotes, setResolution, setAdminNotes }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-danger';
      case 'high': return 'bg-warning text-dark';
      case 'medium': return 'bg-info';
      case 'low': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-warning text-dark';
      case 'under_review': return 'bg-info';
      case 'resolved': return 'bg-success';
      case 'dismissed': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  };

  const getDisputeTypeColor = (type) => {
    switch (type) {
      case 'payment': return 'bg-danger';
      case 'quality': return 'bg-warning text-dark';
      case 'scheduling': return 'bg-info';
      case 'behavior': return 'bg-purple';
      case 'technical': return 'bg-primary';
      default: return 'bg-secondary';
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 mb-3">
      <div className="card-body p-4">
        <div className="row">
          <div className="col-md-8">
            <div className="d-flex align-items-start mb-3">
              <div className="me-3">
                <div className="d-flex align-items-center mb-2">
                  <div className="d-flex align-items-center">
                    <img 
                      src={`${AVATAR_PLACEHOLDER}${dispute.parentId?.name?.split(' ').join('+')}`} 
                      alt={dispute.parentId?.name} 
                      className="rounded-circle me-2" 
                      style={{width: '40px', height: '40px'}}
                    />
                    <div className="me-3">
                      <h6 className="fw-bold mb-0">{dispute.parentId?.name || 'Unknown Parent'}</h6>
                      <small className="text-secondary">vs</small>
                    </div>
                    <img 
                      src={`${AVATAR_PLACEHOLDER}${dispute.tutorId?.name?.split(' ').join('+')}`} 
                      alt={dispute.tutorId?.name} 
                      className="rounded-circle me-2" 
                      style={{width: '40px', height: '40px'}}
                    />
                    <div>
                      <h6 className="fw-bold mb-0">{dispute.tutorId?.name || 'Unknown Tutor'}</h6>
                    </div>
                  </div>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <span className={`badge ${getDisputeTypeColor(dispute.disputeType)} me-2`}>
                    {dispute.disputeType}
                  </span>
                  <span className={`badge ${getStatusColor(dispute.status)} me-2`}>
                    {dispute.status.replace('_', ' ')}
                  </span>
                  <span className={`badge ${getPriorityColor(dispute.priority)}`}>
                    {dispute.priority}
                  </span>
                </div>
              </div>
            </div>
            <div className="mb-3">
              <h6 className="fw-bold mb-2">{dispute.title}</h6>
              <p className="text-secondary mb-0">{dispute.description}</p>
            </div>
            <div className="d-flex align-items-center">
              <small className="text-secondary me-3">
                <i className="bi bi-calendar me-1"></i>
                {dispute.createdAt ? new Date(dispute.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric'
                }) : 'No date'}
              </small>
              <small className="text-secondary me-3">
                <i className="bi bi-calendar-check me-1"></i>
                Booking: {dispute.bookingId?._id ? dispute.bookingId._id.slice(-6) : 'Unknown'}
              </small>
              <small className="text-secondary">
                <i className="bi bi-book me-1"></i>
                {dispute.subjectId?.name || 'Unknown Subject'}
              </small>
            </div>
          </div>
          <div className="col-md-4">
            <div className="d-flex flex-column align-items-end">
              {dispute.status === 'pending' || dispute.status === 'under_review' ? (
                resolvingId === dispute._id ? (
                  <div className="w-100">
                    <div className="mb-3">
                      <label className="form-label fw-bold">Resolution Type</label>
                      <select 
                        className="form-select" 
                        value={resolution} 
                        onChange={e => setResolution(e.target.value)}
                      >
                        <option value="">Select resolution...</option>
                        <option value="refund">Refund to Parent</option>
                        <option value="partial_refund">Partial Refund</option>
                        <option value="reschedule">Reschedule Session</option>
                        <option value="credit">Credit to Account</option>
                        <option value="warning">Warning to Party</option>
                        <option value="dismiss">Dismiss Dispute</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Resolution Details</label>
                      <textarea 
                        className="form-control" 
                        rows="3"
                        placeholder="Add resolution details..."
                        value={adminNotes} 
                        onChange={e => setAdminNotes(e.target.value)}
                      ></textarea>
                    </div>
                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-success btn-sm"
                        onClick={() => onResolve(dispute)}
                        disabled={!resolution}
                      >
                        <i className="bi bi-check-circle me-1"></i>Submit
                      </button>
                      <button 
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => setResolvingId(null)}
                      >
                        <i className="bi bi-x-circle me-1"></i>Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => setResolvingId(dispute._id)}
                    >
                      <i className="bi bi-gear me-1"></i>Resolve
                    </button>
                    <select 
                      className="form-select form-select-sm"
                      value={dispute.priority}
                      onChange={(e) => onPriorityChange(dispute._id, e.target.value)}
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                      <option value="urgent">Urgent</option>
                    </select>
                    <button 
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => onDismiss(dispute._id)}
                    >
                      <i className="bi bi-x-circle me-1"></i>Dismiss
                    </button>
                  </div>
                )
              ) : (
                <div className="text-end">
                  <span className={`badge ${getStatusColor(dispute.status)} mb-2`}>
                    <i className="bi bi-check-circle me-1"></i>{dispute.status.replace('_', ' ')}
                  </span>
                  {dispute.resolution && (
                    <div>
                      <small className="text-secondary d-block">
                        <strong>Resolution:</strong> {dispute.resolution}
                      </small>
                    </div>
                  )}
                  {dispute.resolvedBy && (
                    <small className="text-secondary d-block">
                      <strong>Resolved by:</strong> {dispute.resolvedBy?.name}
                    </small>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDisputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resolvingId, setResolvingId] = useState(null);
  const [resolution, setResolution] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    disputeType: ''
  });

  useEffect(() => {
    fetchDisputes();
  }, [filters]);

  // Fetch disputes from API
  const fetchDisputes = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams(filters);
      const res = await fetch(`${API_URL}?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDisputes(data.data.disputes || []);
      } else {
        setError(data.message || 'Failed to fetch disputes');
      }
    } catch (err) {
      setError('Failed to fetch disputes');
    }
    setLoading(false);
  };

  // Handle resolve action
  const handleResolve = async (dispute) => {
    if (!resolution) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${RESOLVE_URL}/${dispute._id}/resolve`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          resolution: adminNotes,
          resolutionType: resolution
        })
      });
      const data = await res.json();
      if (data.success) {
        setResolvingId(null);
        setResolution('');
        setAdminNotes('');
        fetchDisputes();
        Swal.fire({
          icon: 'success',
          title: 'Dispute Resolved!',
          text: 'The dispute has been successfully resolved.',
          confirmButtonColor: '#2DB8A1'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message || 'Failed to resolve dispute',
          confirmButtonColor: '#2DB8A1'
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to resolve dispute',
        confirmButtonColor: '#2DB8A1'
      });
    }
  };

  // Handle priority change
  const handlePriorityChange = async (disputeId, priority) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${RESOLVE_URL}/${disputeId}/priority`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ priority })
      });
      const data = await res.json();
      if (data.success) {
        fetchDisputes();
        Swal.fire({
          icon: 'success',
          title: 'Priority Updated!',
          text: 'Dispute priority has been updated successfully.',
          confirmButtonColor: '#2DB8A1',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: data.message || 'Failed to update priority',
          confirmButtonColor: '#2DB8A1'
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update priority',
        confirmButtonColor: '#2DB8A1'
      });
    }
  };

  // Handle dismiss action
  const handleDismiss = async (disputeId) => {
    const { value: notes } = await Swal.fire({
      title: 'Dismiss Dispute',
      text: 'Enter dismissal reason (optional):',
      input: 'text',
      inputPlaceholder: 'Enter reason...',
      showCancelButton: true,
      confirmButtonText: 'Dismiss',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      inputValidator: (value) => {
        // Optional field, so no validation needed
        return null;
      }
    });

    if (notes !== undefined) { // User clicked confirm
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${RESOLVE_URL}/${disputeId}/dismiss`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ adminNotes: notes })
        });
        const data = await res.json();
        if (data.success) {
          fetchDisputes();
          Swal.fire({
            icon: 'success',
            title: 'Dispute Dismissed!',
            text: 'The dispute has been dismissed successfully.',
            confirmButtonColor: '#2DB8A1'
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: data.message || 'Failed to dismiss dispute',
            confirmButtonColor: '#2DB8A1'
          });
        }
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to dismiss dispute',
          confirmButtonColor: '#2DB8A1'
        });
      }
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
        <div className="d-flex justify-content-center align-items-center vh-100" style={{backgroundColor: '#f8f9fa'}}>
            <div className="spinner-border" style={{'--bs-spinner-color': '#2DB8A1', width: '3rem', height: '3rem'}} role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8f9fa' }}>
        {/* Hero Section */}
        <section className="py-5" style={{ background: 'linear-gradient(120deg, #E9F8F5 0%, #f8f9fa 100%)' }}>
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-md-8">
                        <h1 className="fw-bolder display-5">Dispute Management</h1>
                        <p className="text-secondary lead">Resolve conflicts between parents and tutors to maintain platform harmony.</p>
                    </div>
                    <div className="col-md-4 text-md-end">
                        <Link to="/admin/dashboard" className="btn btn-lg btn-outline-primary rounded-pill shadow-sm">
                           <i className="bi bi-arrow-left me-2"></i> Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </section>

        <main className="container py-5">
            {error ? (
                <div className="alert alert-danger text-center">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                </div>
            ) : (
                <>
                    {/* Filters */}
                    <div className="card border-0 shadow-sm rounded-4 mb-4">
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-3">
                                <i className="bi bi-funnel me-2 text-primary"></i>
                                Filters
                            </h5>
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label className="form-label fw-bold">Status</label>
                                    <select 
                                        className="form-select" 
                                        value={filters.status} 
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                    >
                                        <option value="">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="under_review">Under Review</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="dismissed">Dismissed</option>
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fw-bold">Priority</label>
                                    <select 
                                        className="form-select" 
                                        value={filters.priority} 
                                        onChange={(e) => handleFilterChange('priority', e.target.value)}
                                    >
                                        <option value="">All Priorities</option>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fw-bold">Dispute Type</label>
                                    <select 
                                        className="form-select" 
                                        value={filters.disputeType} 
                                        onChange={(e) => handleFilterChange('disputeType', e.target.value)}
                                    >
                                        <option value="">All Types</option>
                                        <option value="payment">Payment Issues</option>
                                        <option value="quality">Quality Concerns</option>
                                        <option value="scheduling">Scheduling Problems</option>
                                        <option value="behavior">Behavior Issues</option>
                                        <option value="technical">Technical Problems</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Disputes List */}
                    {disputes.length === 0 ? (
                        <div className="card border-0 shadow-sm rounded-4">
                            <div className="card-body p-5 text-center">
                                <i className="bi bi-check-circle display-1 text-success mb-3"></i>
                                <h4 className="fw-bold mb-2">No Disputes Found</h4>
                                <p className="text-secondary">Great! All disputes have been resolved or no disputes exist for the selected filters.</p>
                            </div>
                      </div>
                    ) : (
                        <div>
                            {disputes.map((dispute) => (
                                <DisputeCard
                                    key={dispute._id}
                                    dispute={dispute}
                                    onResolve={handleResolve}
                                    onPriorityChange={handlePriorityChange}
                                    onDismiss={handleDismiss}
                                    resolvingId={resolvingId}
                                    setResolvingId={setResolvingId}
                                    resolution={resolution}
                                    adminNotes={adminNotes}
                                    setResolution={setResolution}
                                    setAdminNotes={setAdminNotes}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </main>
        
        {/* Custom Styles */}
        <style>{`
            .btn-primary-custom {
                background-color: #2DB8A1 !important;
                border-color: #2DB8A1 !important;
                color: white;
            }
            .btn-primary-custom:hover {
                background-color: #249a85 !important;
                border-color: #249a85 !important;
            }
            .bg-purple {
                background-color: #6f42c1 !important;
            }
        `}</style>
    </div>
  );
};

export default AdminDisputes; 
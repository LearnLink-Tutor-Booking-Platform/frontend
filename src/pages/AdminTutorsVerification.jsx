import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const API_URL = `${import.meta.env.VITE_API_URL}/api/admin/users?role=tutor&status=unverified`;
const VERIFY_URL = `${import.meta.env.VITE_API_URL}/api/admin/verify-tutor`;
const BULK_VERIFY_URL = `${import.meta.env.VITE_API_URL}/api/admin/verify-tutors`;
const AVATAR_PLACEHOLDER = 'https://ui-avatars.com/api/?background=2DB8A1&color=fff&size=128&name=';

// --- Reusable Components ---


const TutorCard = ({ tutor, isSelected, onSelect, onAction, actionLoading }) => {
    // Handle profile image URL - if it's a local upload, prepend server URL
    let profileImage = `${AVATAR_PLACEHOLDER}${tutor.name?.split(' ').join('+')}`; // default fallback
    if (tutor.profileImage) {
        if (tutor.profileImage.startsWith('/uploads/')) {
            profileImage = `${import.meta.env.VITE_API_URL}${tutor.profileImage}`;
        } else {
            profileImage = tutor.profileImage;
        }
    }
    
    return (
        <div className="card border-0 shadow-sm rounded-4 mb-3">
            <div className="card-body p-4">
                <div className="row align-items-center">
                    <div className="col-auto">
                        <div className="form-check">
                            <input 
                                className="form-check-input" 
                                type="checkbox" 
                                checked={isSelected}
                                onChange={() => onSelect(tutor._id)}
                                style={{ transform: 'scale(1.2)' }}
                            />
                        </div>
                    </div>
                    <div className="col">
                        <div className="d-flex align-items-center mb-2">
                            <img 
                                src={profileImage} 
                                alt={tutor.name} 
                                className="rounded-circle me-3" 
                                style={{width: '50px', height: '50px'}}
                            />
                            <div>
                                <h5 className="fw-bold mb-0">{tutor.name}</h5>
                                <p className="text-secondary mb-0">{tutor.email}</p>
                            </div>
                            <div className="ms-auto d-flex flex-column align-items-end">
                                <span className="badge bg-warning text-dark mb-1">Pending Verification</span>
                                {tutor.status && (
                                    <span className={`badge ${tutor.status === 'rejected' ? 'bg-danger' : tutor.status === 'deactivated' ? 'bg-secondary' : 'bg-success'}`}>
                                        {tutor.status.charAt(0).toUpperCase() + tutor.status.slice(1)}
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        <div className="row g-3">
                            <div className="col-md-6">
                                <div className="d-flex align-items-center mb-2">
                                    <i className="bi bi-geo-alt text-primary me-2"></i>
                                    <span className="text-secondary">{tutor.location || 'No location specified'}</span>
                                </div>
                                <div className="d-flex align-items-center mb-2">
                                    <i className="bi bi-calendar text-info me-2"></i>
                                    <span className="text-secondary">
                                        Joined: {tutor.date ? new Date(tutor.date).toLocaleDateString('en-US', { 
                                            year: 'numeric', 
                                            month: 'short', 
                                            day: 'numeric'
                                        }) : 'No date'}
                                    </span>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="d-flex align-items-start">
                                    <i className="bi bi-book text-success me-2 mt-1"></i>
                                    <div>
                                        <small className="text-secondary fw-bold">Subjects:</small>
                                        <p className="text-secondary small mb-0">
                                            {tutor.subjects && Array.isArray(tutor.subjects) && tutor.subjects.length > 0 
                                                ? tutor.subjects.map(subjectObj => {
                                                    // Handle populated subject objects from backend
                                                    if (subjectObj && typeof subjectObj === 'object') {
                                                        // If subject is populated (has subject field with name)
                                                        if (subjectObj.subject && typeof subjectObj.subject === 'object' && subjectObj.subject.name) {
                                                            return subjectObj.subject.name;
                                                        }
                                                        // If subject is a direct object with name
                                                        if (subjectObj.name) {
                                                            return subjectObj.name;
                                                        }
                                                        // If subject is a string
                                                        if (typeof subjectObj === 'string') {
                                                            return subjectObj;
                                                        }
                                                    }
                                                    return 'Unknown Subject';
                                                }).join(', ')
                                                : 'No subjects specified'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-auto">
                        <div className="d-flex gap-2">
                            <button 
                                className="btn btn-success btn-sm"
                                disabled={actionLoading === tutor._id + 'approve'} 
                                onClick={() => onAction(tutor._id, 'approve')}
                            >
                                {actionLoading === tutor._id + 'approve' ? (
                                    <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                ) : (
                                    <i className="bi bi-check-circle me-1"></i>
                                )}
                                Approve
                            </button>
                            <button 
                                className="btn btn-danger btn-sm"
                                disabled={actionLoading === tutor._id + 'reject'} 
                                onClick={() => onAction(tutor._id, 'reject')}
                            >
                                {actionLoading === tutor._id + 'reject' ? (
                                    <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                ) : (
                                    <i className="bi bi-x-circle me-1"></i>
                                )}
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminTutorsVerification = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user from localStorage
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      setUser(userData);
    } catch (e) {
      console.error('Error parsing user data:', e);
    }

    fetchTutors();
  }, []);

  // Fetch pending tutors from API
  const fetchTutors = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setTutors(data.data.users || []);
      } else {
        setError(data.message || 'Failed to fetch tutors');
      }
    } catch (err) {
      setError('Failed to fetch tutors');
    }
    setLoading(false);
  };

  // Handle single approve/reject
  const handleAction = async (tutorId, action) => {
    setActionLoading(tutorId + action);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${VERIFY_URL}/${tutorId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (data.success) {
        fetchTutors();
        setSelected(selected.filter(id => id !== tutorId));
        
        // Show success message based on action
        const actionText = action === 'approve' ? 'approved' : 'rejected';
        Swal.fire({
          icon: 'success',
          title: 'Action Successful!',
          text: `Tutor has been ${actionText} successfully.`,
          confirmButtonColor: '#2DB8A1',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Action Failed',
          text: data.message || 'Failed to perform action',
          confirmButtonColor: '#2DB8A1'
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to perform action',
        confirmButtonColor: '#2DB8A1'
      });
    }
    setActionLoading(null);
  };

  // Handle bulk approve/reject
  const handleBulkAction = async (action) => {
    if (selected.length === 0) return;
    
    // Show confirmation dialog for bulk actions
    const actionText = action === 'approve' ? 'approve' : 'reject';
    const result = await Swal.fire({
      title: `Bulk ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`,
      text: `Are you sure you want to ${actionText} ${selected.length} selected tutor(s)?`,
      icon: action === 'approve' ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: action === 'approve' ? '#28a745' : '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: `Yes, ${actionText} them!`,
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      setActionLoading('bulk' + action);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(BULK_VERIFY_URL, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ tutorIds: selected, action })
        });
        const data = await res.json();
        if (data.success) {
          fetchTutors();
          setSelected([]);
          
          // Show success message
          const actionText = action === 'approve' ? 'approved' : 'rejected';
          Swal.fire({
            icon: 'success',
            title: 'Bulk Action Successful!',
            text: `${selected.length} tutor(s) have been ${actionText} successfully.`,
            confirmButtonColor: '#2DB8A1',
            timer: 3000,
            showConfirmButton: false
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Bulk Action Failed',
            text: data.message || 'Failed to perform bulk action',
            confirmButtonColor: '#2DB8A1'
          });
        }
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to perform bulk action',
          confirmButtonColor: '#2DB8A1'
        });
      }
      setActionLoading(null);
    }
  };

  // Handle select/deselect
  const handleSelect = (tutorId) => {
    setSelected((prev) =>
      prev.includes(tutorId) ? prev.filter(id => id !== tutorId) : [...prev, tutorId]
    );
  };
  
  const handleSelectAll = () => {
    if (selected.length === tutors.length) {
      setSelected([]);
    } else {
      setSelected(tutors.map(t => t._id));
    }
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
                        <h1 className="fw-bolder display-5">Tutor Verification</h1>
                        <p className="text-secondary lead">Review and approve pending tutor applications to maintain platform quality.</p>
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
                    {/* Statistics and Actions */}
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <div className="card border-0 shadow-sm rounded-4">
                                <div className="card-body p-4">
                                    <h5 className="fw-bold mb-3">
                                        <i className="bi bi-people me-2 text-primary"></i>
                                        Pending Verifications
                                    </h5>
                                    <div className="d-flex align-items-center">
                                        <h2 className="fw-bold text-primary mb-0">{tutors.length}</h2>
                                        <span className="text-secondary ms-2">tutors awaiting review</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="card border-0 shadow-sm rounded-4">
                                <div className="card-body p-4">
                                    <h5 className="fw-bold mb-3">
                                        <i className="bi bi-check-circle me-2 text-success"></i>
                                        Bulk Actions
                                    </h5>
                                    <div className="d-flex gap-2">
                                        <button 
                                            className="btn btn-success"
                                            disabled={selected.length === 0 || actionLoading === 'bulkapprove'}
                                            onClick={() => handleBulkAction('approve')}
                                        >
                                            {actionLoading === 'bulkapprove' ? (
                                                <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                            ) : (
                                                <i className="bi bi-check-circle me-1"></i>
                                            )}
                                            Approve Selected ({selected.length})
                                        </button>
                                        <button 
                                            className="btn btn-danger"
                                            disabled={selected.length === 0 || actionLoading === 'bulkreject'}
                                            onClick={() => handleBulkAction('reject')}
                                        >
                                            {actionLoading === 'bulkreject' ? (
                                                <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                            ) : (
                                                <i className="bi bi-x-circle me-1"></i>
                                            )}
                                            Reject Selected ({selected.length})
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Selection Controls */}
                    {tutors.length > 0 && (
                        <div className="card border-0 shadow-sm rounded-4 mb-4">
                            <div className="card-body p-4">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div className="form-check">
                                        <input 
                                            className="form-check-input" 
                                            type="checkbox" 
                                            checked={selected.length === tutors.length && tutors.length > 0} 
                                            onChange={handleSelectAll}
                                            style={{ transform: 'scale(1.2)' }}
                                        />
                                        <label className="form-check-label fw-bold">
                                            Select All ({selected.length}/{tutors.length})
                                        </label>
                                    </div>
                                    <button 
                                        className="btn btn-outline-secondary btn-sm"
                                        onClick={() => setSelected([])}
                                        disabled={selected.length === 0}
                                    >
                                        Clear Selection
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tutors List */}
                    {tutors.length === 0 ? (
                        <div className="card border-0 shadow-sm rounded-4">
                            <div className="card-body p-5 text-center">
                                <i className="bi bi-check-circle display-1 text-success mb-3"></i>
                                <h4 className="fw-bold mb-2">No Pending Verifications</h4>
                                <p className="text-secondary">All tutor applications have been reviewed. Great job!</p>
                                <Link to="/admin/dashboard" className="btn btn-primary rounded-pill">
                                    <i className="bi bi-arrow-left me-2"></i>Back to Dashboard
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div>
              {tutors.map((tutor) => (
                                <TutorCard
                                    key={tutor._id}
                                    tutor={tutor}
                                    isSelected={selected.includes(tutor._id)}
                                    onSelect={handleSelect}
                                    onAction={handleAction}
                                    actionLoading={actionLoading}
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
        `}</style>
    </div>
  );
};

export default AdminTutorsVerification; 
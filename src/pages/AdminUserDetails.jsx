import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const API_URL = `${import.meta.env.VITE_API_URL}/api/admin/users`;
const AVATAR_PLACEHOLDER = 'https://ui-avatars.com/api/?background=2DB8A1&color=fff&size=128&name=';

const StatCard = ({ icon, value, label, color }) => (
    <div className="col-md-3 col-sm-6 mb-3">
        <div className="card border-0 shadow-sm rounded-4 text-center h-100">
            <div className="card-body p-3">
                <i className={`bi ${icon} display-6 mb-2`} style={{color}}></i>
                <h4 className="fw-bold mb-0">{value}</h4>
                <p className="text-secondary small mb-0">{label}</p>
            </div>
        </div>
    </div>
);

const AdminUserDetails = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.data.user);
          setStats(data.data.additionalData);
        } else {
          setError(data.message || 'Failed to fetch user details');
        }
      } catch (err) {
        setError('Failed to fetch user details');
      }
      setLoading(false);
    };
    fetchUser();
  }, [userId]);

  const handleStatusUpdate = async (action) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/${userId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (data.success) {
        // Show success message before reloading
        const actionText = action === 'activate' ? 'activated' : 'deactivated';
        Swal.fire({
          icon: 'success',
          title: 'Account Updated!',
          text: `User account has been ${actionText} successfully.`,
          confirmButtonColor: '#2DB8A1',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          // Refresh user data
          window.location.reload();
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Action Failed',
          text: data.message || 'Failed to update account status',
          confirmButtonColor: '#2DB8A1'
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update account status',
        confirmButtonColor: '#2DB8A1'
      });
    }
    setActionLoading(false);
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
                        <h1 className="fw-bolder display-5">User Details</h1>
                        <p className="text-secondary lead">View and manage user profile information and account status.</p>
                    </div>
                    <div className="col-md-4 text-md-end">
                        <Link to="/admin/users" className="btn btn-lg btn-outline-primary rounded-pill shadow-sm">
                           <i className="bi bi-arrow-left me-2"></i> Back to Users
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
            ) : user ? (
                <>
                    {/* User Profile Card */}
                    <div className="card border-0 shadow-sm rounded-4 mb-4">
                        <div className="card-body p-4">
                            <div className="row align-items-center">
                                <div className="col-auto">
                                    <img 
                                        src={user.profileImage ? (user.profileImage.startsWith('/uploads/') ? `${import.meta.env.VITE_API_URL}${user.profileImage}` : user.profileImage) : `${AVATAR_PLACEHOLDER}${user.name?.split(' ').join('+')}`} 
                                        alt={user.name} 
                                        className="rounded-circle" 
                                        style={{width: '100px', height: '100px'}}
                                    />
                                </div>
                                <div className="col">
                                    <div className="d-flex align-items-center mb-2">
                                        <h2 className="fw-bold mb-0 me-3">{user.name}</h2>
                                        <span className={`badge ${user.role === 'tutor' ? 'bg-primary' : user.role === 'parent' ? 'bg-success' : 'bg-danger'}`}>
                                            {user.role === 'tutor' ? 'Tutor' : user.role === 'parent' ? 'Student' : user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                                        </span>
                                        {user.status && (
                                            <span className={`badge ms-2 ${user.status === 'rejected' ? 'bg-danger' : user.status === 'deactivated' ? 'bg-secondary' : 'bg-success'}`}>
                                                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                            </span>
                                        )}
                                        {user.isVerified && user.role === 'tutor' && (
                                            <span className="badge bg-success ms-2">
                                                <i className="bi bi-check-circle me-1"></i>Verified
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-secondary mb-0">{user.email}</p>
                                </div>
                                <div className="col-auto">
                                    <div className="d-flex gap-2">
                                        {user.status === 'deactivated' ? (
                                            <button 
                                                className="btn btn-success"
                                                disabled={actionLoading}
                                                onClick={() => handleStatusUpdate('activate')}
                                            >
                                                {actionLoading ? (
                                                    <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                                ) : (
                                                    <i className="bi bi-check-circle me-1"></i>
                                                )}
                                                Activate Account
                                            </button>
                                        ) : (
                                            // Don't show deactivate button for admin users
                                            user.role !== 'admin' && (
                                                <button 
                                                    className="btn btn-danger"
                                                    disabled={actionLoading}
                                                    onClick={() => handleStatusUpdate('deactivate')}
                                                >
                                                    {actionLoading ? (
                                                        <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                                    ) : (
                                                        <i className="bi bi-x-circle me-1"></i>
                                                    )}
                                                    Deactivate Account
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Statistics */}
                    {stats && (
                        <div className="row mb-4">
                            <div className="col-12">
                                <h4 className="fw-bold mb-3">
                                    <i className="bi bi-graph-up me-2 text-primary"></i>
                                    User Statistics
                                </h4>
                            </div>
                            <StatCard 
                                icon="bi-calendar-check" 
                                value={stats.totalBookings || 0} 
                                label="Total Bookings" 
                                color="#0d6efd" 
                            />
                            <StatCard 
                                icon="bi-check-circle" 
                                value={stats.completedBookings || 0} 
                                label="Completed Sessions" 
                                color="#198754" 
                            />
                            <StatCard 
                                icon="bi-star" 
                                value={stats.totalReviews || 0} 
                                label="Total Reviews" 
                                color="#ffc107" 
                            />
                            {user.role === 'tutor' && (
                                <StatCard 
                                    icon="bi-star-fill" 
                                    value={stats.averageRating || 0} 
                                    label="Average Rating" 
                                    color="#fd7e14" 
                                />
                            )}
                        </div>
                    )}

                    {/* User Details */}
                    <div className="row">
                        <div className="col-lg-8">
                            <div className="card border-0 shadow-sm rounded-4 mb-4">
                                <div className="card-body p-4">
                                    <h4 className="fw-bold mb-3">
                                        <i className="bi bi-person-circle me-2 text-primary"></i>
                                        Profile Information
                                    </h4>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <div className="d-flex align-items-center mb-3">
                                                <i className="bi bi-envelope text-primary me-2"></i>
                                                <div>
                                                    <small className="text-secondary fw-bold">Email</small>
                                                    <p className="mb-0">{user.email}</p>
                                                </div>
                                            </div>
                                            {user.location && (
                                                <div className="d-flex align-items-center mb-3">
                                                    <i className="bi bi-geo-alt text-info me-2"></i>
                                                    <div>
                                                        <small className="text-secondary fw-bold">Location</small>
                                                        <p className="mb-0">{user.location}</p>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="d-flex align-items-center mb-3">
                                                <i className="bi bi-calendar text-warning me-2"></i>
                                                <div>
                                                    <small className="text-secondary fw-bold">Joined</small>
                                                    <p className="mb-0">
                                                        {user.date ? new Date(user.date).toLocaleDateString('en-US', { 
                                                            year: 'numeric', 
                                                            month: 'long', 
                                                            day: 'numeric'
                                                        }) : 'No date'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            {user.role === 'tutor' && (
                                                <>
                                                    {user.hourlyRate && (
                                                        <div className="d-flex align-items-center mb-3">
                                                            <i className="bi bi-cash-coin text-success me-2"></i>
                                                            <div>
                                                                <small className="text-secondary fw-bold">Hourly Rate</small>
                                                                <p className="mb-0">${user.hourlyRate}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {user.rating && (
                                                        <div className="d-flex align-items-center mb-3">
                                                            <i className="bi bi-star-fill text-warning me-2"></i>
                                                            <div>
                                                                <small className="text-secondary fw-bold">Rating</small>
                                                                <p className="mb-0">{user.rating}/5</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {user.isVerified !== undefined && (
                                                        <div className="d-flex align-items-center mb-3">
                                                            <i className="bi bi-shield-check text-success me-2"></i>
                                                            <div>
                                                                <small className="text-secondary fw-bold">Verification</small>
                                                                <p className="mb-0">{user.isVerified ? 'Verified' : 'Not Verified'}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-4">
                            {/* Subjects */}
                            {user.role === 'tutor' && user.subjects && user.subjects.length > 0 && (
                                <div className="card border-0 shadow-sm rounded-4 mb-4">
                                    <div className="card-body p-4">
                                        <h5 className="fw-bold mb-3">
                                            <i className="bi bi-book me-2 text-success"></i>
                                            Subjects
                                        </h5>
                                        <div className="d-flex flex-wrap gap-2">
                                            {user.subjects.map((subjectObj, index) => {
                                                let subjectName = 'Unknown Subject';
                                                if (subjectObj && typeof subjectObj === 'object') {
                                                    if (subjectObj.subject && typeof subjectObj.subject === 'object' && subjectObj.subject.name) {
                                                        subjectName = subjectObj.subject.name;
                                                    } else if (subjectObj.name) {
                                                        subjectName = subjectObj.name;
                                                    } else if (typeof subjectObj === 'string') {
                                                        subjectName = subjectObj;
                                                    }
                                                }
                                                return (
                                                    <span key={index} className="badge bg-light text-dark">
                                                        {subjectName}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Expertise */}
                            {user.expertise && user.expertise.length > 0 && (
                                <div className="card border-0 shadow-sm rounded-4 mb-4">
                                    <div className="card-body p-4">
                                        <h5 className="fw-bold mb-3">
                                            <i className="bi bi-award me-2 text-warning"></i>
                                            Expertise
                                        </h5>
                                        <div className="d-flex flex-wrap gap-2">
                                            {user.expertise.map((skill, index) => (
                                                <span key={index} className="badge bg-warning text-dark">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Bio */}
                            {user.bio && (
                                <div className="card border-0 shadow-sm rounded-4">
                                    <div className="card-body p-4">
                                        <h5 className="fw-bold mb-3">
                                            <i className="bi bi-chat-quote me-2 text-info"></i>
                                            Bio
                                        </h5>
                                        <p className="text-secondary mb-0">{user.bio}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            ) : null}
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

export default AdminUserDetails; 
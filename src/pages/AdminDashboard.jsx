import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
// TODO: Fetch all users, allow tutor verification, manage users

const API_URL = `${import.meta.env.VITE_API_URL}/api/admin/dashboard`;
const AVATAR_PLACEHOLDER = 'https://ui-avatars.com/api/?background=2DB8A1&color=fff&size=128&name=';

// --- Reusable Components ---

const StatCard = ({ icon, value, label, color, bgColor = '#f8f9fa' }) => (
    <div className="col">
        <div className="card text-center border-0 shadow-sm h-100 p-3 rounded-4" style={{ backgroundColor: bgColor }}>
            <i className={`bi ${icon} display-6 mb-2`} style={{color}}></i>
            <h4 className="fw-bold mb-0">{value}</h4>
            <p className="text-secondary small mb-0">{label}</p>
        </div>
    </div>
);

const ActivityCard = ({ title, items, emptyMessage, itemRenderer }) => (
    <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
            <h4 className="fw-bold mb-3">{title}</h4>
            {items.length === 0 ? (
                <p className="text-secondary">{emptyMessage}</p>
            ) : (
                <div className="list-group list-group-flush">
                    {items.map(itemRenderer)}
                </div>
            )}
        </div>
    </div>
);

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user from localStorage
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      setUser(userData);
    } catch (e) {
      console.error('Error parsing user data:', e);
    }

    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(API_URL, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setDashboard(data.data);
        } else {
          setError(data.message || 'Failed to fetch dashboard');
        }
      } catch (err) {
        setError('Failed to fetch dashboard');
      }
      setLoading(false);
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
        <div className="d-flex justify-content-center align-items-center vh-100" style={{backgroundColor: '#f8f9fa'}}>
            <div className="spinner-border" style={{'--bs-spinner-color': '#2DB8A1', width: '3rem', height: '3rem'}} role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
  }

  if (error) {
      return <div className="alert alert-danger text-center m-5">Error: {error}</div>;
  }

  return (
    <div style={{ backgroundColor: '#f8f9fa' }}>
  

        {/* Personalized Hero Section */}
        <section className="py-5" style={{ background: 'linear-gradient(120deg, #E9F8F5 0%, #f8f9fa 100%)' }}>
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-md-8">
                        <h1 className="fw-bolder display-5">Welcome back, {user?.name?.split(' ')[0] || 'Admin'}!</h1>
                        <p className="text-secondary lead">Here's your platform overview and recent activity. Keep the platform running smoothly!</p>
                    </div>
                    <div className="col-md-4 text-md-end">
                        <Link to="/admin/users" className="btn btn-lg btn-primary-custom rounded-pill shadow-sm">
                           <i className="bi bi-people-fill me-2"></i> Manage Users
                        </Link>
                    </div>
                </div>
            </div>
        </section>

        <main className="container py-5">
            <div className="row g-4">
                {/* Main Content Area */}
                <div className="col-lg-8">
                    {/* Statistics Grid */}
                    <h3 className="fw-bold mb-3">Platform Statistics</h3>
                    <div className="row row-cols-2 row-cols-md-4 g-4 mb-5">
                        <StatCard 
                            icon="bi-people-fill" 
                            value={dashboard?.overview?.totalUsers || 0} 
                            label="Total Users" 
                            color="#0d6efd" 
                        />
                        <StatCard 
                            icon="bi-person-workspace" 
                            value={dashboard?.overview?.totalTutors || 0} 
                            label="Total Tutors" 
                            color="#198754" 
                        />
                        <StatCard 
                            icon="bi-check-circle-fill" 
                            value={dashboard?.overview?.verifiedTutors || 0} 
                            label="Verified Tutors" 
                            color="#ffc107" 
                        />
                        <StatCard 
                            icon="bi-calendar-check" 
                            value={dashboard?.overview?.totalBookings || 0} 
                            label="Total Bookings" 
                            color="#dc3545" 
                        />
                    </div>

                    {/* Additional Stats Row */}
                    <div className="row row-cols-2 row-cols-md-4 g-4 mb-5">
                        <StatCard 
                            icon="bi-star-fill" 
                            value={dashboard?.overview?.totalReviews || 0} 
                            label="Total Reviews" 
                            color="#fd7e14" 
                        />
                        <StatCard 
                            icon="bi-exclamation-triangle-fill" 
                            value={dashboard?.overview?.flaggedReviews || 0} 
                            label="Flagged Reviews" 
                            color="#6f42c1" 
                        />
                        <StatCard 
                            icon="bi-percent" 
                            value={`${dashboard?.overview?.verificationRate || 0}%`} 
                            label="Verification Rate" 
                            color="#20c997" 
                        />
                        <StatCard 
                            icon="bi-activity" 
                            value={dashboard?.overview?.activeBookings || 0} 
                            label="Active Bookings" 
                            color="#e83e8c" 
                        />
                    </div>

                    {/* Recent Activity */}
                    <ActivityCard
                        title="Recent Activity"
                        items={dashboard?.recentActivity?.newUsers || []}
                        emptyMessage="No recent activity."
                        itemRenderer={(user) => (
                            <div key={user._id} className="list-group-item d-flex justify-content-between align-items-center px-0">
                                <div>
                                    <p className="fw-bold mb-0">{user.name || 'Unknown'} ({user.email || 'No email'})</p>
                                    <p className="text-secondary small mb-0">
                                        <i className="bi bi-person-badge me-2"></i>
                                        {user.role === 'tutor' ? 'Tutor' : user.role === 'parent' ? 'Student' : 'Unknown'} - {user.date ? new Date(user.date).toLocaleDateString('en-US', { 
                                            year: 'numeric', 
                                            month: 'short', 
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : 'No date'}
                                    </p>
                                </div>
                                <span className={`badge bg-${user.role === 'tutor' ? 'primary' : user.role === 'parent' ? 'success' : 'danger'}`}>
                                    {user.role === 'tutor' ? 'Tutor' : user.role === 'parent' ? 'Student' : 'Unknown'}
                                </span>
                            </div>
                        )}
                    />

                    {/* Recent Bookings */}
                    <ActivityCard
                        title="Recent Bookings"
                        items={dashboard?.recentActivity?.newBookings || []}
                        emptyMessage="No recent bookings."
                        itemRenderer={(booking) => (
                            <div key={booking._id} className="list-group-item d-flex justify-content-between align-items-center px-0">
      <div>
                                    <p className="fw-bold mb-0">Booking #{booking._id ? booking._id.slice(-6) : 'Unknown'}</p>
                                    <p className="text-secondary small mb-0">
                                        <i className="bi bi-people me-2"></i>
                                        Student: {booking.parentId?.name || 'Unknown'} | Tutor: {booking.tutorId?.name || 'Unknown'}
                                    </p>
                                    <p className="text-secondary small mb-0">
                                        <i className="bi bi-calendar-event me-2"></i>
                                        {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-US', { 
                                            year: 'numeric', 
                                            month: 'short', 
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : 'No date'}
                                    </p>
                                </div>
                                <span className={`badge bg-${booking.status === 'completed' ? 'success' : booking.status === 'confirmed' ? 'primary' : 'warning'}`}>
                                    {booking.status || 'Unknown'}
                                </span>
                            </div>
                        )}
                    />
                </div>

                {/* Side Content Area */}
                <div className="col-lg-4">
                    {/* Quick Actions */}
                    <div className="card border-0 shadow-sm rounded-4 mb-4">
                        <div className="card-body p-4">
                            <h4 className="fw-bold mb-3">Quick Actions</h4>
                            <div className="d-grid gap-2">
                                <Link to="/admin/users" className="btn btn-outline-dark">
                                    <i className="bi bi-people me-2"></i>User Management
                                </Link>
                                <Link to="/admin/tutors-verification" className="btn btn-outline-primary">
                                    <i className="bi bi-check-circle me-2"></i>Verify Tutors
                                </Link>
                                <Link to="/admin/reviews" className="btn btn-outline-warning">
                                    <i className="bi bi-star me-2"></i>Manage Reviews
                                </Link>
                                <Link to="/admin/activity" className="btn btn-outline-info">
                                    <i className="bi bi-graph-up me-2"></i>Platform Activity
                                </Link>
                                <Link to="/admin/disputes" className="btn btn-outline-danger">
                                    <i className="bi bi-exclamation-triangle me-2"></i>Handle Disputes
                                </Link>
                                <Link to="/admin/subjects" className="btn btn-outline-success">
                                    <i className="bi bi-book me-2"></i>Manage Subjects
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Pending Actions */}
                    <ActivityCard
                        title="Pending Verifications"
                        items={dashboard?.pendingActions?.verifications || []}
                        emptyMessage="No pending verifications."
                        itemRenderer={(tutor) => (
                            <div key={tutor._id} className="mb-3 p-3 border rounded">
                                <div className="d-flex align-items-center mb-2">
                                    <h6 className="fw-bold mb-0 me-2">{tutor.name || 'Unknown'}</h6>
                                    <span className="badge bg-warning text-dark me-1">Pending</span>
                                    {tutor.status && (
                                        <span className={`badge ${tutor.status === 'rejected' ? 'bg-danger' : tutor.status === 'deactivated' ? 'bg-secondary' : 'bg-success'}`}>
                                            {tutor.status.charAt(0).toUpperCase() + tutor.status.slice(1)}
                                        </span>
                                    )}
                                </div>
                                <p className="text-secondary small mb-1">{tutor.email || 'No email'}</p>
                                <p className="text-secondary small mb-1">
                                    <i className="bi bi-geo-alt me-1"></i>{tutor.location || 'No location'}
                                </p>
                                <p className="text-secondary small mb-0">
                                    <i className="bi bi-book me-1"></i>
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
                                        : 'No subjects'
                                    }
                                </p>
                                <p className="text-secondary small mb-0">
                                    <i className="bi bi-calendar me-1"></i>
                                    {tutor.date ? new Date(tutor.date).toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'short', 
                                        day: 'numeric'
                                    }) : 'No date'}
                                </p>
                            </div>
                        )}
                    />

                    {/* Pending Disputes */}
                    <ActivityCard
                        title="Pending Disputes"
                        items={dashboard?.pendingActions?.disputes || []}
                        emptyMessage="No pending disputes."
                        itemRenderer={(dispute) => (
                            <div key={dispute._id} className="mb-3 p-3 border rounded">
                                <div className="d-flex align-items-center mb-2">
                                    <h6 className="fw-bold mb-0 me-2">Booking #{dispute._id ? dispute._id.slice(-6) : 'Unknown'}</h6>
                                    <span className="badge bg-danger">Dispute</span>
                                </div>
                                <p className="text-secondary small mb-1">
                                    Student: {dispute.parentId?.name || 'Unknown'}
                                </p>
                                <p className="text-secondary small mb-1">
                                    Tutor: {dispute.tutorId?.name || 'Unknown'}
                                </p>
                                <p className="text-secondary small mb-0">
                                    <i className="bi bi-exclamation-circle me-1"></i>
                                    {dispute.dispute?.disputeType || 'Unknown type'}
                                </p>
                                <p className="text-secondary small mb-0">
                                    <i className="bi bi-calendar me-1"></i>
                                    {dispute.dispute?.createdAt ? new Date(dispute.dispute.createdAt).toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'short', 
                                        day: 'numeric'
                                    }) : 'No date'}
                                </p>
                            </div>
                        )}
                    />
                </div>
      </div>
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

export default AdminDashboard; 
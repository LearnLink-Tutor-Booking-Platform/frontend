import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const API_URL = `${import.meta.env.VITE_API_URL}/api/admin/activity`;
const AVATAR_PLACEHOLDER = 'https://ui-avatars.com/api/?background=2DB8A1&color=fff&size=128&name=';

const periods = [
  { label: 'Last 24h', value: '24h' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
];

const StatCard = ({ icon, value, label, color, bgColor = '#f8f9fa' }) => (
    <div className="col-md-3 col-sm-6 mb-3">
        <div className="card border-0 shadow-sm rounded-4 text-center h-100" style={{ backgroundColor: bgColor }}>
            <div className="card-body p-3">
                <i className={`bi ${icon} display-6 mb-2`} style={{color}}></i>
                <h4 className="fw-bold mb-0">{value}</h4>
                <p className="text-secondary small mb-0">{label}</p>
            </div>
        </div>
    </div>
);

const TrendCard = ({ title, data, color }) => (
    <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
            <h5 className="fw-bold mb-3">
                <i className="bi bi-graph-up me-2" style={{color}}></i>
                {title}
            </h5>
            {data.length === 0 ? (
                <p className="text-secondary text-center">No data available for this period.</p>
            ) : (
                <div className="row g-2">
                    {data.map((item, index) => (
                        <div key={index} className="col-md-3 col-sm-6">
                            <div className="p-3 border rounded text-center">
                                <div className="fw-bold text-primary">{item.count}</div>
                                <small className="text-secondary">{item._id}</small>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
);

const TutorCard = ({ tutor }) => {
    // Handle profile image URL - if it's a local upload, prepend server URL
    let profileImage = `${AVATAR_PLACEHOLDER}${tutor.name?.split(' ').join('+')}`; // default fallback
    if (tutor.profileImage) {
        if (tutor.profileImage.startsWith('/uploads/')) {
            profileImage = `${import.meta.env.VITE_API_URL}${tutor.profileImage}`;
        } else {
            profileImage = tutor.profileImage;
        }
    }
    
    let subjectNames = (tutor.subjects && Array.isArray(tutor.subjects)) ? tutor.subjects.map(subjectObj => {
        if (subjectObj && typeof subjectObj === 'object') {
            if (subjectObj.subject && typeof subjectObj.subject === 'object' && subjectObj.subject.name) {
                return subjectObj.subject.name;
            }
            if (subjectObj.subject && typeof subjectObj.subject === 'string') {
                return subjectObj.subject; // fallback if not populated (show ID or string)
            }
            if (subjectObj.name) {
                return subjectObj.name;
            }
            if (typeof subjectObj === 'string') {
                return subjectObj;
            }
        }
        return null;
    }).filter(Boolean) : [];
    subjectNames = subjectNames.length > 0 ? subjectNames.join(', ') : 'No subjects';
    
    return (
        <div className="card border-0 shadow-sm rounded-4 mb-3">
            <div className="card-body p-3">
                <div className="row align-items-center">
                    <div className="col-auto">
                        <img 
                            src={profileImage} 
                            alt={tutor.name} 
                            className="rounded-circle" 
                            style={{width: '50px', height: '50px'}}
                        />
                    </div>
                    <div className="col">
                        <h6 className="fw-bold mb-1">{tutor.name}</h6>
                        <p className="text-secondary small mb-1">{tutor.email}</p>
                        <div className="d-flex align-items-center">
                            <span className="badge bg-primary me-2">{tutor.completedBookings} sessions</span>
                            <span className="badge bg-warning text-dark">
                                {tutor.averageRating ? tutor.averageRating.toFixed(1) : 'N/A'} ★
                            </span>
                        </div>
                    </div>
                    <div className="col-auto">
                        <div className="text-end">
                            <small className="text-secondary d-block">{tutor.location || 'No location'}</small>
                            <small className="text-secondary">{subjectNames}</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminActivity = () => {
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('7d');

  const fetchActivity = async (selectedPeriod) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}?period=${selectedPeriod}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setActivity(data.data);
      } else {
        setError(data.message || 'Failed to fetch activity');
      }
    } catch (err) {
      setError('Failed to fetch activity');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchActivity(period);
  }, [period]);

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
                        <h1 className="fw-bolder display-5">Platform Activity</h1>
                        <p className="text-secondary lead">Monitor platform performance, user engagement, and key metrics over time.</p>
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
            ) : activity ? (
                <>
                    {/* Period Selector */}
                    <div className="card border-0 shadow-sm rounded-4 mb-4">
                        <div className="card-body p-4">
                            <div className="row align-items-center">
                                <div className="col-md-6">
                                    <h5 className="fw-bold mb-0">
                                        <i className="bi bi-calendar-range me-2 text-primary"></i>
                                        Activity Period
                                    </h5>
                                </div>
                                <div className="col-md-6">
                                    <select 
                                        className="form-select" 
                                        value={period} 
                                        onChange={e => setPeriod(e.target.value)}
                                    >
                                        {periods.map(p => (
                                            <option key={p.value} value={p.value}>{p.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Activity Statistics */}
                    <div className="row mb-4">
                        <div className="col-12">
                            <h4 className="fw-bold mb-3">
                                <i className="bi bi-graph-up me-2 text-primary"></i>
                                Activity Statistics
                            </h4>
                        </div>
                        <StatCard 
                            icon="bi-people" 
                            value={activity.activity.newUsers} 
                            label="New Users" 
                            color="#0d6efd" 
                        />
                        <StatCard 
                            icon="bi-calendar-check" 
                            value={activity.activity.newBookings} 
                            label="New Bookings" 
                            color="#198754" 
                        />
                        <StatCard 
                            icon="bi-check-circle" 
                            value={activity.activity.completedBookings} 
                            label="Completed Sessions" 
                            color="#ffc107" 
                        />
                        <StatCard 
                            icon="bi-star" 
                            value={activity.activity.newReviews} 
                            label="New Reviews" 
                            color="#fd7e14" 
                        />
                    </div>

                    {/* Additional Stats */}
                    <div className="row mb-4">
                        <StatCard 
                            icon="bi-chat-dots" 
                            value={activity.activity.newMessages} 
                            label="New Messages" 
                            color="#6f42c1" 
                        />
                        <StatCard 
                            icon="bi-people-fill" 
                            value={activity.platformHealth.totalUsers} 
                            label="Total Users" 
                            color="#20c997" 
                        />
                        <StatCard 
                            icon="bi-person-workspace" 
                            value={activity.platformHealth.totalTutors} 
                            label="Total Tutors" 
                            color="#e83e8c" 
                        />
                        <StatCard 
                            icon="bi-percent" 
                            value={`${activity.platformHealth.verificationRate}%`} 
                            label="Verification Rate" 
                            color="#dc3545" 
                        />
                    </div>

                    {/* Trends */}
                    <div className="row">
                        <div className="col-lg-6">
                            <TrendCard 
                                title="User Registration Trend" 
                                data={activity.trends.userRegistration} 
                                color="#0d6efd"
                            />
                        </div>
                        <div className="col-lg-6">
                            <TrendCard 
                                title="Booking Trend" 
                                data={activity.trends.bookings} 
                                color="#198754"
                            />
                        </div>
                    </div>

                    {/* Top Performing Tutors */}
                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-body p-4">
                            <h4 className="fw-bold mb-3">
                                <i className="bi bi-trophy me-2 text-warning"></i>
                                Top Performing Tutors
                            </h4>
                            {activity.topPerformers.tutors.length === 0 ? (
                                <div className="text-center py-4">
                                    <i className="bi bi-people display-1 text-muted mb-3"></i>
                                    <h5 className="fw-bold mb-2">No Top Tutors Found</h5>
                                    <p className="text-secondary">No tutors have completed sessions in this period.</p>
                                </div>
                            ) : (
                                <div className="row">
                                    {activity.topPerformers.tutors.map((tutor, index) => (
                                        <div key={tutor._id || tutor.email} className="col-lg-6">
                                            <div className="position-relative">
                                                {index < 3 && (
                                                    <div className="position-absolute top-0 start-0 z-1">
                                                        <span className={`badge ${index === 0 ? 'bg-warning' : index === 1 ? 'bg-secondary' : 'bg-danger'} text-dark`}>
                                                            #{index + 1}
                                                        </span>
                                                    </div>
                                                )}
                                                <TutorCard tutor={tutor} />
                                            </div>
                                        </div>
                                    ))}
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
            .z-1 {
                z-index: 1;
            }
        `}</style>
    </div>
  );
};

export default AdminActivity;

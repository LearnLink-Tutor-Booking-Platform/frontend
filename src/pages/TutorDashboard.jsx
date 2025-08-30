import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link } from 'react-router-dom';
import groupImg from '../assets/images/Group.png';
import objectImg from '../assets/images/Object.png';
import Footer from '../components/Footer';

const PROFILE_API = `${import.meta.env.VITE_API_URL}/api/tutor/profile`;
const DASHBOARD_API = `${import.meta.env.VITE_API_URL}/api/tutor/dashboard`;
const AVATAR_PLACEHOLDER = 'https://ui-avatars.com/api/?background=2DB8A1&color=fff&size=128&name=';

// --- Reusable Components ---
const TutorHeader = ({ profile }) => (
    <header className="bg-white shadow-sm sticky-top">
        <nav className="container navbar navbar-expand-lg navbar-light">
          <Link className="navbar-brand fw-bold" style={{ color: '#14b8a6' }} to="/tutor/dashboard">LearnLink</Link>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-center">
              <li className="nav-item">
                <Link className="nav-link" to="/tutor/bookings">My Bookings</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/tutor/messages">Messages</Link>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle d-flex align-items-center" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <img src={profile?.avatar || `${AVATAR_PLACEHOLDER}${profile?.name?.split(' ').join('+')}`} alt={profile?.name} className="rounded-circle me-2" style={{width: '35px', height: '35px'}} />
                  {profile?.name}
                </a>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                  <li><Link className="dropdown-item" to="/tutor-profile/">Edit Profile</Link></li>
                  <li><Link className="dropdown-item" to="/tutor/availability">Set Availability</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><a className="dropdown-item text-danger" href="/logout">Logout</a></li>
                </ul>
              </li>
            </ul>
          </div>
        </nav>
    </header>
);

const StatCard = ({ icon, value, label, color }) => (
    <div className="col">
        <div className="card text-center border-0 shadow-sm h-100 p-3 rounded-4" style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)'
        }}>
            <i className={`bi ${icon} display-6 mb-2`} style={{color}}></i>
            <h4 className="fw-bold mb-0" style={{ color: '#14b8a6' }}>{value}</h4>
            <p className="text-secondary small mb-0">{label}</p>
        </div>
    </div>
);
// --- End Reusable Components ---


function TutorDashboard() {
  const [profile, setProfile] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const [profileRes, dashboardRes] = await Promise.all([
          fetch(PROFILE_API, { headers }),
          fetch(DASHBOARD_API, { headers })
        ]);

        const profileData = await profileRes.json();
        const dashboardData = await dashboardRes.json();
        
        if (profileData.success && dashboardData.success) {
          setProfile(profileData.data);
          setDashboard(dashboardData.data);
        } else {
          throw new Error(profileData.message || dashboardData.message || 'Failed to fetch data');
        }
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };
    fetchData();
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
        {/* Personalized Hero Section */}
        <section className="py-5" style={{ background: 'linear-gradient(120deg, rgba(20, 184, 166, 0.1) 0%, rgba(126, 227, 242, 0.1) 100%)' }}>
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-md-8">
                        <h1 className="fw-bolder display-5" style={{ color: '#14b8a6' }}>Welcome back, {profile?.name?.split(' ')[0]}!</h1>
                        <p className="text-secondary lead">Here's a summary of your activity. Keep up the great work!</p>
                    </div>
                    <div className="col-md-4 text-md-end">
                        <Link to="/tutor/booking-requests" className="btn btn-lg fw-bold rounded-pill shadow-sm" style={{ backgroundColor: '#14b8a6', borderColor: '#14b8a6', color: 'white' }}>
                           <i className="bi bi-envelope-open-fill me-2"></i> View Booking Requests
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
                    <h3 className="fw-bold mb-3" style={{ color: '#14b8a6' }}>Your Statistics</h3>
                    <div className="row row-cols-2 row-cols-md-4 g-4 mb-5">
                        <StatCard icon="bi-cash-coin" value={`$${dashboard.statistics.totalEarnings}`} label="Total Earnings" color="#198754" />
                        <StatCard icon="bi-calendar-check" value={dashboard.statistics.completedBookings} label="Completed Sessions" color="#0d6efd" />
                        <StatCard icon="bi-star-fill" value={profile.rating || 'N/A'} label="Your Rating" color="#ffc107" />
                        <StatCard icon="bi-chat-dots-fill" value={dashboard.statistics.unreadMessages} label="Unread Messages" color="#dc3545" />
                    </div>

                    {/* Upcoming Bookings */}
                    <div className="card border-0 shadow-sm rounded-4" style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)'
                    }}>
                        <div className="card-body p-4">
                            <h4 className="fw-bold mb-3" style={{ color: '#14b8a6' }}>
                              <i className="bi bi-calendar-event me-2"></i>
                              Upcoming & Recent Bookings
                            </h4>
                            <ul className="list-group list-group-flush">
                                {dashboard.recentBookings.length === 0 ? (
                                    <p className="text-secondary">No recent bookings found.</p>
                                ) : (
                                    dashboard.recentBookings.map(booking => (
                                        <li key={booking._id} className="list-group-item d-flex justify-content-between align-items-center px-0 border-0">
                                            <div>
                                                <p className="fw-bold mb-0" style={{ color: '#14b8a6' }}>{booking.subject?.name} with {booking.parentId?.name || 'Parent'}</p>
                                                <p className="text-secondary small mb-0">
                                                    <i className="bi bi-calendar-event me-2"></i>
                                                    {new Date(booking.sessionTime).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                                                </p>
                                            </div>
                                            <span className={`badge px-3 py-2 ${booking.status === 'Completed' ? 'bg-success' : 'bg-warning text-dark'}`}>{booking.status}</span>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Side Content Area */}
                <div className="col-lg-4">
                    {/* Quick Actions */}
                    <div className="card border-0 shadow-sm rounded-4 mb-4" style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)'
                    }}>
                        <div className="card-body p-4">
                            <h4 className="fw-bold mb-3" style={{ color: '#14b8a6' }}>
                              <i className="bi bi-lightning me-2"></i>
                              Quick Actions
                            </h4>
                            <div className="d-grid gap-2">
                                <Link to="/tutor/bookings" className="btn btn-outline-dark rounded-pill">
                                  <i className="bi bi-calendar-check me-2"></i>View/Manage Bookings
                                </Link>
                                <Link to="/tutor/availability" className="btn btn-outline-primary rounded-pill" style={{ borderColor: '#14b8a6', color: '#14b8a6' }}>
                                  <i className="bi bi-calendar-week me-2"></i>Manage Availability
                                </Link>
                                <Link to={`/tutor-profile/${profile._id}`} className="btn btn-outline-secondary rounded-pill">
                                  <i className="bi bi-pencil-square me-2"></i>Edit Your Profile
                                </Link>
                                <Link to="/tutor/messages" className="btn btn-outline-info rounded-pill" style={{ borderColor: '#0dcaf0', color: '#0dcaf0' }}>
                                  <i className="bi bi-chat-dots me-2"></i>Messages
                                </Link>
                                <Link to="/tutor/waitlist" className="btn btn-outline-success rounded-pill" style={{ borderColor: '#198754', color: '#198754' }}>
                                  <i className="bi bi-hourglass-split me-2"></i>Waitlist
                                </Link>
                                {/* <Link to="/tutor/subjects" className="btn btn-outline-warning rounded-pill" style={{ borderColor: '#ffc107', color: '#ffc107' }}>
                                  <i className="bi bi-book me-2"></i>Manage Subjects
                                </Link> */}
                                <Link to="/tutor/disputes" className="btn btn-outline-danger rounded-pill">
                                  <i className="bi bi-exclamation-triangle me-2"></i>Disputes
                                </Link>
                            </div>
                        </div>
                    </div>
                    {/* Recent Reviews */}
                    <div className="card border-0 shadow-sm rounded-4" style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)'
                    }}>
                        <div className="card-body p-4">
                            <h4 className="fw-bold mb-3" style={{ color: '#14b8a6' }}>
                              <i className="bi bi-star me-2"></i>
                              Recent Reviews
                            </h4>
                            {dashboard.recentReviews.length === 0 ? (
                                <p className="text-secondary">You have no reviews yet.</p>
                            ) : (
                                dashboard.recentReviews.map(review => (
                                    <div key={review._id} className="mb-3">
                                        <div className="d-flex align-items-center mb-1">
                                            <p className="fw-bold mb-0 me-2" style={{ color: '#14b8a6' }}>{review.parentId?.name || 'Parent'}</p>
                                            <span className="text-warning small">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                                        </div>
                                        <p className="text-secondary fst-italic mb-0">"{review.comment}"</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <div style={{ position: 'relative', zIndex: 2 }}>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default TutorDashboard;
import React, { useEffect, useState, createContext, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// Context to provide busy times globally
export const BusyTimesContext = createContext();

function Navbar({ user, handleLogout }) {
  const navigate = useNavigate();
  const [busyTimesByTutor, setBusyTimesByTutor] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(user);
  const dropdownRef = useRef();

  // Fetch current user data including profile image
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (user && user.id) {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
            headers: { 'Authorization': token ? `Bearer ${token}` : '' }
          });
          const data = await res.json();
          if (data.success) {
            setCurrentUser(data.user);
            // Update localStorage with full user data
            localStorage.setItem('user', JSON.stringify(data.user));
          }
        } catch (err) {
          console.error('Failed to fetch user data:', err);
        }
      }
    };
    fetchCurrentUser();
  }, [user]);

  // Update currentUser when user prop changes
  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  useEffect(() => {
    const fetchBusyTimes = async () => {
      if (currentUser && currentUser.role === 'parent') {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/parent/all-tutors/busy-times`, {
          headers: { 'Authorization': token ? `Bearer ${token}` : '' }
        });
        const data = await res.json();
        if (data.success) {
          setBusyTimesByTutor(data.data.busyTimesByTutor);
          console.log(data.data);
          
        }
      }
    };
    fetchBusyTimes();
  }, [currentUser]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (currentUser) {
        const token = localStorage.getItem('token');
        if (!token) {
          setNotifications([]);
          setUnreadCount(0);
          return;
        }
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications`, {
            headers: { 'Authorization': token ? `Bearer ${token}` : '' }
          });
          const data = await res.json();
          if (data.success) {
            setNotifications(data.data);
            setUnreadCount(data.data.filter(n => !n.isRead).length);
          } else {
            setNotifications([]);
            setUnreadCount(0);
          }
        } catch (err) {
          setNotifications([]);
          setUnreadCount(0);
        }
      }
    };
    fetchNotifications();
  }, [currentUser]);

  const handleBellClick = async () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown && unreadCount > 0) {
      const token = localStorage.getItem('token');
      const unread = notifications.filter(n => !n.isRead);
      for (const n of unread) {
        await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/read`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify({ notificationId: n._id })
        });
      }
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    }
  };

  // --- Refined UI Styles for a cleaner hyperlink look ---
  const premiumStyles = {
    header: {
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #E2E8F0',
    },
    brand: {
      cursor: 'pointer',
      color: '#1A202C', // Very dark gray for high contrast
    },
    navLink: {
      color: '#4A5568', // Charcoal text
      fontWeight: 500,
      textDecoration: 'none',
      padding: '0.5rem 0.75rem',
      // On hover, text color could change to '#2DB8A1' for interactivity
    },
    buttonPrimary: {
      backgroundColor: '#2DB8A1',
      color: '#FFFFFF',
      borderColor: '#2DB8A1',
    },
    buttonSecondary: {
      backgroundColor: 'transparent',
      color: '#2D3748',
      borderColor: '#CBD5E0',
    },
    dropdown: {
      minWidth: '340px',
      right: 0,
      left: 'auto',
      top: '40px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      borderRadius: '8px',
      border: '1px solid #E2E8F0',
      backgroundColor: '#FFFFFF',
      zIndex: 1000,
    },
    notificationUnread: {
      backgroundColor: 'rgba(45, 184, 161, 0.08)',
    },
    userName: {
      cursor: 'pointer',
      color: '#2D3748',
    },
    logout: {
      cursor: 'pointer',
      color: '#718096',
    }
  };

  return (
    <BusyTimesContext.Provider value={busyTimesByTutor}>
      <header className="sticky-top" style={premiumStyles.header}>
        <nav className="container navbar navbar-expand-lg">
          {/* Brand */}
          <Link className="navbar-brand fw-bold fs-4" to="/" style={{ color: '#2DB8A1' }}>
            LearnLink
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarNav">
            {/* Main Navigation Hyperlinks */}
            <ul className="navbar-nav mx-auto">
              {/* Empty center nav for logged-in users, Home link for non-logged-in users */}
             
            </ul>

            {/* Right Side: User actions */}
            {currentUser ? (
              <div className="d-flex align-items-center gap-2">
                {/* Notification Bell */}
                <div className="position-relative me-2">
                  <button className="btn btn-link p-0 position-relative text-secondary" style={{ fontSize: 24 }} onClick={handleBellClick}>
                    <i className="bi bi-bell-fill"></i>
                    {unreadCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: 10 }}>
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {showDropdown && (
                    <div ref={dropdownRef} className="dropdown-menu show p-2" style={premiumStyles.dropdown}>
                      <div className="fw-bold mb-2 px-2">Notifications</div>
                       {notifications.length === 0 && <div className="text-muted text-center p-3">No new notifications</div>}
                      {notifications.slice(0, 5).map(n => (
                        <div key={n._id} className="mb-1 p-2 rounded" style={!n.isRead ? premiumStyles.notificationUnread : {}}>
                          <div className="small text-muted">{new Date(n.createdAt).toLocaleString()}</div>
                          <div className="fw-semibold text-dark">{n.message}</div>
                          {n.type === 'message' && n.data && (currentUser?.role === 'tutor' || currentUser?.role === 'parent') && (
                            <div className="mt-1">
                               <Link to={currentUser.role === 'tutor' ? "/tutor/messages" : `/parent/messages/${n.data.tutorId || n.data.senderId}`} className="btn btn-link btn-sm p-0" style={{color: premiumStyles.buttonPrimary.backgroundColor}}>
                                View Message
                              </Link>
                            </div>
                          )}
                        </div>
                      ))}
                      <div className="text-center mt-2 border-top pt-2">
                        <Link to="/notifications" className="btn btn-link btn-sm" style={{color: '#4A5568'}}>View all</Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Role-based Hyperlinks */}
                <Link to="/" className="nav-link" style={premiumStyles.navLink}>Home</Link>
                {currentUser.role === 'tutor' && (
                  <>
                    <Link to="/dashboard" className="nav-link" style={premiumStyles.navLink}>Dashboard</Link>
                    <Link to="/tutor/bookings" className="nav-link" style={premiumStyles.navLink}>Bookings</Link>
                    <Link to={`/tutor-profile/${currentUser.id || currentUser._id || ''}`} className="nav-link" style={premiumStyles.navLink}>Profile</Link>
                  </>
                )}
                {currentUser.role === 'parent' && (
                  <>
                    <Link to="/dashboard" className="nav-link" style={premiumStyles.navLink}>Dashboard</Link>
                    <Link to="/parent/bookings" className="nav-link" style={premiumStyles.navLink}>Bookings</Link>
                    <Link to="/parent/profile" className="nav-link" style={premiumStyles.navLink}>Profile</Link>
                  </>
                )}
                {currentUser.role === 'admin' && (
                  <Link to="/dashboard" className="nav-link" style={{...premiumStyles.navLink, color: '#E53E3E'}}>Admin Panel</Link>
                )}
                
                {/* Profile & Logout */}
                <div className="d-flex align-items-center gap-2">
                  {/* Profile Picture */}
                  <div className="position-relative">
                    {(() => {
                      // Debug logging
                      console.log('Current user object:', currentUser);
                      console.log('Profile image:', currentUser.profileImage);
                      
                      let imageSrc;
                      if (currentUser.profileImage) {
                        if (currentUser.profileImage.startsWith('/uploads/')) {
                          imageSrc = `${import.meta.env.VITE_API_URL}${currentUser.profileImage}`;
                        } else {
                          imageSrc = currentUser.profileImage;
                        }
                      } else {
                        imageSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || currentUser.email)}&background=14b8a6&color=fff&size=40&font-size=0.4`;
                      }
                      
                      console.log('Final image src:', imageSrc);
                      
                      return (
                        <img 
                          src={imageSrc}
                          alt={currentUser.name || 'Profile'}
                          className="rounded-circle"
                          style={{
                            width: '40px',
                            height: '40px',
                            objectFit: 'cover',
                            border: '2px solid #e2e8f0'
                          }}
                          onError={(e) => {
                            console.log('Image failed to load, using fallback');
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || currentUser.email)}&background=14b8a6&color=fff&size=40&font-size=0.4`;
                          }}
                          onLoad={() => {
                            console.log('Image loaded successfully');
                          }}
                        />
                      );
                    })()}
                  </div>
                  
                  {/* User Name */}
                  <span className="nav-link fw-bold" style={premiumStyles.userName}>
                    {currentUser.role === 'parent' && currentUser.childName
                      ? currentUser.childName
                      : (currentUser.name || currentUser.email)}
                  </span>
                  
                  {/* Logout */}
                  <span className="nav-link" style={premiumStyles.logout} onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-1"></i>Logout
                  </span>
                </div>
              </div>
            ) : (
              // Logged-out Navigation - Same style as logged-in users
              <div className="d-flex align-items-center gap-2">
                <Link to="/" className="nav-link" style={premiumStyles.navLink}>Home</Link>
                <Link to="/tutor-login" className="nav-link" style={premiumStyles.navLink}>Tutor Login</Link>
                <Link to="/parent-login" className="nav-link" style={premiumStyles.navLink}>Student Login</Link>
                <Link to="/register/tutor" className="btn btn-sm" style={premiumStyles.buttonSecondary}>Tutor Register</Link>
                <Link to="/register/parent" className="btn btn-sm" style={premiumStyles.buttonPrimary}>Student Register</Link>
              </div>
            )}
          </div>
        </nav>
      </header>
    </BusyTimesContext.Provider>
  );
}

export default Navbar;
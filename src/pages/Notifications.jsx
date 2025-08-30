import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Get user role from localStorage
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      setUserRole(user?.role || null);
    } catch (e) {
      setUserRole(null);
    }
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications`, {
          headers: { 'Authorization': token ? `Bearer ${token}` : '' }
        });
        const data = await res.json();
        if (data.success) {
          setNotifications(data.data);
        } else {
          setError('Failed to fetch notifications');
        }
      } catch (err) {
        setError('Failed to fetch notifications');
      }
      setLoading(false);
    };
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
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
    setMarkingAll(false);
  };

  return (
    <div className="container py-4" style={{ maxWidth: 600 }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold mb-0">Notifications</h3>
        <button className="btn btn-outline-success btn-sm" onClick={handleMarkAllRead} disabled={markingAll}>
          Mark all as read
        </button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : notifications.length === 0 ? (
        <div className="alert alert-info">No notifications yet.</div>
      ) : (
        <div className="list-group">
          {notifications.map(n => (
            <div key={n._id} className={`list-group-item d-flex flex-column ${n.isRead ? '' : 'bg-info bg-opacity-10'}` }>
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-semibold">{n.message}</span>
                <span className="badge bg-light text-secondary" style={{ fontSize: 12 }}>{new Date(n.createdAt).toLocaleString()}</span>
              </div>
              {/* Message notification links */}
              {n.type === 'message' && n.data && userRole && (
                <div className="mt-1">
                  {userRole === 'tutor' ? (
                    <Link to="/tutor/messages" className="btn btn-link btn-sm p-0">View Message</Link>
                  ) : (
                    <Link to={`/parent/messages/${n.data.tutorId || n.data.senderId}`} className="btn btn-link btn-sm p-0">View Message</Link>
                  )}
                </div>
              )}
              {/* Booking notification links */}
              {n.data && n.data.bookingId && userRole && (
                <div className="mt-1">
                  <Link to={userRole === 'tutor' ? `/tutor/bookings` : `/parent/bookings`} className="btn btn-link btn-sm p-0">View Booking</Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications; 
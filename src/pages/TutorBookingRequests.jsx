import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const BOOKINGS_API = `${import.meta.env.VITE_API_URL}/api/tutor/bookings?status=requested`;
const RESPOND_API = `${import.meta.env.VITE_API_URL}/api/tutor/booking/respond`;

function TutorBookingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(BOOKINGS_API, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setRequests(data.data.bookings);
      } else {
        setError(data.message || 'Failed to fetch booking requests');
      }
    } catch (err) {
      setError('Failed to fetch booking requests');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (bookingId, action, bookingData) => {
    setActionLoading(bookingId + action);
    setSuccess(null);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (action === 'reschedule') {
        // Send automated message for reschedule
        const messageRes = await fetch(`${import.meta.env.VITE_API_URL}/api/tutor/message`, {
          method: 'POST',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ 
            receiverId: bookingData.parentId._id,
            content: `Hi! I would like to reschedule our session. Could you please suggest an alternative time and date for our ${typeof bookingData.subject === 'object' ? bookingData.subject.name : bookingData.subject} session?`
          }),
        });
        
        const messageData = await messageRes.json();
        if (messageData.success) {
          setSuccess('Reschedule message sent to parent successfully!');
        } else {
          setError(messageData.message || 'Failed to send reschedule message');
        }
      } else {
        // Handle accept/decline actions normally
        const res = await fetch(RESPOND_API, {
          method: 'POST',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ bookingId, action }),
        });
        const data = await res.json();
        if (data.success) {
          setSuccess(data.message || 'Action successful!');
          fetchRequests();
        } else {
          setError(data.message || 'Action failed');
        }
      }
    } catch (err) {
      setError('Action failed');
    }
    setActionLoading(null);
  };

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container">
        <h2 className="fw-bold mb-4 text-center">Booking Requests</h2>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{minHeight: 200}}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger text-center">{error}</div>
        ) : requests.length === 0 ? (
          <div className="alert alert-info text-center">No booking requests found.</div>
        ) : (
          <div className="row g-4">
            {requests.map(req => (
              <div className="col-md-6 col-lg-4" key={req._id}>
                <div className="card border-0 shadow h-100">
                  <div className="card-body">
                    <h5 className="card-title fw-bold text-center mb-2">
                      From {req.parentId?.name || 'Parent'}
                    </h5>
                    <div className="mb-2 text-center text-secondary">
                      <i className="bi bi-journal-bookmark"></i> {typeof req.subject === 'object' ? req.subject.name : req.subject}
                    </div>
                    <div className="mb-2 text-center text-secondary">
                      <i className="bi bi-clock"></i> {new Date(req.sessionTime).toLocaleString()}
                    </div>
                    <div className="d-flex justify-content-center gap-2 mt-3">
                      <button className="btn btn-success btn-sm" disabled={actionLoading === req._id + 'accept'} onClick={() => handleAction(req._id, 'accept', req)}>Accept</button>
                      <button className="btn btn-danger btn-sm" disabled={actionLoading === req._id + 'decline'} onClick={() => handleAction(req._id, 'decline', req)}>Decline</button>
                      <button className="btn btn-warning btn-sm" disabled={actionLoading === req._id + 'reschedule'} onClick={() => handleAction(req._id, 'reschedule', req)}>Reschedule</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {success && <div className="alert alert-success text-center mt-3">{success}</div>}
      </div>
    </div>
  );
}

export default TutorBookingRequests; 
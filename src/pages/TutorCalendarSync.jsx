import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_URL = `${import.meta.env.VITE_API_URL}/api/tutor/calendar/sync`;

function TutorCalendarSync() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSync = async (calendarType) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ calendarType, accessToken: 'dummy-access-token' }), // In real app, get real accessToken
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data.message || 'Calendar sync initiated!');
      } else {
        setError(data.message || 'Failed to sync calendar');
      }
    } catch (err) {
      setError('Failed to sync calendar');
    }
    setLoading(false);
  };

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container">
        <h2 className="fw-bold mb-4 text-center">Sync Your Calendar</h2>
        <div className="d-flex flex-column align-items-center gap-3">
          <button className="btn btn-danger" onClick={() => handleSync('google')} disabled={loading}>Sync with Google Calendar</button>
          <button className="btn btn-primary" onClick={() => handleSync('outlook')} disabled={loading}>Sync with Outlook Calendar</button>
          <button className="btn btn-secondary" onClick={() => handleSync('ical')} disabled={loading}>Sync with iCal</button>
        </div>
        {loading && <div className="text-center mt-3"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>}
        {result && <div className="alert alert-success text-center mt-3">{result}</div>}
        {error && <div className="alert alert-danger text-center mt-3">{error}</div>}
      </div>
    </div>
  );
}

export default TutorCalendarSync; 
import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link } from 'react-router-dom';
import groupImg from '../assets/images/Group.png';
import objectImg from '../assets/images/Object.png';
import Footer from '../components/Footer';

const PROFILE_API = `${import.meta.env.VITE_API_URL}/api/tutor/profile`;
const AVAIL_API = `${import.meta.env.VITE_API_URL}/api/tutor/availability`;

const initialDays = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

// --- Reusable Components ---
const TutorHeader = ({ profileName }) => (
    <header className="bg-white shadow-sm sticky-top">
        <nav className="container navbar navbar-expand-lg navbar-light">
          <Link className="navbar-brand fw-bold" style={{ color: '#14b8a6' }} to="/tutor/dashboard">LearnLink</Link>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-center">
              <li className="nav-item">
                <Link className="nav-link" to="/tutor/dashboard">Dashboard</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/tutor/profile/edit">
                    <i className="bi bi-person-fill me-1"></i> {profileName || 'My Profile'}
                </Link>
              </li>
            </ul>
          </div>
        </nav>
    </header>
);
// --- End Reusable Components ---

function TutorAvailability() {
  // Each slot will now have an 'isAvailable' flag for the toggle switch
  const [availability, setAvailability] = useState([]);
  const [tutorName, setTutorName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(PROFILE_API, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setTutorName(data.data.name);
          // Initialize a full 7-day structure
          const fetchedAvailability = data.data.availability || [];
          const fullWeek = initialDays.map(day => {
            const savedSlot = fetchedAvailability.find(slot => slot.day === day);
            return {
              day: day,
              startTime: savedSlot?.startTime || '',
              endTime: savedSlot?.endTime || '',
              isAvailable: !!savedSlot, // Day is available if a slot was saved for it
            };
          });
          setAvailability(fullWeek);
        } else {
          throw new Error(data.message || 'Failed to fetch availability');
        }
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleChange = (day, field, value) => {
    setAvailability(prev => 
      prev.map(slot => {
        if (slot.day === day) {
          const updatedSlot = { ...slot, [field]: value };
          // If toggling off, clear times
          if (field === 'isAvailable' && !value) {
            updatedSlot.startTime = '';
            updatedSlot.endTime = '';
          }
          return updatedSlot;
        }
        return slot;
      })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      // Filter out unavailable days or days with incomplete times before sending
      const availabilityToSave = availability
        .filter(slot => slot.isAvailable && slot.startTime && slot.endTime)
        .map(({ day, startTime, endTime }) => ({ day, startTime, endTime })); // Send clean data

      const token = localStorage.getItem('token');
      const res = await fetch(AVAIL_API, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ availability: availabilityToSave }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Availability updated successfully!');
      } else {
        throw new Error(data.message || 'Failed to update availability');
      }
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  const renderForm = () => {
    if (loading) {
        return (
            <div className="d-flex justify-content-center py-5">
                <div className="spinner-border" style={{'--bs-spinner-color': '#14b8a6', width: '3rem', height: '3rem'}} role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }
    return (
        <form onSubmit={handleSubmit} className="mx-auto" style={{maxWidth: '700px'}}>
            <div className="text-center bg-light border rounded-3 p-3 mb-4">
                <p className="mb-0 text-secondary">Toggle each day on or off. Set a start and end time for the days you are available to take sessions.</p>
            </div>
            <div className="d-grid gap-3">
                {availability.map(({ day, startTime, endTime, isAvailable }) => (
                    <div className="card shadow-sm border-0 rounded-4" key={day}>
                        <div className="card-body d-flex flex-column flex-md-row align-items-center p-4">
                            <div className="form-check form-switch form-switch-lg me-md-4 mb-2 mb-md-0">
                                <input className="form-check-input" type="checkbox" role="switch" id={`switch-${day}`} checked={isAvailable} onChange={e => handleChange(day, 'isAvailable', e.target.checked)} />
                                <label className="form-check-label text-capitalize fw-bold" htmlFor={`switch-${day}`}>{day}</label>
                            </div>
                            <div className={`d-flex gap-2 flex-grow-1 time-inputs ${isAvailable ? 'visible' : ''}`}>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-0"><i className="bi bi-clock"></i></span>
                                    <input type="time" className="form-control" value={startTime} onChange={e => handleChange(day, 'startTime', e.target.value)} disabled={!isAvailable} />
                                </div>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-0"><i className="bi bi-clock-fill"></i></span>
                                    <input type="time" className="form-control" value={endTime} onChange={e => handleChange(day, 'endTime', e.target.value)} disabled={!isAvailable} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-4 pt-3 border-top">
                {success && <div className="alert alert-success">{success}</div>}
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="d-flex justify-content-end">
                    <Link to="/tutor/dashboard" className="btn btn-secondary me-2">Cancel</Link>
                    <button type="submit" className="btn btn-primary-custom px-4" disabled={saving}>
                        {saving ? <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Saving...</> : 'Save Availability'}
                    </button>
                </div>
            </div>
        </form>
    );
  };

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
        <main className="container py-5">
            <div className="text-center mb-5">
                <h1 className="fw-bolder" style={{ color: '#14b8a6' }}>
                  <i className="bi bi-calendar-week me-2"></i>
                  Set Your Weekly Availability
                </h1>
                <p className="lead text-secondary">Let students know when you're available for sessions.</p>
            </div>
            {renderForm()}
        </main>

        <div style={{ position: 'relative', zIndex: 2 }}>
          <Footer />
        </div>
      </div>

      <style>{`
        .form-switch.form-switch-lg {
            min-width: 150px;
        }
        .form-switch.form-switch-lg .form-check-input {
            width: 3em;
            height: 1.5em;
            --bs-form-switch-bg: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='rgba%280, 0, 0, 0.25%29'/%3e%3c/svg%3e");
        }
        .form-check-input:checked {
            background-color: #14b8a6;
            border-color: #14b8a6;
        }
        .time-inputs {
            transition: opacity 0.3s ease;
            opacity: 0.3;
        }
        .time-inputs.visible {
            opacity: 1;
        }
        .btn-primary-custom {
            background-color: #14b8a6;
            border-color: #14b8a6;
            color: white;
        }
        .btn-primary-custom:hover {
            background-color: #0d9488;
            border-color: #0d9488;
        }
      `}</style>
    </div>
  );
}

export default TutorAvailability;
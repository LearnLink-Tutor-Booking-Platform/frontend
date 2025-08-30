import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link, useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Footer from '../components/Footer';
import groupImg from '../assets/images/Group.png';
import objectImg from '../assets/images/Object.png';

const API_URL = `${import.meta.env.VITE_API_URL}/api/parent/book-session`;
const TUTOR_PROFILE_API = `${import.meta.env.VITE_API_URL}/api/parent/tutor/`;
const AVATAR_PLACEHOLDER = 'https://ui-avatars.com/api/?background=2DB8A1&color=fff&size=128&name=';
const SUBJECTS_API_URL = `${import.meta.env.VITE_API_URL}/api/subjects`;

// A custom hook to read query parameters from the URL
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// --- Reusable Components (for consistency with other pages) ---
const AppHeader = () => (
    <header className="bg-white shadow-sm sticky-top">
        <nav className="container navbar navbar-expand-lg navbar-light">
          <Link className="navbar-brand fw-bold" style={{ color: '#2DB8A1' }} to="/">LearnLink</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav mx-auto">
              <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/companies">Companies</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/students">Students</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/e-souvenir">E-Souvenir</Link></li>
            </ul>
            <div className="d-flex">
              <Link to="/tutor-login" className="btn btn-outline-secondary btn-sm me-2">Tutor Login</Link>
              <Link to="/student-login" className="btn btn-primary btn-sm" style={{ backgroundColor: '#2DB8A1', borderColor: '#2DB8A1' }}>Student Login</Link>
            </div>
          </div>
        </nav>
    </header>
);

const AppFooter = () => (
    <footer className="bg-dark text-white pt-5 pb-4 mt-5">
        <div className="container text-center text-md-start">
            <div className="row">
                <div className="col-md-3 col-lg-3 col-xl-3 mx-auto mt-3">
                    <h5 className="text-uppercase mb-4 fw-bold" style={{ color: '#2DB8A1' }}>LearnLink</h5>
                    <p>Connecting students with the best tutors to achieve academic excellence.</p>
                </div>
                <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mt-3"><h6 className="text-uppercase mb-4 fw-bold">Resources</h6><p><a href="#!" className="text-white-50 text-decoration-none">Help Center</a></p></div>
                <div className="col-md-3 col-lg-2 col-xl-2 mx-auto mt-3"><h6 className="text-uppercase mb-4 fw-bold">Company</h6><p><a href="#!" className="text-white-50 text-decoration-none">About Us</a></p></div>
                <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mt-3"><h6 className="text-uppercase mb-4 fw-bold">Follow Us</h6><a href="#" className="btn btn-floating m-1" style={{backgroundColor: '#3b5998'}} role="button"><i className="bi bi-facebook"></i></a><a href="#" className="btn btn-floating m-1" style={{backgroundColor: '#55acee'}} role="button"><i className="bi bi-twitter"></i></a><a href="#" className="btn btn-floating m-1" style={{backgroundColor: '#ac2bac'}} role="button"><i className="bi bi-instagram"></i></a></div>
            </div>
        </div>
    </footer>
);
// --- End Reusable Components ---


const ParentBookSession = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const { tutorId: paramTutorId, subjectId: paramSubjectId } = useParams();
  const tutorId = paramTutorId || query.get('tutorId');
  const subjectId = paramSubjectId || query.get('subjectId');
  const datetimeParam = query.get('datetime');

  const [form, setForm] = useState({ tutorId: '', sessionTime: '', subject: '', notes: '' });
  const [tutor, setTutor] = useState(null);
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tutorLoading, setTutorLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [allSubjects, setAllSubjects] = useState([]);

  useEffect(() => {
    // Fetch all subjects for lookup
    fetch(SUBJECTS_API_URL)
      .then(res => res.json())
      .then(data => {
        if (data.success) setAllSubjects(data.data.subjects);
      });
  }, []);

  useEffect(() => {
    if (tutorId) {
        setForm(f => ({ ...f, tutorId }));
        setTutorLoading(true);
        const token = localStorage.getItem('token');
        fetch(`${TUTOR_PROFILE_API}${tutorId}`, {
            headers: { 'Authorization': token ? `Bearer ${token}` : '' },
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                setTutor(data.data);
                // If subjectId is present, find the subject object
                if (subjectId && data.data.subjects) {
                  // subjects may be array of objects or ids
                  let subjObj = null;
                  for (const s of data.data.subjects) {
                    if (typeof s === 'object' && (s._id === subjectId || s.subject?._id === subjectId)) {
                      subjObj = s.subject || s;
                      break;
                    } else if (s === subjectId) {
                      subjObj = allSubjects.find(sub => sub._id === subjectId);
                      break;
                    }
                  }
                  setSubject(subjObj);
                  setForm(f => ({ ...f, subject: subjectId }));
                }
                // If datetime param is present, pre-fill sessionTime
                if (datetimeParam) {
                  // Convert ISO string to local datetime-local input format
                  const dt = new Date(datetimeParam);
                  const pad = n => n.toString().padStart(2, '0');
                  const local = `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
                  setForm(f => ({ ...f, sessionTime: local }));
                }
            } else {
                setError('Could not load tutor details.');
            }
        })
        .catch(() => setError('A network error occurred.'))
        .finally(() => setTutorLoading(false));
    } else {
        setError("No Tutor ID provided.");
        setTutorLoading(false);
    }
  }, [tutorId, subjectId, allSubjects, datetimeParam]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(data.message || 'Session booked successfully!');
        setTimeout(() => navigate('/parent/bookings'), 2500);
      } else {
        setError(data.message || 'Failed to book session');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    }
    setLoading(false);
  };

  const renderContent = () => {
    if (tutorLoading) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
          {/* Custom SVG Spinner Man */}
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="36" stroke="#2DB8A1" strokeWidth="8" strokeDasharray="56 56" strokeLinecap="round">
              <animateTransform attributeName="transform" type="rotate" from="0 40 40" to="360 40 40" dur="1s" repeatCount="indefinite" />
            </circle>
            <circle cx="40" cy="25" r="6" fill="#2DB8A1">
              <animate attributeName="cy" values="25;15;25" dur="1s" repeatCount="indefinite" />
            </circle>
            <rect x="36" y="45" width="8" height="18" rx="4" fill="#2DB8A1">
              <animate attributeName="y" values="45;55;45" dur="1s" repeatCount="indefinite" />
            </rect>
          </svg>
        </div>
      );
    }

    if (success) {
      return (
        <div className="card p-5 shadow-sm rounded-4 mx-auto text-center" style={{maxWidth: 600}}>
             <i className="bi bi-check-circle-fill display-1 mb-3" style={{color: '#2DB8A1'}}></i>
             <h2 className="fw-bold">Session Booked!</h2>
             <p className="text-secondary fs-5">{success}</p>
             <p>Redirecting to your bookings page...</p>
             <div className="mt-3">
                <Link to="/parent/bookings" className="btn btn-outline-primary rounded-pill">View My Bookings Now</Link>
             </div>
        </div>
      );
    }
    
    return (
        <div className="row g-5 justify-content-center">
            {/* Left Column: Form */}
            <div className="col-lg-7 col-md-10">
                <div className="card p-4 p-md-5 shadow-sm border-0 rounded-4 h-100">
                    <h4 className="fw-bold mb-4">Booking Details</h4>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Tutor</label>
                            <input type="text" className="form-control" value={tutor ? tutor.name : 'Loading...'} disabled />
                        </div>
                        <div className="row g-3">
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-semibold">Subject</label>
                                {subjectId && subject ? (
                                  <input type="text" className="form-control" value={subject.name} disabled />
                                ) : (
                                <select className="form-select" name="subject" value={form.subject} onChange={handleChange} required disabled={!tutor}>
                                <option value="">Select a subject</option>
                                {tutor?.subjects?.map(subjId => {
                                  const subj = allSubjects.find(s => s._id === subjId || s._id === subjId._id);
                                  return subj ? (
                                    <option key={subj._id} value={subj._id}>{subj.name}</option>
                                  ) : null;
                                })}
                                </select>
                                )}
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-semibold">Session Time</label>
                                <input type="datetime-local" className="form-control" name="sessionTime" value={form.sessionTime} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label fw-semibold">Notes for the Tutor <span className="text-secondary">(Optional)</span></label>
                            <textarea className="form-control" name="notes" rows="4" placeholder="e.g., 'My child needs help with Chapter 5 on fractions.'" value={form.notes} onChange={handleChange} />
                        </div>

                        {error && <div className="alert alert-danger mt-3">{error}</div>}

                        <div className="d-grid mt-4">
                            <button type="submit" className="btn btn-lg fw-semibold rounded-pill" style={{backgroundColor: '#2DB8A1', borderColor: '#2DB8A1', color: 'white'}} disabled={loading}>
                                {loading ? (<><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Booking...</>) : 'Confirm & Book Session'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right Column: Tutor Info */}
            {tutor && (
                <div className="col-lg-4">
                    <div className="card p-4 shadow-sm border-0 rounded-4 position-sticky" style={{top: '120px'}}>
                        <img src={tutor.avatar || `${AVATAR_PLACEHOLDER}${tutor.name.split(' ').join('+')}`} alt={tutor.name} className="rounded-circle mx-auto" style={{width: 100, height: 100, marginTop: '-70px', border: '5px solid #fff'}}/>
                        <div className="card-body text-center pt-2">
                            <h5 className="fw-bold mt-2">{tutor.name}</h5>
                            <p className="text-secondary small">Your selected tutor</p>
                            <hr/>
                            <p className="fw-semibold mb-2 text-start">Can teach:</p>
                            <div className="d-flex flex-wrap justify-content-start">
                                {tutor.subjects.map(sid => {
                                  const subj = allSubjects.find(s => s._id === sid || s._id === sid._id);
                                  return subj ? (
                                    <span key={sid} className="badge fw-normal m-1" style={{backgroundColor: '#E9F8F5', color: '#036C5C'}}>{subj.name}</span>
                                  ) : null;
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
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
        
        <main className="container my-5" style={{ position: 'relative', zIndex: 1 }}>
            <div className="text-center mb-5">
                <h1 className="fw-bolder" style={{ color: '#14b8a6' }}>Schedule Your Session</h1>
                <p className="lead text-secondary">
                    {tutor ? `Confirm the details to book your session with ${tutor.name}.` : 'Please wait while we load the details.'}
                </p>
            </div>
            {renderContent()}
        </main>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <Footer />
        </div>
    </div>
  );
};

export default ParentBookSession;
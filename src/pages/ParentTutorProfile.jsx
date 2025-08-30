import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import blobImg from '../assets/images/blob.png';
import studentsImg from '../assets/images/students.png';
import groupImg from '../assets/images/Group.png';
import objectImg from '../assets/images/Object.png';
import { markRecentlyVisited } from './ParentDashboard';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Footer from '../components/Footer';

// Reusable Header Component
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

// Reusable Footer Component
const AppFooter = () => (
    <footer className="bg-dark text-white pt-5 pb-4">
        <div className="container text-center text-md-start">
            <div className="row">
                <div className="col-md-3 col-lg-3 col-xl-3 mx-auto mt-3">
                    <h5 className="text-uppercase mb-4 fw-bold" style={{ color: '#2DB8A1' }}>LearnLink</h5>
                    <p>Connecting students with the best tutors to achieve academic excellence.</p>
                </div>
                <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mt-3">
                    <h6 className="text-uppercase mb-4 fw-bold">Resources</h6>
                    <p><a href="#!" className="text-white-50 text-decoration-none">Help Center</a></p>
                </div>
                <div className="col-md-3 col-lg-2 col-xl-2 mx-auto mt-3">
                    <h6 className="text-uppercase mb-4 fw-bold">Company</h6>
                    <p><a href="#!" className="text-white-50 text-decoration-none">About Us</a></p>
                </div>
                <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mt-3">
                    <h6 className="text-uppercase mb-4 fw-bold">Follow Us</h6>
                    <a href="#" className="btn btn-floating m-1" style={{backgroundColor: '#3b5998'}} role="button"><i className="bi bi-facebook"></i></a>
                    <a href="#" className="btn btn-floating m-1" style={{backgroundColor: '#55acee'}} role="button"><i className="bi bi-twitter"></i></a>
                    <a href="#" className="btn btn-floating m-1" style={{backgroundColor: '#ac2bac'}} role="button"><i className="bi bi-instagram"></i></a>
                </div>
            </div>
        </div>
    </footer>
);

const SimilarTutorCard = ({ tutor }) => (
    <div className="card tutor-card shadow-sm border-0 rounded-4 mb-3" style={{ 
      minWidth: 320, 
      maxWidth: 350,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      transition: 'transform 0.2s ease-in-out'
    }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
        <div style={{ position: 'relative', height: '120px', overflow: 'hidden', borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }}>
            <img
                src={tutor.subjectImage || blobImg}
                alt="Subject"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <span style={{ position: 'absolute', top: 12, right: 16, background: 'rgba(255,255,255,0.8)', borderRadius: '50%', padding: 6 }}>
                <i className="bi bi-bookmark" style={{ fontSize: 22, color: '#14b8a6' }}></i>
            </span>
            <img
                src={tutor.profileImage ? (tutor.profileImage.startsWith('/uploads/') ? `${import.meta.env.VITE_API_URL}${tutor.profileImage}` : tutor.profileImage) : studentsImg}
                alt={tutor.name}
                className="rounded-circle"
                style={{ width: 64, height: 64, border: '3px solid #fff', position: 'absolute', left: 20, bottom: -32, objectFit: 'cover', background: '#fff' }}
            />
        </div>
        <div className="card-body pt-5 pb-3 px-4">
            <div className="fw-bold text-center mb-1" style={{ fontSize: 20, color: '#222' }}>{tutor.name || 'Tutor Name goes here'}</div>
            <div className="text-secondary small mb-1" style={{ marginTop: 8 }}>{tutor.education || 'BSc (Hons) in IT'}</div>
            <div className="fw-bold mb-2" style={{ fontSize: 17 }}>{tutor.description || 'Online Mathematics classes for students island wide'}</div>
            <div className="d-flex align-items-center mb-2" style={{ gap: 8 }}>
                <i className="bi bi-star-fill" style={{ color: '#FFD700', fontSize: 18 }}></i>
                <span className="fw-semibold" style={{ fontSize: 15 }}>{tutor.rating || '4.5'}</span>
                <span className="text-secondary small">({tutor.totalReviews || '10'})</span>
            </div>
            <div className="d-flex align-items-center mb-2" style={{ gap: 8 }}>
                <i className="bi bi-geo-alt" style={{ color: '#14b8a6', fontSize: 16 }}></i>
                <span className="text-secondary small">{tutor.location || 'Galle, Colombo, Moratuwa, Nugegoda'}</span>
            </div>
            <div className="d-flex align-items-center mb-3" style={{ gap: 8 }}>
                <i className="bi bi-currency-rupee" style={{ color: '#14b8a6', fontSize: 16 }}></i>
                <span className="text-secondary small">Rs. {tutor.hourlyRate || '2500'}/hr</span>
            </div>
            <button className="btn w-100 rounded-3 fw-bold" style={{ background: '#14b8a6', color: '#fff', fontSize: 17 }}>Book Now</button>
        </div>
    </div>
);

const ParentTutorProfile = () => {
    // All hooks at the top
    const { tutorId, subjectId } = useParams();
    const navigate = useNavigate();
    const [tutor, setTutor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [similarTutors, setSimilarTutors] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);

    // Update recently visited when tutorId and subjectId are available
    useEffect(() => {
        if (tutorId && subjectId) {
            markRecentlyVisited(tutorId, subjectId);
        }
    }, [tutorId, subjectId]);

    // Fetch tutor profile
    useEffect(() => {
        const fetchTutor = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/parent/tutor/${tutorId}`, {
                    headers: { 'Authorization': token ? `Bearer ${token}` : '' },
                });
                const data = await res.json();
                if (data.success) {
                    setTutor(data.data);
                } else {
                    setError(data.message || 'Failed to fetch tutor profile');
                }
            } catch (err) {
                setError('Failed to fetch tutor profile');
            }
            setLoading(false);
        };
        fetchTutor();
    }, [tutorId]);

    // Prepare subject selection logic (must be outside of render/return)
    const subjects = tutor?.subjects || [];
    let selectedSubjectEntry = null;
    if (subjectId && subjects.length > 0) {
        selectedSubjectEntry = subjects.find(s => (s.subject && (s.subject._id === subjectId || s.subject.id === subjectId)) || s._id === subjectId);
    }
    if (!selectedSubjectEntry && subjects.length > 0) {
        selectedSubjectEntry = subjects[0];
    }

    // Fetch similar tutors when tutor and subject are loaded
    useEffect(() => {
        if (!selectedSubjectEntry || !selectedSubjectEntry.subject || !selectedSubjectEntry.subject._id) return;
        const fetchSimilarTutors = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/parent/similar-tutors?subjectId=${selectedSubjectEntry.subject._id}&excludeTutorId=${tutorId}`,
                    { headers: { 'Authorization': token ? `Bearer ${token}` : '' } }
                );
                const data = await res.json();
                if (data.success) setSimilarTutors(data.data);
                else setSimilarTutors([]);
            } catch (err) {
                setSimilarTutors([]);
            }
        };
        fetchSimilarTutors();
    }, [selectedSubjectEntry, tutorId]);

    // Helper to combine date and time into a single Date object
    const getCombinedDateTime = () => {
        if (!selectedDate || !selectedTime) return null;
        const date = new Date(selectedDate);
        date.setHours(selectedTime.getHours());
        date.setMinutes(selectedTime.getMinutes());
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    };
    const combinedDateTime = getCombinedDateTime();

    // All early returns come after hooks
    if (loading) return (
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
    if (error) return <div className="alert alert-danger mt-4">{error}</div>;
    if (!tutor) return <div className="alert alert-warning mt-4">Tutor not found.</div>;

    // Fallbacks for missing fields
    const avatar = tutor.avatar || (tutor.profileImage ? (tutor.profileImage.startsWith('/uploads/') ? `${import.meta.env.VITE_API_URL}${tutor.profileImage}` : tutor.profileImage) : studentsImg);
    const name = tutor.name || 'Tutor';
    const tagline = tutor.tagline || tutor.bio || '';
    const rating = tutor.rating || 0;
    const reviewsCount = tutor.totalReviews || '-';
    const studentsCount = tutor.studentsCount || '-';
    const location = tutor.location || '-';
    const about = tutor.bio || tutor.about || '';
    const qualifications = tutor.expertise || tutor.qualifications || [];
    const availability = tutor.availability || {};
    const reviews = tutor.recentReviews || [];
    const selectedSubject = (selectedSubjectEntry && selectedSubjectEntry.subject) || selectedSubjectEntry || {};
    // Merge the title from the subject entry into the subject object
    const subjectTitle = selectedSubjectEntry && selectedSubjectEntry.title;
    const selectedSubjectWithTitle = { ...selectedSubject, title: subjectTitle };
    let subjectImage = blobImg; // default fallback
    if (selectedSubjectWithTitle.imageUrl) {
        if (selectedSubjectWithTitle.imageUrl.startsWith('/uploads/')) {
            subjectImage = `${import.meta.env.VITE_API_URL}${selectedSubjectWithTitle.imageUrl}`;
        } else {
            subjectImage = selectedSubjectWithTitle.imageUrl;
        }
    }
    const hourlyRate = (selectedSubjectEntry && selectedSubjectEntry.hourlyRate) || tutor.hourlyRate || '-';

    // Filter reviews for the selected subject only (using review.subject field)
    let filteredReviews = reviews;
    if (subjectId && reviews && reviews.length > 0) {
        filteredReviews = reviews.filter(review => {
            if (!review.subject) return false;
            return (
                review.subject === subjectId ||
                (review.subject._id && review.subject._id === subjectId)
            );
        });
    }

    // Helper to format availability
    const formatAvailability = (availabilityArr) => {
        const daysOfWeek = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
        if (!Array.isArray(availabilityArr)) return null;
        // Map for quick lookup
        const availMap = {};
        availabilityArr.forEach(slot => {
            if (slot && slot.day) availMap[slot.day.toLowerCase()] = slot;
        });
        return daysOfWeek.map(day => {
            const slot = availMap[day];
            if (slot && slot.startTime && slot.endTime) {
                return (
                    <li key={day} className="d-flex justify-content-between border-0 px-1">
                        <span className="text-capitalize">{day}</span>
                        <span className="fw-semibold text-success">{slot.startTime} - {slot.endTime}</span>
                    </li>
                );
            } else {
                return (
                    <li key={day} className="d-flex justify-content-between border-0 px-1">
                        <span className="text-capitalize">{day}</span>
                        <span className="fw-semibold text-danger">Not Available</span>
                    </li>
                );
            }
        });
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
        
            {/* Subject Image Banner */}
            <div style={{ 
              width: '100%', 
              maxHeight: 320, 
              overflow: 'hidden', 
              background: 'rgba(255, 255, 255, 0.95)', 
              borderRadius: '0 0 2rem 2rem', 
              marginBottom: 24,
              position: 'relative',
              zIndex: 1
            }}>
                <img src={subjectImage} alt="Subject" style={{ width: '100%', height: 240, objectFit: 'cover', display: 'block', margin: '0 auto' }} />
            </div>
            {/* Subject Name */}
            {selectedSubjectWithTitle && selectedSubjectWithTitle.name && (
                <div className="text-uppercase text-info fw-bold text-center mb-3" style={{ fontSize: 22, letterSpacing: 1, color: '#14b8a6', position: 'relative', zIndex: 1 }}>
                    {selectedSubjectWithTitle.name}
                </div>
            )}
            <main className="container mb-5" style={{ position: 'relative', zIndex: 1 }}>
                <div className="row g-5">
                    {/* Left Column: Main Content */}
                    <div className="col-lg-8">
                        {/* Title, Location, Rate */}
                        <h2 className="fw-bold mb-2" style={{ fontSize: 32, color: '#14b8a6' }}>{selectedSubjectWithTitle.title || tutor.description || 'Online Mathematics classes for students island wide'}</h2>
                        <div className="d-flex flex-wrap align-items-center mb-3 gap-3">
                            <span><i className="bi bi-geo-alt me-1"></i> {location}</span>
                            <span><i className="bi bi-currency-rupee me-1"></i> Rs. {hourlyRate}/hour</span>
                        </div>
                        {/* About Me Section */}
                        <div className="card border-0 shadow-sm rounded-4 mb-4" style={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(10px)'
                        }}>
                            <div className="card-body p-4">
                                <h4 className="fw-bold mb-3" style={{ color: '#14b8a6' }}>About</h4>
                                <p className="text-secondary lh-lg">{about || 'No bio provided.'}</p>
                            </div>
                        </div>
                        {/* Review & Ratings Section */}
                        <div className="card border-0 shadow-sm rounded-4 mb-4" style={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(10px)'
                        }}>
                            <div className="card-body p-4">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h4 className="fw-bold mb-0" style={{ color: '#14b8a6' }}>Review & Ratings</h4>
                                    {filteredReviews.length > 3 && (
                                        <Link 
                                            to={`/parent/tutor/${tutorId}/reviews`} 
                                            className="btn btn-outline-primary btn-sm"
                                            style={{ borderColor: '#14b8a6', color: '#14b8a6' }}
                                        >
                                            View All Reviews
                                        </Link>
                                    )}
                                </div>
                                {filteredReviews.length === 0 && <div className="text-secondary">No reviews yet.</div>}
                                {filteredReviews.slice(0, 3).map((review, idx) => {
                                    // Handle reviewer profile image
                                    let reviewerImage = 'https://via.placeholder.com/50x50/14b8a6/ffffff?text=' + (review.parentName || (review.parentId && review.parentId.name) || 'P').charAt(0);
                                    if (review.parentId && review.parentId.profileImage) {
                                        if (review.parentId.profileImage.startsWith('/uploads/')) {
                                            reviewerImage = `${import.meta.env.VITE_API_URL}${review.parentId.profileImage}`;
                                        } else {
                                            reviewerImage = review.parentId.profileImage;
                                        }
                                    }
                                    
                                    return (
                                        <div key={review._id || idx} className="d-flex mb-4">
                                            <img 
                                                src={reviewerImage} 
                                                alt={review.parentName || (review.parentId && review.parentId.name) || 'Parent'} 
                                                className="rounded-circle me-3" 
                                                style={{width: '50px', height: '50px', objectFit: 'cover'}}
                                            />
                                            <div className="flex-grow-1">
                                                <div className="d-flex justify-content-between">
                                                    <h6 className="fw-bold mb-0">{review.parentName || (review.parentId && review.parentId.name) || 'Parent'}</h6>
                                                    <span className="text-warning">{'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}</span>
                                                </div>
                                                <p className="text-secondary mb-1">"{review.comment || review.text}"</p>
                                                <small className="text-muted">{review.date || (review.createdAt && new Date(review.createdAt).toLocaleDateString())}</small>
                                            </div>
                                        </div>
                                    );
                                })}
                                {/* Add Review Form for parents only */}
                                {(() => {
                                    let user = null;
                                    try { user = JSON.parse(localStorage.getItem('user')); } catch (e) {}
                                    if (user && user.role === 'parent' && user.id !== tutorId) {
                                        return <div className="mt-4"><AddReviewForm tutorId={tutorId} subjectId={selectedSubject && selectedSubject._id ? selectedSubject._id : subjectId} /></div>;
                                    }
                                    return null;
                                })()}
                            </div>
                        </div>
                        {/* Similar Tutors Section */}
                        <div className="mb-5">
                            <h4 className="fw-bold mb-3" style={{ color: '#14b8a6' }}>Similar tutors</h4>
                            <div className="d-flex flex-wrap gap-4">
                                {similarTutors.length === 0 && <div className="text-secondary">No similar tutors found.</div>}
                                {similarTutors.map((t, i) => {
                                    // Find the subject entry for the selected subject
                                    const subjEntry = t.subjects.find(s => s.subject && s.subject._id === selectedSubjectEntry.subject._id);
                                    // Merge the title from the subject entry into the subject object
                                    const subjectWithTitle = subjEntry && subjEntry.subject ? { ...subjEntry.subject, title: subjEntry.title } : {};
                                    return (
                                        <SimilarTutorCard key={t._id || i} tutor={{
                                            ...t,
                                            subject: subjectWithTitle,
                                            subjectId: subjectWithTitle._id,
                                            subjectImage: subjectWithTitle.imageUrl ? (subjectWithTitle.imageUrl.startsWith('/uploads/') ? `${import.meta.env.VITE_API_URL}${subjectWithTitle.imageUrl}` : subjectWithTitle.imageUrl) : blobImg,
                                            hourlyRate: subjEntry?.hourlyRate || t.hourlyRate,
                                            profileImage: t.profileImage ? (t.profileImage.startsWith('/uploads/') ? `${import.meta.env.VITE_API_URL}${t.profileImage}` : t.profileImage) : studentsImg,
                                        }} />
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    {/* Right Column: Tutor Info Card */}
                    <div className="col-lg-4">
                        <div className="card border-0 shadow-sm rounded-4 position-sticky" style={{ 
                          top: '100px',
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(10px)'
                        }}>
                            <div className="card-body p-4 text-center">
                                <img src={avatar} alt={name} className="rounded-circle mb-2" style={{ width: '90px', height: '90px', border: '4px solid #fff', objectFit: 'cover', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}/>
                                <h5 className="fw-bold mb-0" style={{ color: '#14b8a6' }}>{name}</h5>
                                <div className="text-secondary mb-2">{tutor.education || 'BSc (Hons) in IT'}</div>
                                <div className="mb-3">
                                    <i className="bi bi-calendar3 me-2"></i>
                                    <span>Available</span>
                                </div>
                                <div className="mb-3">
                                    <i className="bi bi-geo-alt me-2"></i>
                                    <span>{location}</span>
                                </div>
                                <div className="mb-3">
                                    <i className="bi bi-currency-rupee me-2"></i>
                                    <span>Rs. {hourlyRate}/hr</span>
                                </div>
                                {/* Calendar Picker */}
                                <div className="mb-3">
                                    <label className="fw-bold mb-2" style={{ color: '#14b8a6' }}>Select Date & Time</label>
                                    <div className="d-flex align-items-start gap-3 custom-datepicker-row">
                                        {/* Date Picker */}
                                        <div className="custom-datepicker-wrapper" style={{ minWidth: 260 }}>
                                            <DatePicker
                                                selected={selectedDate}
                                                onChange={date => { setSelectedDate(date); setSelectedTime(null); }}
                                                dateFormat="MMMM d, yyyy"
                                                minDate={new Date()}
                                                className="form-control"
                                                placeholderText="Pick a date"
                                                inline
                                            />
                                        </div>
                                        {/* Time Picker */}
                                        <div className="custom-timepicker-wrapper" style={{ minWidth: 120 }}>
                                            <DatePicker
                                                selected={selectedTime}
                                                onChange={time => setSelectedTime(time)}
                                                showTimeSelect
                                                showTimeSelectOnly
                                                timeIntervals={30}
                                                timeCaption="Time"
                                                dateFormat="h:mm aa"
                                                className="form-control"
                                                placeholderText="Pick a time"
                                                disabled={!selectedDate}
                                                inline
                                            />
                                        </div>
                                    </div>
                                </div>
                                <style>{`
                                    .custom-datepicker-row { flex-wrap: nowrap; }
                                    .custom-datepicker-wrapper .react-datepicker, .custom-timepicker-wrapper .react-datepicker {
                                        background: #fff;
                                        border-radius: 1rem;
                                        box-shadow: 0 4px 24px rgba(20, 184, 166, 0.10), 0 1.5px 6px rgba(0,0,0,0.04);
                                        border: none;
                                        font-family: inherit;
                                    }
                                    .custom-datepicker-wrapper .react-datepicker__header, .custom-timepicker-wrapper .react-datepicker__header {
                                        background: #E9F8F5;
                                        border-top-left-radius: 1rem;
                                        border-top-right-radius: 1rem;
                                        border-bottom: none;
                                    }
                                    .custom-datepicker-wrapper .react-datepicker__day--selected, .custom-datepicker-wrapper .react-datepicker__day--keyboard-selected {
                                        background: #14b8a6;
                                        color: #fff;
                                        border-radius: 50%;
                                    }
                                    .custom-datepicker-wrapper .react-datepicker__day:hover {
                                        background: #0d9488;
                                        color: #fff;
                                    }
                                    .custom-timepicker-wrapper .react-datepicker__time-list-item--selected {
                                        background: #14b8a6;
                                        color: #fff;
                                    }
                                    .custom-datepicker-wrapper .react-datepicker__current-month, .custom-datepicker-wrapper .react-datepicker-time__header,
                                    .custom-timepicker-wrapper .react-datepicker__current-month, .custom-timepicker-wrapper .react-datepicker-time__header {
                                        color: #14b8a6;
                                        font-weight: bold;
                                    }
                                    .custom-datepicker-wrapper .react-datepicker__day-name, .custom-timepicker-wrapper .react-datepicker__day-name {
                                        color: #14b8a6;
                                        font-weight: 500;
                                    }
                                `}</style>
                                   <button
                                    className="btn w-100 rounded-3 fw-bold mb-2"
                                    style={{ background: '#14b8a6', color: '#fff', fontSize: 17 }}
                                    onClick={() => {
                                        let url = `/parent/book-session/${tutorId}/${selectedSubject && selectedSubject._id ? selectedSubject._id : subjectId}`;
                                        if (combinedDateTime) {
                                            url += `?datetime=${encodeURIComponent(combinedDateTime.toISOString())}`;
                                        }
                                        navigate(url);
                                    }}
                                    disabled={!combinedDateTime}
                                >
                                    Book Now
                                   </button>
                                <button className="btn w-100 rounded-3 fw-bold btn-outline-info mb-3" style={{ fontSize: 17, borderColor: '#14b8a6', color: '#14b8a6' }} onClick={() => navigate(`/parent/messages/${tutorId}`)}>Message Tutor</button>
                                {/* Weekly Availability */}
                                <div className="mt-4">
                               <h6 className="fw-bold mb-3 text-center" style={{ color: '#14b8a6' }}>Weekly Availability</h6>
                               <ul className="list-group list-group-flush">
                                        {formatAvailability(tutor.availability)}
                               </ul>
                                </div>
                           </div>
                        </div>
                    </div>
                </div>
            </main>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <Footer />
            </div>
    </div>
  );
};

function AddReviewForm({ tutorId, subjectId }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Star rating UI
    const renderStars = () => (
        <div className="mb-2">
            {[1,2,3,4,5].map(star => (
                <i
                    key={star}
                    className={`bi ${star <= rating ? 'bi-star-fill text-warning' : 'bi-star text-secondary'}`}
                    style={{ fontSize: '1.5rem', cursor: 'pointer' }}
                    onClick={() => setRating(star)}
                />
            ))}
        </div>
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(null);
        try {
            // Find a completed booking for this tutor and subject by this parent (required by backend)
            const token = localStorage.getItem('token');
            const bookingsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/parent/bookings?status=completed&limit=50`, {
                headers: { 'Authorization': token ? `Bearer ${token}` : '' },
            });
            const bookingsData = await bookingsRes.json();
            if (!bookingsData.success) throw new Error('Could not fetch bookings');
            const booking = (bookingsData.data.bookings || []).find(b => b.tutorId && b.tutorId._id === tutorId && b.subject && (b.subject._id === subjectId || b.subject === subjectId));
            if (!booking) {
                setError('You can only review tutors you have completed a session with for this subject.');
                setSubmitting(false);
                return;
            }
            // Submit review
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/parent/review`, {
                method: 'POST',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ bookingId: booking._id, rating, comment, subject: subjectId }),
            });
            const data = await res.json();
            if (data.success) {
                setSuccess('Review submitted!');
                setRating(0);
                setComment('');
            } else {
                setError(data.message || 'Could not submit review');
            }
        } catch (err) {
            setError(err.message || 'Could not submit review');
        }
        setSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            {renderStars()}
            <textarea
                className="form-control mb-2"
                rows={2}
                placeholder="Write your review..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                required
                style={{ borderColor: '#e2e8f0', borderRadius: '0.5rem' }}
            />
            {error && <div className="alert alert-danger py-1 small" style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)', borderColor: '#dc3545', color: '#dc3545' }}>{error}</div>}
            {success && <div className="alert alert-success py-1 small" style={{ backgroundColor: 'rgba(25, 135, 84, 0.1)', borderColor: '#198754', color: '#198754' }}>{success}</div>}
            <button type="submit" className="btn" style={{ backgroundColor: '#14b8a6', borderColor: '#14b8a6', color: 'white' }} disabled={submitting || rating === 0}>
                {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
        </form>
    );
}

export default ParentTutorProfile; 
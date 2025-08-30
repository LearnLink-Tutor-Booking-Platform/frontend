import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import blobImg from '../assets/images/blob.png';
import studentsImg from '../assets/images/students.png';
import groupImg from '../assets/images/Group.png';
import objectImg from '../assets/images/Object.png';
import Footer from '../components/Footer';

// Helper to check if a tutor+subject is bookmarked
function isBookmarked(bookmarks, tutorId, subjectId) {
    return bookmarks.some(b => b.tutorId && b.tutorId._id === tutorId && b.subjectId && b.subjectId._id === subjectId);
}

const TutorCard = ({ tutor, onClick, bookmarks = [], onBookmark }) => {
    // Use subject object from tutor (flattened by flattenTutorsBySubject)
    const subjectObj = tutor.subject || {};
    // Handle image URL - if it's a local upload, prepend server URL
    let subjectImage = blobImg; // default fallback
    if (subjectObj.imageUrl) {
        if (subjectObj.imageUrl.startsWith('/uploads/')) {
            subjectImage = `${import.meta.env.VITE_API_URL}${subjectObj.imageUrl}`;
        } else {
            subjectImage = subjectObj.imageUrl;
        }
    } else if (tutor.subjectImage) {
        if (tutor.subjectImage.startsWith('/uploads/')) {
            subjectImage = `${import.meta.env.VITE_API_URL}${tutor.subjectImage}`;
        } else {
            subjectImage = tutor.subjectImage;
        }
    }
    const subjectName = subjectObj.name || tutor.subjectName || 'Subject';
    // Use subject-specific hourlyRate if available
    const hourlyRate = tutor.hourlyRate !== undefined ? tutor.hourlyRate : subjectObj.hourlyRate;
    const bookmarked = isBookmarked(bookmarks, tutor._id, subjectObj._id);
    return (
        <div className="card tutor-card shadow-sm border-0 rounded-4 mb-3" style={{ cursor: 'pointer', minWidth: 320, maxWidth: 350 }}>
            <div style={{ position: 'relative', height: '120px', overflow: 'hidden', borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }} onClick={onClick}>
                <img
                    src={subjectImage}
                    alt="Subject"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span
                    style={{ position: 'absolute', top: 12, right: 16, background: 'rgba(255,255,255,0.8)', borderRadius: '50%', padding: 6, zIndex: 2, cursor: 'pointer' }}
                    onClick={e => { e.stopPropagation(); onBookmark && onBookmark(tutor._id, subjectObj._id); }}
                >
                    <i className={`bi ${bookmarked ? 'bi-bookmark-fill' : 'bi-bookmark'}`} style={{ fontSize: 22, color: '#2DB8A1' }}></i>
                </span>
                <img
                    src={tutor.profileImage ? (tutor.profileImage.startsWith('/uploads/') ? `${import.meta.env.VITE_API_URL}${tutor.profileImage}` : tutor.profileImage) : studentsImg}
                    alt={tutor.name}
                    className="rounded-circle"
                    style={{ width: 64, height: 64, border: '3px solid #fff', position: 'absolute', left: 20, bottom: -32, objectFit: 'cover', background: '#fff' }}
                />
            </div>
            <div className="card-body pt-5 pb-3 px-4">
                <div className="text-uppercase text-info fw-bold text-center mb-1" style={{ fontSize: 15 }}>
                    {subjectName}
                </div>
                <div className="fw-bold text-center mb-1" style={{ fontSize: 20, color: '#222' }}>{tutor.name || 'Tutor Name goes here'}</div>
                <div className="text-secondary small mb-1" style={{ marginTop: 8 }}>{tutor.education || 'BSc (Hons) in IT'}</div>
                <div className="fw-bold mb-2" style={{ fontSize: 17 }}>{tutor.description || 'Online Mathematics classes for students island wide'}</div>
                <div className="d-flex align-items-center mb-2" style={{ gap: 8 }}>
                    <i className="bi bi-star-fill" style={{ color: '#FFD700', fontSize: 18 }}></i>
                    <span className="fw-semibold" style={{ fontSize: 15 }}>{tutor.rating || '4.5'}</span>
                    <span className="text-secondary small">({tutor.totalReviews || '10'})</span>
                </div>
                <div className="d-flex align-items-center mb-2" style={{ gap: 8 }}>
                    <i className="bi bi-geo-alt" style={{ color: '#2DB8A1', fontSize: 16 }}></i>
                    <span className="text-secondary small">{tutor.location || 'Galle, Colombo, Moratuwa, Nugegoda'}</span>
                </div>
                <div className="d-flex align-items-center mb-3" style={{ gap: 8 }}>
                    <i className="bi bi-currency-rupee" style={{ color: '#2DB8A1', fontSize: 16 }}></i>
                    <span className="text-secondary small">Rs. {hourlyRate || '2500'}/hr</span>
                </div>
                <button className="btn w-100 rounded-3 fw-bold" style={{ background: '#2DE1C2', color: '#fff', fontSize: 17 }} onClick={onClick}>Book Now</button>
            </div>
        </div>
    );
};

const ParentBookmarks = () => {
    const navigate = useNavigate();
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookmarks = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/parent/bookmarks`, {
                    headers: { 'Authorization': token ? `Bearer ${token}` : '' },
                });
                const data = await res.json();
                if (data.success) setBookmarks(data.data || []);
            } catch (err) {}
            setLoading(false);
        };
        fetchBookmarks();
    }, []);

    const handleBookmark = async (tutorId, subjectId) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`${import.meta.env.VITE_API_URL}/api/parent/bookmark`, {
                method: 'POST',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tutorId, subjectId })
            });
            // Refresh bookmarks
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/parent/bookmarks`, {
                headers: { 'Authorization': token ? `Bearer ${token}` : '' },
            });
            const data = await res.json();
            if (data.success) setBookmarks(data.data || []);
        } catch (err) {}
    };

    if (loading) return <div className="d-flex justify-content-center p-5"><div className="spinner-border" style={{color: '#2DB8A1'}} role="status"><span className="visually-hidden">Loading...</span></div></div>;

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
            <div className="container py-5">
              <div className="card border-0 shadow-sm rounded-4 mb-4" style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)'
              }}>
                <div className="card-body p-4">
                  <h2 className="fw-bold fs-3 mb-4 text-center" style={{ color: '#14b8a6' }}>
                    <i className="bi bi-bookmark-star me-2"></i>
                    My Bookmarked Tutors
                  </h2>
                </div>
              </div>
              
              {(!bookmarks || bookmarks.length === 0) ? (
                <div className="card border-0 shadow-sm rounded-4" style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div className="card-body p-4">
                    <div className="alert alert-info text-center" style={{ backgroundColor: 'rgba(20, 184, 166, 0.1)', borderColor: '#14b8a6', color: '#14b8a6' }}>No bookmarked tutors yet.</div>
                  </div>
                </div>
              ) : (
                <div className="d-flex flex-wrap gap-4 justify-content-center">
                    {bookmarks.map((b, i) => {
                        const tutor = b.tutorId;
                        const subject = b.subjectId;
                        if (!tutor || !subject) return null;
                        // Find the subject entry for this subjectId to get the title
                        const subjectEntry = (tutor.subjects || []).find(s => s.subject && (s.subject._id === subject._id));
                        const subjectWithTitle = { ...subject, title: subjectEntry?.title };
                        return (
                            <div key={`${tutor._id}-${subject._id || i}`} style={{ flex: '0 0 285px' }}>
                                <TutorCard 
                                    tutor={{ 
                                        ...tutor, 
                                        subject: subjectWithTitle, 
                                        subjectId: subject._id, 
                                        subjectImage: subject.imageUrl ? (subject.imageUrl.startsWith('/uploads/') ? `${import.meta.env.VITE_API_URL}${subject.imageUrl}` : subject.imageUrl) : null, 
                                        hourlyRate: subjectEntry?.hourlyRate 
                                    }} 
                                    onClick={() => navigate(`/parent/tutor/${tutor._id}/subject/${subject._id}`)} 
                                    bookmarks={bookmarks} 
                                    onBookmark={handleBookmark} 
                                />
                            </div>
                        );
                    })}
                </div>
              )}
            </div>

            <div style={{ position: 'relative', zIndex: 2 }}>
              <Footer />
            </div>
          </div>
        </div>
    );
};

export default ParentBookmarks; 
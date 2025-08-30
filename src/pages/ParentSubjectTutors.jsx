import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import blobImg from '../assets/images/blob.png';
import studentsImg from '../assets/images/students.png';

const API_URL = `${import.meta.env.VITE_API_URL}/api/parent/search-tutors`;
const SUBJECTS_API = `${import.meta.env.VITE_API_URL}/api/tutor/subjects/all`;

// Helper to check if a tutor+subject is bookmarked
function isBookmarked(bookmarks, tutorId, subjectId) {
    return bookmarks.some(b => b.tutorId && b.tutorId._id === tutorId && b.subjectId && b.subjectId._id === subjectId);
}

const TutorCard = ({ tutor, subject, onClick, bookmarks = [], onBookmark }) => {
  // Use the subject prop passed from parent, or fallback to tutor.subject
  let subjectObj = subject || tutor.subject || {};
  // Handle image URL - if it's a local upload, prepend server URL
  let subjectImage = blobImg; // default fallback
  if (subjectObj?.imageUrl) {
    if (subjectObj.imageUrl.startsWith('/uploads/')) {
      subjectImage = `${import.meta.env.VITE_API_URL}${subjectObj.imageUrl}`;
    } else {
      subjectImage = subjectObj.imageUrl;
    }
  }
  
  // Debug logging
  console.log('Subject object:', subjectObj);
  console.log('Subject image URL:', subjectImage);
  
  const subjectName = subjectObj.name || tutor.subjectName || 'Subject';
  // Use subject-specific hourlyRate if available
  const hourlyRate = tutor.hourlyRate !== undefined ? tutor.hourlyRate : subjectObj.hourlyRate;
  const bookmarked = isBookmarked(bookmarks, tutor._id, subjectObj._id);
  
  // Get title from tutor's subjects array
  let title = 'No title provided';
  if (tutor.subjects && subjectObj) {
    // Find the subject entry for this subjectId to get the title
    const subjectEntry = tutor.subjects.find(s =>
      (s.subject && (s.subject._id === subjectObj._id || s.subject === subjectObj._id))
    );
    if (subjectEntry) {
      title = subjectEntry.title;
    }
  }
  return (
    <div className="card tutor-card shadow-sm border-0 rounded-4 mb-3" style={{ cursor: 'pointer', minWidth: 320, maxWidth: 350 }} onClick={onClick}>
      {/* Subject Image Banner */}
      <div style={{ position: 'relative', height: '120px', overflow: 'hidden', borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }}>
        <img
          src={subjectImage}
          alt="Subject"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            console.log('Image failed to load:', subjectImage);
            e.target.src = blobImg; // Fallback to default image
          }}
        />
        {/* Bookmark icon */}
        <span 
          style={{ position: 'absolute', top: 12, right: 16, background: 'rgba(255,255,255,0.8)', borderRadius: '50%', padding: 6, zIndex: 2, cursor: 'pointer' }}
          onClick={e => { e.stopPropagation(); onBookmark && onBookmark(tutor._id, subjectObj._id); }}
        >
          <i className={`bi ${bookmarked ? 'bi-bookmark-fill' : 'bi-bookmark'}`} style={{ fontSize: 22, color: '#2DB8A1' }}></i>
        </span>
        {/* Tutor profile image */}
        <img 
          src={tutor.profileImage ? (tutor.profileImage.startsWith('/uploads/') ? `${import.meta.env.VITE_API_URL}${tutor.profileImage}` : tutor.profileImage) : studentsImg}
          alt={tutor.name} 
          className="rounded-circle"
          style={{ width: 64, height: 64, border: '3px solid #fff', position: 'absolute', left: 20, bottom: -32, objectFit: 'cover', background: '#fff' }}
        />
      </div>
      <div className="card-body pt-5 pb-3 px-4">
        {/* Subject Name */}
        <div className="text-uppercase text-info fw-bold text-center mb-1" style={{ fontSize: 15 }}>
          {subjectName}
        </div>
        {/* Tutor Name - now prominent and centered */}
        <div className="fw-bold text-center mb-1" style={{ fontSize: 20, color: '#222' }}>{tutor.name || 'Tutor Name goes here'}</div>
        <div className="text-secondary small mb-1" style={{ marginTop: 8 }}>{tutor.education || 'BSc (Hons) in IT'}</div>
        <div className="fw-bold mb-2" style={{ fontSize: 17 }}>{title}</div>
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
        <button className="btn w-100 rounded-3 fw-bold" style={{ background: '#2DE1C2', color: '#fff', fontSize: 17 }}>Book Now</button>
    </div>
  </div>
);
};

const ParentSubjectTutors = () => {
  const { subjectId } = useParams();
  const [subject, setSubject] = useState(null);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const navigate = useNavigate();

  // Fetch bookmarks
  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/parent/bookmarks`, {
          headers: { 'Authorization': token ? `Bearer ${token}` : '' },
        });
        const data = await res.json();
        if (data.success) setBookmarks(data.data || []);
      } catch (err) {}
    };
    fetchBookmarks();
  }, []);

  useEffect(() => {
    const fetchSubjectAndTutors = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all subjects to get the subject name and image
        const subjectsRes = await fetch(SUBJECTS_API);
        const subjectsData = await subjectsRes.json();
        if (!subjectsData.success) throw new Error('Failed to load subject');
        const found = subjectsData.data.subjects.find(s => s._id === subjectId);
        setSubject(found);
        if (!found) throw new Error('Subject not found');
        // Fetch tutors for this subject
        const params = new URLSearchParams();
        params.append('filterType', 'subject');
        params.append('subject', found._id);
        params.append('limit', 50);
        const token = localStorage.getItem('token');
        const tutorsRes = await fetch(`${API_URL}?${params.toString()}`, {
          headers: { 'Authorization': token ? `Bearer ${token}` : '' },
        });
        const tutorsData = await tutorsRes.json();
        if (tutorsData.success) {
          setTutors(tutorsData.data.tutors);
        } else {
          setError(tutorsData.message || 'Failed to fetch tutors');
        }
      } catch (err) {
        setError(err.message || 'Failed to load data');
      }
      setLoading(false);
    };
    fetchSubjectAndTutors();
  }, [subjectId]);

  // Toggle bookmark
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

  // Go to tutor profile
  const goToProfile = (tutorId) => {
    navigate(`/parent/tutor/${tutorId}`);
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <main className="container my-5">
        {subject && (
          <div className="text-center mb-5">
            <img 
              src={subject.imageUrl ? (subject.imageUrl.startsWith('/uploads/') ? `${import.meta.env.VITE_API_URL}${subject.imageUrl}` : subject.imageUrl) : 'https://via.placeholder.com/100x100?text=Subject'} 
              alt={subject.name} 
              className="rounded-circle mb-3" 
              style={{width: 100, height: 100, objectFit: 'cover', border: '4px solid #E9F8F5'}} 
            />
            <h2 className="fw-bold mb-1">{subject.name}</h2>
            <p className="text-secondary">Find tutors for <b>{subject.name}</b></p>
          </div>
        )}
        <section className="mb-5">
          <h3 className="fw-bold mb-3">Tutors for {subject?.name}</h3>
          {loading ? (
            <div className="d-flex justify-content-center align-items-center" style={{minHeight: 200}}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger text-center">{error}</div>
          ) : (
            <div className="row g-4">
              {tutors.length === 0 && <div className="text-secondary text-center">No tutors found for this subject.</div>}
              {tutors.map(tutor => (
                <div className="col-md-4" key={tutor._id}>
                  <TutorCard 
                    tutor={tutor} 
                    subject={subject} 
                    onClick={() => goToProfile(tutor._id)}
                    bookmarks={bookmarks}
                    onBookmark={handleBookmark}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ParentSubjectTutors; 
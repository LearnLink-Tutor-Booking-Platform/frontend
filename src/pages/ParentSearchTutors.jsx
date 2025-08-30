import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import blobImg from '../assets/images/blob.png';
import studentsImg from '../assets/images/students.png';
import groupImg from '../assets/images/Group.png';
import objectImg from '../assets/images/Object.png';
import Footer from '../components/Footer';

const API_URL = `${import.meta.env.VITE_API_URL}/api/parent/search-tutors`;

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
    
    // Handle profile image URL - if it's a local upload, prepend server URL
    let profileImage = studentsImg; // default fallback
    if (tutor.profileImage) {
        if (tutor.profileImage.startsWith('/uploads/')) {
            profileImage = `${import.meta.env.VITE_API_URL}${tutor.profileImage}`;
        } else {
            profileImage = tutor.profileImage;
        }
    }
    
    const subjectName = subjectObj.name || tutor.subjectName || 'Subject';
    // Use subject-specific hourlyRate if available
    const hourlyRate = tutor.hourlyRate !== undefined ? tutor.hourlyRate : subjectObj.hourlyRate;
    const bookmarked = isBookmarked(bookmarks, tutor._id, subjectObj._id);
    return (
        <div className="card tutor-card shadow-sm border-0 rounded-4 mb-3" style={{ cursor: 'pointer', minWidth: 320, maxWidth: 350 }} onClick={onClick}>
            {/* Subject Image Banner */}
            <div style={{ position: 'relative', height: '120px', overflow: 'hidden', borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }}>
                <img
                    src={subjectImage}
                    alt="Subject"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
                    src={profileImage}
                    alt={tutor.name} 
                    className="rounded-circle"
                    style={{ width: 64, height: 64, border: '3px solid #fff', position: 'absolute', left: 20, bottom: -10, objectFit: 'cover', background: '#fff' }}
                />
            </div>
            <div className="card-body pt-7 pb-3 px-4">
                {/* Subject Name */}
                <div className="text-uppercase text-info fw-bold text-center mb-1" style={{ fontSize: 15 }}>
                    {subjectName}
                </div>
                {/* Tutor Name - now prominent and centered */}
                <div className="fw-bold text-center mb-1" style={{ fontSize: 20, color: '#222' }}>{tutor.name || 'Tutor Name goes here'}</div>
                <div className="text-secondary small mb-1" style={{ marginTop: 8 }}>{tutor.education || 'BSc (Hons) in IT'}</div>
                <div className="fw-bold mb-2" style={{ fontSize: 17 }}>{subjectObj.title || 'No title provided'}</div>
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

const ParentSearchTutors = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ 
    name: '', 
    subject: '', 
    location: '', 
    rating: '', 
    minRate: '', 
    maxRate: '' 
  });
  const [rateRange, setRateRange] = useState([0, 20000]);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [locations, setLocations] = useState([]);

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

  // Fetch subjects and locations for filters
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [subjectsRes, tutorsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/subjects`, { headers: { 'Authorization': token ? `Bearer ${token}` : '' } }),
          fetch(`${API_URL}?limit=100`, { headers: { 'Authorization': token ? `Bearer ${token}` : '' } })
        ]);
        
        const subjectsData = await subjectsRes.json();
        const tutorsData = await tutorsRes.json();
        
        if (subjectsData.success) {
          setSubjects(subjectsData.data.subjects || []);
        }
        
        if (tutorsData.success) {
          const locs = Array.from(new Set(tutorsData.data.tutors.map(t => t.location).filter(Boolean)));
          setLocations(locs);
        }
      } catch (err) {}
    };
    fetchFilterData();
  }, []);

  const fetchTutors = async (paramsObj = {}) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      Object.entries(paramsObj).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      params.append('limit', 50); // Always fetch up to 50 tutors
      const res = await fetch(`${API_URL}?${params.toString()}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      console.log('Tutor search API response:', data); // Debug log
      if (data.success) {
        setTutors(data.data.tutors);
      } else {
        setError(data.message || 'Failed to fetch tutors');
      }
    } catch (err) {
      setError('Failed to fetch tutors');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTutors(); // Load all tutors on mount
  }, []);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleRateRangeChange = (newRange) => {
    setRateRange(newRange);
    setFilters({
      ...filters,
      minRate: newRange[0].toString(),
      maxRate: newRange[1].toString()
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    fetchTutors(filters);
  };

  // Flatten tutors to one card per tutor+subject
  const flattenTutorsBySubject = (tutors) => {
    const cards = [];
    tutors.forEach(tutor => {
      if (tutor.subjects && tutor.subjects.length > 0) {
        tutor.subjects.forEach(subjectEntry => {
          // subjectEntry is { subject, hours, hourlyRate, title }
          const subject = {
            ...(subjectEntry.subject || {}),
            title: subjectEntry.title // merge the title from the entry
          };
          cards.push({
            ...tutor,
            subject,
            subjectId: subject._id || subject.id,
            subjectImage: subject.imageUrl,
            hourlyRate: subjectEntry.hourlyRate // subject-specific rate
          });
        });
      }
    });
    return cards;
  };

  const goToProfile = (tutorId, subjectId) => navigate(`/parent/tutor/${tutorId}/subject/${subjectId}`);

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
        <main className="container my-4">
          {/* Search Form */}
          <section className="text-center py-5 mb-4 rounded-4" style={{ 
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(20, 184, 166, 0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background Images for the card */}
            <img src={groupImg} alt="clouds" style={{ 
              position: 'absolute', 
              top: 10, 
              left: 10, 
              width: '120px', 
              height: 'auto',
              opacity: 0.4,
              zIndex: 0,
              pointerEvents: 'none'
            }} />
            <img src={objectImg} alt="buildings" style={{ 
              position: 'absolute', 
              bottom: 10, 
              right: 10, 
              width: '100px', 
              height: 'auto',
              opacity: 0.3,
              zIndex: 0,
              pointerEvents: 'none'
            }} />
            
            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
              <h1 className="display-5 fw-bold" style={{ color: '#14b8a6' }}>Search Tutors</h1>
              <p className="lead col-lg-8 mx-auto" style={{ color: '#666' }}>Find the perfect tutor for your child's learning needs.</p>
              <form onSubmit={handleSubmit} className="mt-4">
                <div className="row justify-content-center mb-3">
                  <div className="col-md-8 col-12">
                    <input 
                      type="text" 
                      className="form-control form-control-lg" 
                      name="name"
                      placeholder="Search by tutor name..." 
                      value={filters.name} 
                      onChange={handleChange} 
                      style={{ 
                        borderRadius: 12, 
                        fontSize: 20,
                        border: '2px solid #e2e8f0',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)'
                      }} 
                    />
                  </div>
                </div>
                <div className="row justify-content-center align-items-end g-3">
                  <div className="col-md-2 col-6">
                    <select 
                      className="form-select" 
                      name="location"
                      value={filters.location} 
                      onChange={handleChange} 
                      style={{
                        border: '2px solid #e2e8f0',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)'
                      }}
                    >
                      <option value="">Location</option>
                      {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                    </select>
                  </div>
                  <div className="col-md-2 col-6">
                    <select 
                      className="form-select" 
                      name="subject"
                      value={filters.subject} 
                      onChange={handleChange} 
                      style={{
                        border: '2px solid #e2e8f0',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)'
                      }}
                    >
                      <option value="">Subject</option>
                      {subjects.map(subj => <option key={subj._id} value={subj._id}>{subj.name}</option>)}
                    </select>
                  </div>
                  <div className="col-md-2 col-6">
                    <select 
                      className="form-select" 
                      name="rating"
                      value={filters.rating} 
                      onChange={handleChange} 
                      style={{
                        border: '2px solid #e2e8f0',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)'
                      }}
                    >
                      <option value="">Min rating</option>
                      {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Star{r>1 && 's'} & up</option>)}
                    </select>
                  </div>
                  <div className="col-md-3 col-12">
                    <div className="mb-2">
                      <label className="form-label fw-bold" style={{ color: '#14b8a6', fontSize: '14px' }}>
                        Hourly Rate Range: Rs. {rateRange[0]} - Rs. {rateRange[1]}
                      </label>
                    </div>
                    <div className="range-slider-container" style={{ position: 'relative', padding: '10px 0', height: '40px' }}>
                      {/* Background track */}
                      <div style={{
                        position: 'absolute',
                        width: '100%',
                        height: '6px',
                        background: '#e2e8f0',
                        borderRadius: '3px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 1
                      }}></div>
                      
                      {/* Active range track */}
                      <div style={{
                        position: 'absolute',
                        height: '6px',
                        background: '#14b8a6',
                        borderRadius: '3px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        left: `${(rateRange[0] / 20000) * 100}%`,
                        right: `${100 - (rateRange[1] / 20000) * 100}%`,
                        zIndex: 1
                      }}></div>
                      
                      {/* Min range input - left side only */}
                      <input
                        type="range"
                        min="0"
                        max="20000"
                        step="100"
                        value={rateRange[0]}
                        onChange={(e) => {
                          const newMin = parseInt(e.target.value);
                          const newMax = Math.max(newMin, rateRange[1]);
                          handleRateRangeChange([newMin, newMax]);
                        }}
                        style={{
                          position: 'absolute',
                          width: `${(rateRange[1] / 20000) * 100}%`,
                          height: '40px',
                          background: 'transparent',
                          appearance: 'none',
                          zIndex: 2,
                          top: 0,
                          left: 0,
                          margin: 0,
                          padding: 0
                        }}
                      />
                      
                      {/* Max range input - right side only */}
                      <input
                        type="range"
                        min="0"
                        max="20000"
                        step="100"
                        value={rateRange[1]}
                        onChange={(e) => {
                          const newMax = parseInt(e.target.value);
                          const newMin = Math.min(rateRange[0], newMax);
                          handleRateRangeChange([newMin, newMax]);
                        }}
                        style={{
                          position: 'absolute',
                          width: `${100 - (rateRange[0] / 20000) * 100}%`,
                          height: '40px',
                          background: 'transparent',
                          appearance: 'none',
                          zIndex: 2,
                          top: 0,
                          left: `${(rateRange[0] / 20000) * 100}%`,
                          margin: 0,
                          padding: 0
                        }}
                      />
                    </div>
                  </div>
                  <div className="col-md-3 col-12">
                    <button 
                      className="btn w-100 fw-bold py-2" 
                      type="submit" 
                      style={{ 
                        backgroundColor: '#14b8a6', 
                        color: '#fff', 
                        borderRadius: 8, 
                        fontSize: 18,
                        border: 'none'
                      }}
                    >
                      Search
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </section>

          {/* Results Section */}
          {loading ? (
            <div className="d-flex justify-content-center p-5">
              <div className="spinner-border" style={{color: '#14b8a6'}} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger text-center" style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)', borderColor: '#dc3545', color: '#dc3545' }}>{error}</div>
          ) : (
            <section className="py-4">
              <div className="card border-0 shadow-sm rounded-4" style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)'
              }}>
                <div className="card-body p-4">
                  <h2 className="fw-bold fs-4 mb-3" style={{ color: '#14b8a6' }}>
                    Search Results ({flattenTutorsBySubject(tutors).length} tutors found)
                  </h2>
                  {flattenTutorsBySubject(tutors).length === 0 ? (
                    <div className="text-secondary text-center p-5">No tutors found matching your criteria. Try adjusting your filters.</div>
                  ) : (
                    <div 
                      className="d-flex overflow-auto pb-3 horizontal-scroll-container" 
                      style={{ 
                        gap: 24
                      }}
                      onMouseDown={(e) => {
                        const scrollRef = e.currentTarget;
                        const isDragging = true;
                        const startX = e.pageX - scrollRef.offsetLeft;
                        const scrollLeft = scrollRef.scrollLeft;
                        scrollRef.style.cursor = 'grabbing';
                        
                        const handleMouseMove = (e) => {
                          if (!isDragging) return;
                          e.preventDefault();
                          const x = e.pageX - scrollRef.offsetLeft;
                          const walk = (x - startX) * 2;
                          scrollRef.scrollLeft = scrollLeft - walk;
                        };
                        
                        const handleMouseUp = () => {
                          scrollRef.style.cursor = 'grab';
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                    >
                      {flattenTutorsBySubject(tutors).map((tutor, i) => (
                        <div key={`${tutor._id}-${tutor.subject?._id || tutor.subjectId || i}`} style={{ flex: '0 0 285px' }}>
                          <TutorCard 
                            tutor={tutor} 
                            onClick={() => goToProfile(tutor._id, tutor.subject?._id)} 
                            bookmarks={bookmarks} 
                            onBookmark={handleBookmark} 
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </main>

        <Footer />

        <style>{`
          .tutor-card { 
            min-width: 250px; 
            max-width: 100%;
            width: 100%;
          }
          .tutor-card:hover { 
            transform: translateY(-5px); 
            transition: all 0.2s ease-in-out; 
            box-shadow: 0 0.5rem 1rem rgba(0,0,0,.15)!important; 
          }
          .overflow-auto::-webkit-scrollbar { display: none; }
          .btn-outline-info:hover { background-color: #2DB8A1; border-color: #2DB8A1; color: white !important; }
          
          /* Range slider styles */
          .range-slider-container input[type="range"] {
            -webkit-appearance: none;
            appearance: none;
            background: transparent;
            cursor: pointer;
            pointer-events: auto;
            outline: none;
            border: none;
          }
          
          .range-slider-container input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #14b8a6;
            border: 2px solid #fff;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            cursor: pointer;
            transition: all 0.2s ease;
            pointer-events: auto;
            margin-top: -7px;
          }
          
          .range-slider-container input[type="range"]::-webkit-slider-thumb:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          }
          
          .range-slider-container input[type="range"]::-moz-range-thumb {
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #14b8a6;
            border: 2px solid #fff;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            cursor: pointer;
            transition: all 0.2s ease;
            pointer-events: auto;
          }
          
          .range-slider-container input[type="range"]::-moz-range-thumb:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          }
          
          .range-slider-container input[type="range"]::-webkit-slider-track {
            background: transparent;
            height: 6px;
            border-radius: 3px;
            pointer-events: none;
            border: none;
          }
          
          .range-slider-container input[type="range"]::-moz-range-track {
            background: transparent;
            height: 6px;
            border-radius: 3px;
            pointer-events: none;
            border: none;
          }
          
          /* Ensure cards don't overflow on smaller screens */
          @media (max-width: 768px) {
            .tutor-card {
              min-width: 280px;
              max-width: 320px;
            }
          }
          
          /* Horizontal scroll improvements */
          .horizontal-scroll-container {
            scrollbar-width: none;
            -ms-overflow-style: none;
            cursor: grab;
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
          }
          
          .horizontal-scroll-container::-webkit-scrollbar {
            display: none;
          }
          
          .horizontal-scroll-container:active {
            cursor: grabbing;
          }
          
          .horizontal-scroll-container * {
            pointer-events: none;
          }
          
          .horizontal-scroll-container .tutor-card {
            pointer-events: auto;
          }
          
          /* Allow pointer events on buttons and interactive elements */
          .horizontal-scroll-container button,
          .horizontal-scroll-container .btn,
          .horizontal-scroll-container .bookmark-icon,
          .horizontal-scroll-container input,
          .horizontal-scroll-container select,
          .horizontal-scroll-container a {
            pointer-events: auto !important;
          }
        `}</style>
      </div>
    </div>
  );
};

export default ParentSearchTutors; 
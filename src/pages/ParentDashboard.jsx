import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import blobImg from '../assets/images/blob.png';
import studentsImg from '../assets/images/students.png';
import groupImg from '../assets/images/Group.png';
import objectImg from '../assets/images/Object.png';
import Footer from '../components/Footer';


// --- REUSABLE UI COMPONENTS (FROM PREVIOUS RESPONSE, NO CHANGES) ---

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
    
    const handleBookmarkClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        if (onBookmark) {
            onBookmark(tutor._id, subjectObj._id);
        }
    };
    
    return (
        <div className="card tutor-card shadow-sm border-0 rounded-4 mb-3" style={{ cursor: 'default', minWidth: 320, maxWidth: 350 }}>
            {/* Subject Image Banner */}
            <div style={{ position: 'relative', height: '120px', overflow: 'hidden', borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }}>
                <img
                    src={subjectImage}
                    alt="Subject"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {/* Bookmark icon */}
                <div
                    className="bookmark-icon"
                    style={{ position: 'absolute', top: 12, right: 16, background: 'rgba(255,255,255,0.8)', borderRadius: '50%', padding: 6, zIndex: 2, cursor: 'pointer' }}
                    onClick={handleBookmarkClick}
                >
                    <i 
                        className={`bi ${bookmarked ? 'bi-bookmark-fill' : 'bi-bookmark'}`} 
                        style={{ fontSize: 22, color: '#2DB8A1' }}
                    ></i>
                </div>
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
                    <span className="fw-semibold" style={{ fontSize: 15 }}>{tutor.rating || '0'}</span>
                    <span className="text-secondary small">({tutor.totalReviews || '0'})</span>
                </div>
                <div className="d-flex align-items-center mb-2" style={{ gap: 8 }}>
                    <i className="bi bi-geo-alt" style={{ color: '#2DB8A1', fontSize: 16 }}></i>
                    <span className="text-secondary small">{tutor.location || 'Galle, Colombo, Moratuwa, Nugegoda'}</span>
                </div>
                <div className="d-flex align-items-center mb-3" style={{ gap: 8 }}>
                    <i className="bi bi-currency-rupee" style={{ color: '#2DB8A1', fontSize: 16 }}></i>
                    <span className="text-secondary small">Rs. {hourlyRate || '2500'}/hr</span>
                </div>
                <button 
                    className="btn w-100 rounded-3 fw-bold" 
                    style={{ 
                        background: '#2DE1C2', 
                        color: '#fff', 
                        fontSize: 17, 
                        cursor: 'pointer',
                        position: 'relative',
                        zIndex: 10,
                        pointerEvents: 'auto'
                    }}
                    onClick={() => {
                        if (onClick) {
                            onClick();
                        }
                    }}
                >
                    Book Now
                </button>
            </div>
        </div>
    );
};

const SubjectCategoryCard = ({ subject, onClick, tutorsCount }) => {
    // Handle image URL - if it's a local upload, prepend server URL
    let subjectImage = blobImg; // default fallback
    if (subject.imageUrl) {
        if (subject.imageUrl.startsWith('/uploads/')) {
            subjectImage = `${import.meta.env.VITE_API_URL}${subject.imageUrl}`;
        } else {
            subjectImage = subject.imageUrl;
        }
    }
    
    return (
        <div className="col-md-2 col-6 mb-4">
            <div className="card subject-category-card text-center p-0 rounded-3 border-0 shadow-sm h-100" style={{ cursor: 'pointer', overflow: 'hidden' }} onClick={onClick}>
                {/* Subject image as a wide banner */}
                <div style={{ width: '100%', height: 80, background: '#f2f2f2', position: 'relative' }}>
                    <img
                        src={subjectImage}
                        alt={subject.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>
                <div className="p-3">
                <h6 className="fw-bold mb-1">{subject.name}</h6>
                    <small className="text-secondary">{tutorsCount} Tutors</small>
                </div>
            </div>
        </div>
    );
};

const HorizontalScroll = ({ children, title, showSeeAllButton = true, seeAllLink = "/parent/search-tutors" }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const scrollRef = useRef(null);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
        scrollRef.current.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        scrollRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        scrollRef.current.style.cursor = 'grab';
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
        scrollRef.current.style.cursor = 'grab';
    };

    return (
        <section className="py-4">
            <div className="card border-0 shadow-sm rounded-4" style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)'
            }}>
                <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h2 className="fw-bold fs-4 mb-0" style={{ color: '#14b8a6' }}>{title}</h2>
                        {showSeeAllButton && (
                            <Link to={seeAllLink} className="btn btn-outline-primary btn-sm" style={{ borderColor: '#14b8a6', color: '#14b8a6' }}>
                                See All Tutors
                            </Link>
                        )}
                    </div>
                    <div 
                        ref={scrollRef}
                        className="d-flex overflow-auto pb-3 horizontal-scroll-container" 
                        style={{ 
                            gap: 24
                        }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
                    >
                        {children}
                    </div>
                </div>
            </div>
        </section>
    );
};


// --- MAIN PARENT DASHBOARD COMPONENT ---

const ParentDashboard = ({ user }) => {
    const navigate = useNavigate();

    // --- STATE MANAGEMENT ---
    // Multi-filter state
    const [filterName, setFilterName] = useState('');
    const [filterLocation, setFilterLocation] = useState('');
    const [filterSubject, setFilterSubject] = useState('');
    const [filterRating, setFilterRating] = useState('');
    const [minRate, setMinRate] = useState('');
    const [maxRate, setMaxRate] = useState('');
    const [rateRange, setRateRange] = useState([0, 20000]);
    const [searchedTutors, setSearchedTutors] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);

    // State for UI content (Carousels, Categories)
    const [carouselTutors, setCarouselTutors] = useState([]);
    const [recommendedTutors, setRecommendedTutors] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [locations, setLocations] = useState([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [initialError, setInitialError] = useState(null);
    const [recentlyVisited, setRecentlyVisited] = useState([]);
    const [latestTutors, setLatestTutors] = useState([]);
    const [topTutors, setTopTutors] = useState([]);
    const [bookmarks, setBookmarks] = useState([]);

    // API endpoints
    const API_URL = `${import.meta.env.VITE_API_URL}/api/parent/search-tutors`;
    const SUBJECTS_API = `${import.meta.env.VITE_API_URL}/api/subjects`;

    // Google Calendar connect handler
    const [googleConnected, setGoogleConnected] = useState(false);
    useEffect(() => {
        if (user && user.googleAccessToken && user.googleRefreshToken) {
            setGoogleConnected(true);
        } else {
            setGoogleConnected(false);
        }
    }, [user]);

    // --- DATA FETCHING ---

    // Effect for fetching INITIAL content (carousels, subjects, locations)
    useEffect(() => {
        const fetchInitialData = async () => {
            setInitialLoading(true);
            setInitialError(null);
            try {
                const token = localStorage.getItem('token');
                const headers = { 'Authorization': token ? `Bearer ${token}` : '' };

                const [dashboardRes, subjectsRes, latestRes, topRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL}/api/parent/dashboard`, { headers }),
                    fetch(SUBJECTS_API, { headers }),
                    fetch(`${import.meta.env.VITE_API_URL}/api/parent/search-tutors?limit=4&sortBy=date`, { headers }),
                    fetch(`${import.meta.env.VITE_API_URL}/api/parent/search-tutors?limit=4&sortBy=rating`, { headers })
                ]);

                const dashboardData = await dashboardRes.json();
                const subjectsData = await subjectsRes.json();
                const latestData = await latestRes.json();
                const topData = await topRes.json();

                if (dashboardData.success) {
                    const allTutors = dashboardData.data.recommendedTutors || [];
                    setCarouselTutors(allTutors);
                    setRecommendedTutors(allTutors);
                    setRecentlyVisited(dashboardData.data.recentlyVisited || []);
                    const locs = Array.from(new Set(allTutors.map(t => t.location).filter(Boolean)));
                    setLocations(locs);
                } else {
                    setInitialError(dashboardData.message || 'Failed to fetch dashboard.');
                }

                if (subjectsData.success) {
                    setSubjects(subjectsData.data.subjects || []);
                } else {
                    if (!initialError) setInitialError(subjectsData.message || 'Failed to fetch subjects.');
                }
                if (latestData.success) {
                    setLatestTutors(latestData.data.tutors || []);
                }
                if (topData.success) {
                    setTopTutors(topData.data.tutors || []);
                }
            } catch (err) {
                setInitialError('An error occurred while fetching initial data.');
            }
            setInitialLoading(false);
        };
        fetchInitialData();
    }, []);

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

    // --- MULTI-FILTER SEARCH HANDLER ---
    const handleSearch = async (e) => {
        if (e) e.preventDefault();
            setIsSearching(true);
            setSearchError(null);
            try {
                const token = localStorage.getItem('token');
                const params = new URLSearchParams();
            if (filterName) params.append('name', filterName);
            if (filterLocation) params.append('location', filterLocation);
            if (filterSubject) params.append('subject', filterSubject);
            if (filterRating) params.append('rating', filterRating);
                    if (minRate) params.append('minRate', minRate);
                    if (maxRate) params.append('maxRate', maxRate);
                params.append('limit', 50);
                const res = await fetch(`${API_URL}?${params.toString()}`, {
                    headers: { 'Authorization': token ? `Bearer ${token}` : '' },
                });
                const data = await res.json();
                if (data.success) {
                    setSearchedTutors(data.data.tutors);
                } else {
                    setSearchError(data.message || 'Failed to fetch tutors');
                }
            } catch (err) {
                setSearchError('Failed to fetch tutors');
            }
            setIsSearching(false);
        };

    // --- HANDLERS ---
    
    const goToProfile = (tutorId, subjectId) => navigate(`/parent/tutor/${tutorId}/subject/${subjectId}`);
    const handleSubjectClick = (subjectId) => navigate(`/subjects/${subjectId}`);
    
    const handleRateRangeChange = (newRange) => {
        setRateRange(newRange);
        setMinRate(newRange[0].toString());
        setMaxRate(newRange[1].toString());
    };

    // Splitting carousel tutors for the two sections
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
    const recentlyVisitedTutors = flattenTutorsBySubject(carouselTutors.slice(0, 8));

    // Google Calendar connect handler
    const handleGoogleConnect = () => {
        console.log('User prop:', user);
        
        // Check if user exists and has an ID
        if (!user) {
            Swal.fire({
                icon: 'warning',
                title: 'Login Required',
                text: 'Please log in to connect your Google account.',
                confirmButtonColor: '#14b8a6'
            });
            return;
        }
        
        // Check for different possible ID fields
        const userId = user.id || user._id;
        if (!userId) {
            console.error('User object missing ID:', user);
            Swal.fire({
                icon: 'error',
                title: 'User Data Error',
                text: 'User data is incomplete. Please log out and log in again.',
                confirmButtonColor: '#14b8a6'
            });
            return;
        }
        
        console.log('Connecting Google Calendar for user ID:', userId);
        window.location.href = `${import.meta.env.VITE_API_URL}/api/google/auth/${userId}`;
    };

    // Toggle bookmark
    const handleBookmark = async (tutorId, subjectId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/parent/bookmark`, {
                method: 'POST',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tutorId, subjectId })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Refresh bookmarks
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/parent/bookmarks`, {
                    headers: { 'Authorization': token ? `Bearer ${token}` : '' },
                });
                const bookmarksData = await res.json();
                if (bookmarksData.success) {
                    setBookmarks(bookmarksData.data || []);
                    
                    // Show success message
                    const isBookmarked = bookmarksData.data.some(b => 
                        b.tutorId && b.tutorId._id === tutorId && 
                        b.subjectId && b.subjectId._id === subjectId
                    );
                    
                    Swal.fire({
                        icon: 'success',
                        title: isBookmarked ? 'Bookmarked!' : 'Removed from bookmarks',
                        text: isBookmarked ? 'Tutor has been added to your bookmarks' : 'Tutor has been removed from your bookmarks',
                        confirmButtonColor: '#14b8a6',
                        timer: 1500,
                        showConfirmButton: false
                    });
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.message || 'Failed to update bookmark',
                    confirmButtonColor: '#14b8a6'
                });
            }
        } catch (err) {
            console.error('Bookmark error:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to update bookmark. Please try again.',
                confirmButtonColor: '#14b8a6'
            });
        }
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
                    {/* Google Calendar Connect Button */}
                    <div className="d-flex justify-content-end mb-3">
                        <button
                            className="btn btn-outline-primary fw-bold d-flex align-items-center"
                            style={{ 
                                borderRadius: 8, 
                                fontSize: 16,
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                borderColor: '#14b8a6',
                                color: '#14b8a6'
                            }}
                            onClick={handleGoogleConnect}
                        >
                            <i className="bi bi-google me-2" style={{ fontSize: 20 }}></i>
                            {googleConnected ? 'Reconnect Google Calendar' : 'Connect to Google Calendar'}
                        </button>
                    </div>

                    {/* Quick Actions Section */}
                    <div className="card border-0 shadow-sm rounded-4 mb-4" style={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <div className="card-body p-4">
                            <h4 className="fw-bold mb-3" style={{ color: '#14b8a6' }}>
                                <i className="bi bi-lightning me-2"></i>
                                Quick Actions
                            </h4>
                            <div className="row g-3">
                                <div className="col-md-3 col-sm-6">
                                    <Link to="/parent/bookings" className="btn w-100" style={{ 
                                        backgroundColor: '#14b8a6', 
                                        color: '#fff',
                                        borderRadius: 8,
                                        border: 'none'
                                    }}>
                                        <i className="bi bi-calendar-check me-2"></i>My Bookings
                                    </Link>
                                </div>
                                <div className="col-md-3 col-sm-6">
                                    <Link to="/parent/waitlist" className="btn w-100" style={{ 
                                        backgroundColor: '#14b8a6', 
                                        color: '#fff',
                                        borderRadius: 8,
                                        border: 'none'
                                    }}>
                                        <i className="bi bi-clock-history me-2"></i>My Waitlist
                                    </Link>
                                </div>
                                <div className="col-md-3 col-sm-6">
                                    <Link to="/parent/bookmarks" className="btn w-100" style={{ 
                                        backgroundColor: '#14b8a6', 
                                        color: '#fff',
                                        borderRadius: 8,
                                        border: 'none'
                                    }}>
                                        <i className="bi bi-bookmark me-2"></i>Bookmarks
                                    </Link>
                                </div>
                                <div className="col-md-3 col-sm-6">
                                    <Link to="/parent/messages" className="btn w-100" style={{ 
                                        backgroundColor: '#14b8a6', 
                                        color: '#fff',
                                        borderRadius: 8,
                                        border: 'none'
                                    }}>
                                        <i className="bi bi-chat-dots me-2"></i>Messages
                                    </Link>
                                </div>
                                <div className="col-md-3 col-sm-6">
                                    <Link to="/parent/disputes" className="btn w-100" style={{ 
                                        backgroundColor: '#14b8a6', 
                                        color: '#fff',
                                        borderRadius: 8,
                                        border: 'none'
                                    }}>
                                        <i className="bi bi-exclamation-triangle me-2"></i>Disputes
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Multi-Filter Panel */}
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
                            <h1 className="display-5 fw-bold" style={{ color: '#14b8a6' }}>#Find Your Tutor With Ease</h1>
                            <p className="lead col-lg-8 mx-auto" style={{ color: '#666' }}>Set any combination of filters to find the perfect tutor.</p>
                            <form className="" onSubmit={handleSearch}>
                                <div className="row justify-content-center mb-3">
                                    <div className="col-md-8 col-12">
                                        <input type="text" className="form-control form-control-lg" placeholder="Search by tutor name..." value={filterName} onChange={e => setFilterName(e.target.value)} style={{ 
                                            borderRadius: 12, 
                                            fontSize: 20,
                                            border: '2px solid #e2e8f0',
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)'
                                        }} />
                                    </div>
                                </div>
                                <div className="row justify-content-center align-items-end g-3">
                                    <div className="col-md-2 col-6">
                                        <select className="form-select" value={filterLocation} onChange={e => setFilterLocation(e.target.value)} style={{
                                            border: '2px solid #e2e8f0',
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)'
                                        }}>
                                            <option value="">Location</option>
                                            {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-md-2 col-6">
                                        <select className="form-select" value={filterSubject} onChange={e => setFilterSubject(e.target.value)} style={{
                                            border: '2px solid #e2e8f0',
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)'
                                        }}>
                                            <option value="">Subject</option>
                                            {subjects.map(subj => <option key={subj._id} value={subj._id}>{subj.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-md-2 col-6">
                                        <select className="form-select" value={filterRating} onChange={e => setFilterRating(e.target.value)} style={{
                                            border: '2px solid #e2e8f0',
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)'
                                        }}>
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
                                        <button className="btn w-100 fw-bold py-2" type="submit" style={{ 
                                            backgroundColor: '#14b8a6', 
                                            color: '#fff', 
                                            borderRadius: 8, 
                                            fontSize: 18,
                                            border: 'none'
                                        }}>Search</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </section>
                    
                    {/* Search Results Section - Moved to top */}
                    {(isSearching || searchError || searchedTutors.length > 0) && (
                        <section className="mb-5">
                            <div className="card border-0 shadow-sm rounded-4" style={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(10px)'
                            }}>
                                <div className="card-body p-4">
                                    <h2 className="fw-bold fs-4 mb-3" style={{ color: '#14b8a6' }}>Search Results</h2>
                                    {isSearching ? (
                                        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(126, 227, 242, 0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <circle cx="40" cy="40" r="36" stroke="#14b8a6" strokeWidth="8" strokeDasharray="56 56" strokeLinecap="round">
                                                    <animateTransform attributeName="transform" type="rotate" from="0 40 40" to="360 40 40" dur="1s" repeatCount="indefinite" />
                                                </circle>
                                                <circle cx="40" cy="25" r="6" fill="#14b8a6">
                                                    <animate attributeName="cy" values="25;15;25" dur="1s" repeatCount="indefinite" />
                                                </circle>
                                                <rect x="36" y="45" width="8" height="18" rx="4" fill="#14b8a6">
                                                    <animate attributeName="y" values="45;55;45" dur="1s" repeatCount="indefinite" />
                                                </rect>
                                            </svg>
                                        </div>
                                    ) : searchError ? (
                                        <div className="alert alert-danger" style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)', borderColor: '#dc3545', color: '#dc3545' }}>{searchError}</div>
                                    ) : searchedTutors.length === 0 ? (
                                        <div className="text-secondary text-center p-5">No tutors found matching your criteria.</div>
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
                                            {flattenTutorsBySubject(searchedTutors).map((tutor, i) => (
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
                    
                    {/* Recommended Tutors Section - Based on Child's Preferred Subjects */}
                    <section className="py-4">
                        <div className="card border-0 shadow-sm rounded-4" style={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <div className="card-body p-4">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h2 className="fw-bold fs-4 mb-0" style={{ color: '#14b8a6' }}>
                                        <i className="bi bi-star-fill me-2"></i>
                                        Recommended for You
                                    </h2>
                                    <Link to="/parent/search-tutors" className="btn btn-outline-primary btn-sm" style={{ borderColor: '#14b8a6', color: '#14b8a6' }}>
                                        See All Tutors
                                    </Link>
                                </div>
                                <p className="text-secondary mb-3">Tutors matching your child's preferred subjects</p>
                                {recommendedTutors.length === 0 ? (
                                    <div className="alert alert-info text-center" style={{ backgroundColor: 'rgba(20, 184, 166, 0.1)', borderColor: '#14b8a6', color: '#14b8a6' }}>
                                        <i className="bi bi-info-circle me-2"></i>
                                        No recommended tutors found. Please update your child's preferred subjects in your profile.
                                    </div>
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
                                        {flattenTutorsBySubject(recommendedTutors).map((tutor, i) => (
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
                    
                    {/* Latest Tutors Section */}
                    <HorizontalScroll title="Latest Tutors" seeAllLink="/parent/search-tutors?sortBy=date">
                        {latestTutors.length === 0 ? (
                            <div className="alert alert-info text-center" style={{ backgroundColor: 'rgba(20, 184, 166, 0.1)', borderColor: '#14b8a6', color: '#14b8a6' }}>No new tutors found.</div>
                        ) : (
                            flattenTutorsBySubject(latestTutors).map((tutor, i) => (
                                <div key={`${tutor._id}-${tutor.subject?._id || tutor.subjectId || i}`} style={{ flex: '0 0 285px' }}>
                                    <TutorCard tutor={tutor} onClick={() => goToProfile(tutor._id, tutor.subject?._id)} bookmarks={bookmarks} onBookmark={handleBookmark} />
                                </div>
                            ))
                        )}
                    </HorizontalScroll>

                    {/* Recently Visited Tutors Section */}
                    <HorizontalScroll title="Recently Visited" seeAllLink="/parent/search-tutors">
                        {!recentlyVisited || recentlyVisited.length === 0 ? (
                            <div className="alert alert-info text-center">No recently visited tutors yet. Start exploring tutors!</div>
                        ) : (
                            recentlyVisited.map((entry, i) => {
                                const tutor = entry.tutorId;
                                const subject = entry.subjectId;
                                if (!tutor || !subject) return null;
                                // Find the subject entry for this subjectId to get the title
                                const subjectEntry = (tutor.subjects || []).find(s => s.subject && (s.subject._id === subject._id || s.subject._id === subject.id));
                                const subjectWithTitle = { ...subject, title: subjectEntry?.title };
                                
                                // Handle image URL for the subject
                                let subjectImage = subject.imageUrl;
                                if (subjectImage && subjectImage.startsWith('/uploads/')) {
                                    subjectImage = `${import.meta.env.VITE_API_URL}${subjectImage}`;
                                }
                                
                                return (
                                    <div key={`${tutor._id}-${subject._id || subject.id || i}`} style={{ flex: '0 0 285px' }}>
                                        <TutorCard
                                            tutor={{ ...tutor, subject: subjectWithTitle, subjectId: subject._id || subject.id, subjectImage: subjectImage, hourlyRate: subjectEntry?.hourlyRate }}
                                            onClick={() => goToProfile(tutor._id, subject._id)}
                                            bookmarks={bookmarks}
                                            onBookmark={handleBookmark}
                                        />
                                    </div>
                                );
                            })
                        )}
                    </HorizontalScroll>

                    {/* Top Tutors Section */}
                    <HorizontalScroll title="Top Tutors" seeAllLink="/parent/search-tutors?sortBy=rating">
                        {topTutors.length === 0 ? (
                            <div className="alert alert-info text-center" style={{ backgroundColor: 'rgba(20, 184, 166, 0.1)', borderColor: '#14b8a6', color: '#14b8a6' }}>No top tutors found.</div>
                        ) : (
                            flattenTutorsBySubject(topTutors).map((tutor, i) => (
                                <div key={`${tutor._id}-${tutor.subject?._id || tutor.subjectId || i}`} style={{ flex: '0 0 285px' }}>
                                    <TutorCard tutor={tutor} onClick={() => goToProfile(tutor._id, tutor.subject?._id)} bookmarks={bookmarks} onBookmark={handleBookmark} />
                                </div>
                            ))
                        )}
                    </HorizontalScroll>

                    {/* Bookmarked Tutors Section */}
                    <HorizontalScroll title="Bookmarked Tutors" seeAllLink="/parent/bookmarks">
                        {!bookmarks || bookmarks.length === 0 ? (
                            <div className="alert alert-info text-center">No bookmarked tutors yet.</div>
                        ) : (
                            bookmarks.map((b, i) => {
                                const tutor = b.tutorId;
                                const subject = b.subjectId;
                                if (!tutor || !subject) return null;
                                // Find the subject entry for this subjectId to get the title
                                const subjectEntry = (tutor.subjects || []).find(s => s.subject && (s.subject._id === subject._id));
                                const subjectWithTitle = { ...subject, title: subjectEntry?.title };
                                
                                // Handle image URL for the subject
                                let subjectImage = subject.imageUrl;
                                if (subjectImage && subjectImage.startsWith('/uploads/')) {
                                    subjectImage = `${import.meta.env.VITE_API_URL}${subjectImage}`;
                                }
                                
                                return (
                                    <div key={`${tutor._id}-${subject._id || i}`} style={{ flex: '0 0 285px' }}>
                                        <TutorCard tutor={{ ...tutor, subject: subjectWithTitle, subjectId: subject._id, subjectImage: subjectImage, hourlyRate: subjectEntry?.hourlyRate }} onClick={() => goToProfile(tutor._id, subject._id)} bookmarks={bookmarks} onBookmark={handleBookmark} />
                                    </div>
                                );
                            })
                        )}
                    </HorizontalScroll>

                    {/* Initial Content (Carousels & Categories) */}
                    {initialLoading ? (
                         <div className="d-flex justify-content-center p-5">
                             <div className="spinner-border" style={{color: '#14b8a6'}} role="status">
                                 <span className="visually-hidden">Loading...</span>
                             </div>
                         </div>
                    ) : initialError ? (
                        <div className="alert alert-danger" style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)', borderColor: '#dc3545', color: '#dc3545' }}>{initialError}</div>
                    ) : (
                        <>
                            <section className="py-4">
                                <div className="card border-0 shadow-sm rounded-4" style={{ 
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    backdropFilter: 'blur(10px)'
                                }}>
                                    <div className="card-body p-4">
                                        <h2 className="fw-bold fs-4 mb-3" style={{ color: '#14b8a6' }}>Subject categories</h2>
                                        <div className="row">
                                            {subjects.slice(0, 12).map(subject => {
                                                // Count tutors for this subject
                                                let tutorsCount = 0;
                                                if (Array.isArray(subject.tutorIds) && subject.tutorIds.length > 0) {
                                                    tutorsCount = subject.tutorIds.length;
                                                } else if (carouselTutors && carouselTutors.length > 0) {
                                                    const subjectIdStr = String(subject._id);
                                                    tutorsCount = carouselTutors.filter(tutor =>
                                                        Array.isArray(tutor.subjects) && tutor.subjects.some(s => {
                                                            if (!s.subject) return false;
                                                            const sId = typeof s.subject === 'object' ? String(s.subject._id) : String(s.subject);
                                                            return sId === subjectIdStr;
                                                        })
                                                    ).length;
                                                }
                                                return <SubjectCategoryCard key={subject._id} subject={subject} onClick={() => handleSubjectClick(subject._id)} tutorsCount={tutorsCount} />;
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </>
                    )}
                </main>

                <Footer />

                <style>{`
                    .tutor-card { min-width: 250px; }
                    .tutor-card:hover, .subject-category-card:hover { transform: translateY(-5px); transition: all 0.2s ease-in-out; box-shadow: 0 0.5rem 1rem rgba(0,0,0,.15)!important; }
                    .overflow-auto::-webkit-scrollbar { display: none; }
                    .btn-outline-info:hover { background-color: #2DB8A1; border-color: #2DB8A1; color: white !important; }
                    .subject-category-card { background-color: #ffffff; transition: all 0.2s ease-in-out; }
                    
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

// Helper to call backend to mark a tutor+subject as recently visited (to use in TutorProfile page)
export async function markRecentlyVisited(tutorId, subjectId) {
    const token = localStorage.getItem('token');
    await fetch(`${import.meta.env.VITE_API_URL}/api/parent/recently-visited`, {
        method: 'POST',
        headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tutorId, subjectId })
    });
}

export default ParentDashboard;
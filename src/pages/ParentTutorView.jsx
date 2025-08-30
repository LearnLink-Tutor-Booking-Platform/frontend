import React from 'react';
import { Link, useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import groupImg from '../assets/images/Group.png';
import objectImg from '../assets/images/Object.png';
import Footer from '../components/Footer';

// --- Mock Data for a Single Tutor Profile ---
// In a real app, you would fetch this data from your API using the tutor's ID from the URL.
const tutorData = {
    id: 1,
    name: 'Dr. Evelyn Reed',
    avatar: 'https://i.pravatar.cc/150?img=1', // Using a placeholder avatar
    tagline: 'PhD in Physics | 10+ Years of Tutoring Experience',
    rating: 4.9,
    reviewsCount: 82,
    studentsCount: 150,
    location: 'Remote & Island-wide',
    hourlyRate: 50,
    videoIntroUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Placeholder video link
    about: "I am a passionate and dedicated educator with a PhD in Physics and over a decade of experience in making complex topics understandable and engaging. My teaching philosophy is centered around building a student's confidence and fostering a genuine curiosity for the subject. I specialize in preparing students for advanced placement (AP) exams and university-level coursework. Let's work together to unlock your full potential!",
    subjects: ['AP Physics C: Mechanics', 'AP Calculus BC', 'University Physics I & II', 'Advanced Mathematics'],
    qualifications: [
        'PhD in Theoretical Physics, MIT',
        'M.S. in Applied Mathematics, Stanford University',
        'Certified National Tutoring Association (NTA) Tutor'
    ],
    availability: {
        Monday: '4 PM - 8 PM',
        Tuesday: '4 PM - 8 PM',
        Wednesday: 'Not Available',
        Thursday: '5 PM - 9 PM',
        Friday: '3 PM - 7 PM',
        Saturday: '10 AM - 2 PM',
        Sunday: 'Not Available',
    },
    reviews: [
        { id: 1, parentName: 'John S.', parentAvatar: 'https://i.pravatar.cc/150?img=11', rating: 5, date: 'June 15, 2025', comment: "Evelyn is an extraordinary tutor. My son's grades in Physics improved from a C to an A in just one semester. Highly recommended!" },
        { id: 2, parentName: 'Maria G.', parentAvatar: 'https://i.pravatar.cc/150?img=12', rating: 5, date: 'May 28, 2025', comment: "Her way of explaining calculus is amazing. She is patient, knowledgeable, and truly cares about her students' success." },
        { id: 3, parentName: 'David L.', parentAvatar: 'https://i.pravatar.cc/150?img=14', rating: 4, date: 'April 02, 2025', comment: "A very good tutor. Scheduling can be a bit tricky due to her high demand, but it's well worth it. My daughter is much more confident now." },
    ]
};
// --- End Mock Data ---

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


const ParentTutorView = () => {
    // In a real app, you would use this to fetch the specific tutor's data
    // const { tutorId } = useParams(); 
    // const [tutor, setTutor] = useState(null);
    // useEffect(() => { /* Fetch tutor by tutorId */ }, [tutorId]);
    
    const tutor = tutorData; // Using mock data for this example

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
                <div className="row g-5">
                    {/* Left Column: Main Content */}
                    <div className="col-lg-8">
                        {/* Profile Header */}
                        <div className="d-flex flex-column flex-md-row align-items-center mb-4">
                            <img src={tutor.avatar} alt={tutor.name} className="rounded-circle me-md-4 mb-3 mb-md-0" style={{ width: '120px', height: '120px', border: '5px solid #fff', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}/>
                            <div>
                                <h1 className="fw-bolder mb-1" style={{ color: '#14b8a6' }}>{tutor.name}</h1>
                                <p className="text-secondary fs-5 mb-2">{tutor.tagline}</p>
                                <div className="d-flex align-items-center text-secondary">
                                    <i className="bi bi-star-fill text-warning me-1"></i> <strong>{tutor.rating}</strong> ({tutor.reviewsCount} reviews)
                                    <span className="mx-2">|</span>
                                    <i className="bi bi-person-fill me-1"></i> {tutor.studentsCount}+ students
                                    <span className="mx-2">|</span>
                                    <i className="bi bi-geo-alt-fill me-1"></i> {tutor.location}
                                </div>
                            </div>
                        </div>

                        {/* About Me Section */}
                        <div className="card border-0 shadow-sm rounded-4 mb-4" style={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(10px)'
                        }}>
                            <div className="card-body p-4">
                                <h4 className="fw-bold mb-3" style={{ color: '#14b8a6' }}>About Me</h4>
                                <p className="text-secondary lh-lg">{tutor.about}</p>
                            </div>
                        </div>

                         {/* Subjects & Qualifications */}
                        <div className="card border-0 shadow-sm rounded-4 mb-4" style={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(10px)'
                        }}>
                            <div className="card-body p-4">
                                <h4 className="fw-bold mb-3" style={{ color: '#14b8a6' }}>Subjects & Qualifications</h4>
                                <h6 className="fw-semibold">Subjects I Teach:</h6>
                                <div className="mb-3">
                                    {tutor.subjects.map(subject => <span key={subject} className="badge me-2 mb-2 fs-6 fw-normal" style={{backgroundColor: '#E9F8F5', color: '#036C5C'}}>{subject}</span>)}
                                </div>
                                <h6 className="fw-semibold mt-3">My Credentials:</h6>
                                <ul className="list-unstyled text-secondary">
                                    {tutor.qualifications.map(q => <li key={q}><i className="bi bi-patch-check-fill text-success me-2"></i>{q}</li>)}
                                </ul>
                            </div>
                        </div>

                        {/* Parent Reviews Section */}
                        <div className="card border-0 shadow-sm rounded-4 mb-4" style={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(10px)'
                        }}>
                            <div className="card-body p-4">
                                <h4 className="fw-bold mb-3" style={{ color: '#14b8a6' }}>Parent Reviews ({tutor.reviews.length})</h4>
                                {tutor.reviews.map(review => (
                                    <div key={review.id} className="d-flex mb-4">
                                        <img src={review.parentAvatar} alt={review.parentName} className="rounded-circle me-3" style={{width: '50px', height: '50px'}}/>
                                        <div>
                                            <div className="d-flex justify-content-between">
                                                <h6 className="fw-bold mb-0">{review.parentName}</h6>
                                                <span className="text-warning">{'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}</span>
                                            </div>
                                            <p className="text-secondary mb-1">"{review.comment}"</p>
                                            <small className="text-muted">{review.date}</small>
                                        </div>
                                    </div>
                                ))}
                                <Link to="#" className="btn btn-outline-primary rounded-pill" style={{ borderColor: '#14b8a6', color: '#14b8a6' }}>Show all reviews</Link>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Action Card */}
                    <div className="col-lg-4">
                        <div className="card border-0 shadow-sm rounded-4 position-sticky" style={{ 
                          top: '100px',
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(10px)'
                        }}>
                           <div className="card-body p-4">
                                <div className="text-center mb-3">
                                   <i className="bi bi-camera-video-fill display-3" style={{color: '#14b8a6'}}></i>
                                   <p className="text-secondary mt-1">Watch my intro video</p>
                                </div>

                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <p className="fs-5 mb-0">Hourly Rate</p>
                                    <p className="fs-4 fw-bold mb-0" style={{ color: '#14b8a6' }}>${tutor.hourlyRate}</p>
                                </div>
                               
                               <div className="d-grid gap-2">
                                   <button className="btn btn-lg fw-semibold rounded-pill" style={{ backgroundColor: '#14b8a6', color: 'white' }}><i className="bi bi-calendar-plus me-2"></i>Book a Session</button>
                                   <button className="btn btn-lg btn-outline-secondary fw-semibold rounded-pill"><i className="bi bi-chat-dots me-2"></i>Send a Message</button>
                               </div>

                               <hr/>

                               <h6 className="fw-bold mb-3 text-center" style={{ color: '#14b8a6' }}>Weekly Availability</h6>
                               <ul className="list-group list-group-flush">
                                {Object.entries(tutor.availability).map(([day, time]) => (
                                    <li key={day} className="list-group-item d-flex justify-content-between border-0 px-1">
                                        <span>{day}</span>
                                        <span className={`fw-semibold ${time === 'Not Available' ? 'text-danger' : 'text-success'}`}>{time}</span>
                                    </li>
                                ))}
                               </ul>
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

export default ParentTutorView;
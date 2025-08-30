import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import objImg from '../assets/images/Object.png';
import groupImg from '../assets/images/Group.png';
import objectImg from '../assets/images/Object.png';
import Footer from '../components/Footer';

// --- Reusable Components for consistency ---
const AppHeader = () => (
    <header className="bg-white shadow-sm sticky-top">
        <nav className="container navbar navbar-expand-lg navbar-light">
          <Link className="navbar-brand fw-bold fs-4" style={{ color: '#2DB8A1' }} to="/">LearnLink</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav mx-auto">
              <li className="nav-item"><Link className="nav-link active" to="/">Home</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/#features">Features</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/#testimonials">Testimonials</Link></li>
            </ul>
            <div className="d-flex">
              <Link to="/login" className="btn btn-outline-secondary btn-sm me-2">Login</Link>
              <Link to="/register" className="btn btn-primary-custom btn-sm">Sign Up</Link>
            </div>
          </div>
        </nav>
    </header>
);

const features = [
  {
    icon: 'bi-search-heart',
    title: 'Search & Discover',
    desc: 'Easily search for tutors by subject, availability, and location to find the perfect match.'
  },
  {
    icon: 'bi-calendar-check',
    title: 'Book with Confidence',
    desc: 'View detailed profiles, ratings, and real-time calendars before booking a session.'
  },
  {
    icon: 'bi-shield-check',
    title: 'Verified Tutors',
    desc: 'Our platform verifies tutor profiles to ensure quality and safety for all users.'
  }
];

const testimonials = [
  {
    quote: 'Finding a reliable math tutor for my son was a nightmare. LearnLink made it so simple and stress-free. We found a perfect match in minutes!',
    author: 'Sarah L.',
    role: 'Parent'
  },
  {
    quote: 'As a university student, this platform is an amazing way to earn extra income. The schedule management is a lifesaver and I can focus on what I do best - teaching.',
    author: 'David K.',
    role: 'Tutor'
  },
  {
    quote: 'The quality of tutors is exceptional. My daughter\'s confidence in Chemistry has skyrocketed since we started using LearnLink.',
    author: 'Maria G.',
    role: 'Parent'
  }
];

function Home() {
  const navigate = useNavigate();
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
        {/* Hero Section */}
        <section className="py-5">
          <div className="container position-relative z-2">
            <div className="row align-items-center justify-content-center text-center text-lg-start">
              <div className="col-lg-6">
                <h1 className="display-3 fw-bolder mb-3" style={{ color: '#14b8a6' }}>Unlock Your Potential with the <span style={{ color: '#14b8a6' }}>Perfect Tutor</span></h1>
                <p className="lead text-secondary mb-4">Connect with qualified university students for personalized tutoring. Flexible, reliable, and tailored to your academic needs.</p>
                <button onClick={() => navigate('/parent-login')} className="btn btn-lg px-5 rounded-pill shadow" style={{ 
                  backgroundColor: '#14b8a6', 
                  color: '#fff',
                  border: 'none'
                }}>Find a Tutor Now</button>
              </div>
              <div className="col-lg-6 text-center mt-5 mt-lg-0">
                <img src={objImg} alt="Students learning online" className="img-fluid" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container py-5 my-5">
          <div className="card border-0 shadow-sm rounded-4" style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)'
          }}>
            <div className="card-body p-5">
              <h2 className="fw-bold text-center mb-5" style={{ color: '#14b8a6' }}>Why Choose LearnLink?</h2>
              <div className="row g-4 justify-content-center">
                {features.map((f, idx) => (
                  <div className="col-md-4" key={idx}>
                    <div className="card feature-card border-0 shadow-sm h-100 text-center p-4 rounded-4" style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(5px)'
                    }}>
                      <div className="mb-3">
                        <i className={`bi ${f.icon} display-4`} style={{ color: '#14b8a6' }}></i>
                      </div>
                      <h5 className="fw-bold mb-2" style={{ color: '#14b8a6' }}>{f.title}</h5>
                      <p className="text-secondary mb-0">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-5">
          <div className="container">
            <div className="card border-0 shadow-sm rounded-4" style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}>
              <div className="card-body p-5">
                <h2 className="fw-bold text-center mb-5" style={{ color: '#14b8a6' }}>Loved by Parents & Tutors</h2>
                <div id="testimonialCarousel" className="carousel slide" data-bs-ride="carousel">
                  <div className="carousel-inner">
                    {testimonials.map((t, idx) => (
                      <div className={`carousel-item${idx === 0 ? ' active' : ''}`} key={idx}>
                        <div className="row justify-content-center">
                          <div className="col-lg-8">
                            <div className="card border-0 text-center p-4" style={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.8)',
                              backdropFilter: 'blur(5px)'
                            }}>
                              <div className="mb-3">
                                <i className="bi bi-quote display-2" style={{ color: '#14b8a6', opacity: 0.25 }}></i>
                              </div>
                              <blockquote className="blockquote mb-3 fs-5">
                                <p className="mb-0 fst-italic">"{t.quote}"</p>
                              </blockquote>
                              <footer className="blockquote-footer mt-2">
                                <span className="fw-bold">{t.author}</span> <cite title="Source Title">({t.role})</cite>
                              </footer>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="carousel-control-prev" type="button" data-bs-target="#testimonialCarousel" data-bs-slide="prev">
                    <span className="carousel-control-icon-custom"><i className="bi bi-arrow-left-circle-fill"></i></span>
                  </button>
                  <button className="carousel-control-next" type="button" data-bs-target="#testimonialCarousel" data-bs-slide="next">
                    <span className="carousel-control-icon-custom"><i className="bi bi-arrow-right-circle-fill"></i></span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div style={{ position: 'relative', zIndex: 2 }}>
        <Footer />
      </div>
      
      <style>{`
        .text-primary-custom { color: #14b8a6 !important; }
        .btn-primary-custom { background-color: #14b8a6; border-color: #14b8a6; color: white; }
        .btn-primary-custom:hover { background-color: #0d9488; border-color: #0d9488; }
        .feature-card { transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out; }
        .feature-card:hover { transform: translateY(-10px); box-shadow: 0 1rem 3rem rgba(0,0,0,.1)!important; }
        .carousel-control-icon-custom {
            font-size: 2.5rem;
            color: #14b8a6;
        }
        .carousel-control-prev, .carousel-control-next {
            width: 5%;
        }
      `}</style>
    </div>
  );
}

export default Home;
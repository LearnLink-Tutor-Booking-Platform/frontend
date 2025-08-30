import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import groupImg from '../assets/images/Group.png';
import objectImg from '../assets/images/Object.png';
import Footer from '../components/Footer';

const API_URL = `${import.meta.env.VITE_API_URL}/api/parent/tutor`;

function ParentTutorAllReviews() {
  const { tutorId } = useParams();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [average, setAverage] = useState(0);
  const [tutor, setTutor] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/${tutorId}/reviews`, {
          headers: { 'Authorization': token ? `Bearer ${token}` : '' },
        });
        const data = await res.json();
        if (data.success) {
          setReviews(data.data.reviews || []);
          setTutor(data.data.tutor);
          setAverage(data.data.averageRating || 0);
        } else {
          setError(data.message || 'Failed to fetch reviews');
        }
      } catch (err) {
        setError('Failed to fetch reviews');
      }
      setLoading(false);
    };
    fetchReviews();
  }, [tutorId]);

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
          <div className="row justify-content-center">
            <div className="col-lg-8">
              {/* Header */}
              <div className="card border-0 shadow-sm rounded-4 mb-4" style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)'
              }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <button 
                      className="btn btn-outline-primary me-3" 
                      onClick={() => navigate(-1)}
                      style={{ borderColor: '#14b8a6', color: '#14b8a6' }}
                    >
                      <i className="bi bi-arrow-left me-2"></i>Back
                    </button>
                    <h2 className="fw-bold mb-0" style={{ color: '#14b8a6' }}>
                      <i className="bi bi-star-fill me-2"></i>
                      All Reviews
                    </h2>
                  </div>
                  {tutor && (
                    <div className="d-flex align-items-center">
                      <div className="me-3">
                        <span className="fs-2 fw-bold text-warning">{average}</span>
                        <span className="text-warning fs-4 ms-2">{'★'.repeat(Math.round(average))}{'☆'.repeat(5 - Math.round(average))}</span>
                      </div>
                      <div>
                        <div className="fw-bold" style={{ color: '#14b8a6' }}>{tutor.name}</div>
                        <div className="text-secondary">({reviews.length} reviews)</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Reviews List */}
              <div className="card border-0 shadow-sm rounded-4" style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)'
              }}>
                <div className="card-body p-4">
                  {loading ? (
                    <div className="d-flex justify-content-center align-items-center" style={{minHeight: 200}}>
                      <div className="spinner-border" style={{color: '#14b8a6'}} role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="alert alert-danger" style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)', borderColor: '#dc3545', color: '#dc3545' }}>
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      {error}
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-star text-muted" style={{fontSize: '3rem'}}></i>
                      <div className="text-secondary mt-3">No reviews yet.</div>
                    </div>
                  ) : (
                    <div>
                      {reviews.map((review, idx) => {
                        // Handle reviewer profile image
                        let reviewerImage = 'https://via.placeholder.com/60x60/14b8a6/ffffff?text=' + (review.parentName || (review.parentId && review.parentId.name) || 'P').charAt(0);
                        if (review.parentId && review.parentId.profileImage) {
                          if (review.parentId.profileImage.startsWith('/uploads/')) {
                            reviewerImage = `${import.meta.env.VITE_API_URL}${review.parentId.profileImage}`;
                          } else {
                            reviewerImage = review.parentId.profileImage;
                          }
                        }
                        
                        return (
                          <div key={review._id || idx} className="border-bottom pb-4 mb-4" style={{borderColor: 'rgba(20, 184, 166, 0.2)'}}>
                            <div className="d-flex">
                              <img 
                                src={reviewerImage} 
                                alt={review.parentName || (review.parentId && review.parentId.name) || 'Parent'} 
                                className="rounded-circle me-3" 
                                style={{
                                  width: '60px', 
                                  height: '60px', 
                                  objectFit: 'cover',
                                  border: '3px solid #14b8a6'
                                }}
                              />
                              <div className="flex-grow-1">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <div>
                                    <h6 className="fw-bold mb-1" style={{ color: '#14b8a6' }}>
                                      {review.parentName || (review.parentId && review.parentId.name) || 'Parent'}
                                    </h6>
                                    <div className="text-warning mb-2">
                                      {'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}
                                      <span className="text-secondary ms-2">({review.rating}/5)</span>
                                    </div>
                                  </div>
                                  <small className="text-muted">
                                    {review.date || (review.createdAt && new Date(review.createdAt).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    }))}
                                  </small>
                                </div>
                                <div className="bg-light p-3 rounded-3" style={{backgroundColor: 'rgba(20, 184, 166, 0.1)'}}>
                                  <p className="text-secondary mb-0 fst-italic">"{review.comment || review.text}"</p>
                                </div>
                                {review.subject && (
                                  <div className="mt-2">
                                    <span className="badge" style={{backgroundColor: '#14b8a6'}}>
                                      <i className="bi bi-book me-1"></i>
                                      {review.subject.name || 'Subject'}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 2 }}>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default ParentTutorAllReviews; 
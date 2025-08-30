import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const API_URL = `${import.meta.env.VITE_API_URL}/api/admin/reviews`;
const FEEDBACK_URL = `${import.meta.env.VITE_API_URL}/api/admin/feedback`;
const AVATAR_PLACEHOLDER = 'https://ui-avatars.com/api/?background=2DB8A1&color=fff&size=128&name=';

const ReviewCard = ({ review, onAction, actionLoading }) => (
    <div className="card border-0 shadow-sm rounded-4 mb-3">
        <div className="card-body p-4">
            <div className="row">
                <div className="col-md-8">
                    <div className="d-flex align-items-start mb-3">
                        <div className="me-3">
                            <div className="d-flex align-items-center mb-2">
                                <img 
                                    src={`${AVATAR_PLACEHOLDER}${review.parentId?.name?.split(' ').join('+')}`} 
                                    alt={review.parentId?.name} 
                                    className="rounded-circle me-2" 
                                    style={{width: '40px', height: '40px'}}
                                />
                                <div>
                                    <h6 className="fw-bold mb-0">{review.parentId?.name || 'Unknown Parent'}</h6>
                                    <small className="text-secondary">Review for {review.tutorId?.name || 'Unknown Tutor'}</small>
                                </div>
                            </div>
                            <div className="d-flex align-items-center mb-2">
                                <div className="text-warning me-2">
                                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                </div>
                                <span className="badge bg-primary">{review.rating}/5</span>
                            </div>
                        </div>
                    </div>
                    <div className="mb-3">
                        <p className="text-secondary mb-0 fst-italic">"{review.comment}"</p>
                    </div>
                    <div className="d-flex align-items-center">
                        <small className="text-secondary me-3">
                            <i className="bi bi-calendar me-1"></i>
                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric'
                            }) : 'No date'}
                        </small>
                        {review.bookingId && (
                            <small className="text-secondary">
                                <i className="bi bi-calendar-check me-1"></i>
                                Booking: {review.bookingId._id ? review.bookingId._id.slice(-6) : 'Unknown'}
                            </small>
                        )}
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="d-flex flex-column align-items-end">
                        <div className="mb-3">
                            {review.isFlagged && (
                                <span className="badge bg-warning text-dark me-2">
                                    <i className="bi bi-flag me-1"></i>Flagged
                                </span>
                            )}
                            {review.isRemoved && (
                                <span className="badge bg-danger me-2">
                                    <i className="bi bi-x-circle me-1"></i>Removed
                                </span>
                            )}
                            {!review.isFlagged && !review.isRemoved && (
                                <span className="badge bg-success me-2">
                                    <i className="bi bi-check-circle me-1"></i>Approved
                                </span>
                            )}
                        </div>
                        <div className="d-flex gap-2">
                            {!review.isFlagged && !review.isRemoved && (
                                <button 
                                    className="btn btn-warning btn-sm"
                                    disabled={actionLoading === review._id + 'flag'} 
                                    onClick={() => onAction(review._id, 'flag')}
                                >
                                    {actionLoading === review._id + 'flag' ? (
                                        <span className="spinner-border spinner-border-sm" role="status"></span>
                                    ) : (
                                        <i className="bi bi-flag me-1"></i>
                                    )}
                                    Flag
                                </button>
                            )}
                            {!review.isRemoved && (
                                <button 
                                    className="btn btn-danger btn-sm"
                                    disabled={actionLoading === review._id + 'remove'} 
                                    onClick={() => onAction(review._id, 'remove')}
                                >
                                    {actionLoading === review._id + 'remove' ? (
                                        <span className="spinner-border spinner-border-sm" role="status"></span>
                                    ) : (
                                        <i className="bi bi-x-circle me-1"></i>
                                    )}
                                    Remove
                                </button>
                            )}
                            {(review.isFlagged || review.isRemoved) && (
                                <button 
                                    className="btn btn-success btn-sm"
                                    disabled={actionLoading === review._id + 'approve'} 
                                    onClick={() => onAction(review._id, 'approve')}
                                >
                                    {actionLoading === review._id + 'approve' ? (
                                        <span className="spinner-border spinner-border-sm" role="status"></span>
                                    ) : (
                                        <i className="bi bi-check-circle me-1"></i>
                                    )}
                                    Approve
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    rating: '',
    search: ''
  });

  useEffect(() => {
    fetchReviews();
  }, [filters]);

  // Fetch reviews from API
  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams(filters);
      const res = await fetch(`${API_URL}?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setReviews(data.data.reviews || []);
      } else {
        setError(data.message || 'Failed to fetch reviews');
      }
    } catch (err) {
      setError('Failed to fetch reviews');
    }
    setLoading(false);
  };

  // Handle moderation actions
  const handleAction = async (reviewId, action) => {
    setActionLoading(reviewId + action);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(FEEDBACK_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reviewId, action })
      });
      const data = await res.json();
      if (data.success) {
        fetchReviews();
        // Show success message based on action
        let actionText = '';
        switch (action) {
          case 'flag':
            actionText = 'flagged';
            break;
          case 'remove':
            actionText = 'removed';
            break;
          case 'approve':
            actionText = 'approved';
            break;
          default:
            actionText = 'updated';
        }
        
        Swal.fire({
          icon: 'success',
          title: 'Action Successful!',
          text: `Review has been ${actionText} successfully.`,
          confirmButtonColor: '#2DB8A1',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Action Failed',
          text: data.message || 'Failed to perform action',
          confirmButtonColor: '#2DB8A1'
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to perform action',
        confirmButtonColor: '#2DB8A1'
      });
    }
    setActionLoading(null);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
        <div className="d-flex justify-content-center align-items-center vh-100" style={{backgroundColor: '#f8f9fa'}}>
            <div className="spinner-border" style={{'--bs-spinner-color': '#2DB8A1', width: '3rem', height: '3rem'}} role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8f9fa' }}>
        {/* Hero Section */}
        <section className="py-5" style={{ background: 'linear-gradient(120deg, #E9F8F5 0%, #f8f9fa 100%)' }}>
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-md-8">
                        <h1 className="fw-bolder display-5">Review Management</h1>
                        <p className="text-secondary lead">Monitor and moderate user reviews to maintain platform quality and trust.</p>
                    </div>
                    <div className="col-md-4 text-md-end">
                        <Link to="/admin/dashboard" className="btn btn-lg btn-outline-primary rounded-pill shadow-sm">
                           <i className="bi bi-arrow-left me-2"></i> Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </section>

        <main className="container py-5">
            {error ? (
                <div className="alert alert-danger text-center">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                </div>
            ) : (
                <>
                    {/* Filters */}
                    <div className="card border-0 shadow-sm rounded-4 mb-4">
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-3">
                                <i className="bi bi-funnel me-2 text-primary"></i>
                                Filters & Search
                            </h5>
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label className="form-label fw-bold">Status</label>
                                    <select 
                                        className="form-select" 
                                        value={filters.status} 
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                    >
                                        <option value="">All Status</option>
                                        <option value="approved">Approved</option>
                                        <option value="flagged">Flagged</option>
                                        <option value="removed">Removed</option>
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fw-bold">Rating</label>
                                    <select 
                                        className="form-select" 
                                        value={filters.rating} 
                                        onChange={(e) => handleFilterChange('rating', e.target.value)}
                                    >
                                        <option value="">All Ratings</option>
                                        <option value="5">5 Stars</option>
                                        <option value="4">4 Stars</option>
                                        <option value="3">3 Stars</option>
                                        <option value="2">2 Stars</option>
                                        <option value="1">1 Star</option>
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fw-bold">Search</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="Search by parent or tutor name..."
                                        value={filters.search} 
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reviews List */}
                    {reviews.length === 0 ? (
                        <div className="card border-0 shadow-sm rounded-4">
                            <div className="card-body p-5 text-center">
                                <i className="bi bi-star display-1 text-muted mb-3"></i>
                                <h4 className="fw-bold mb-2">No Reviews Found</h4>
                                <p className="text-secondary">Try adjusting your filters or search criteria.</p>
                            </div>
                        </div>
                    ) : (
                        <div>
                            {reviews.map((review) => (
                                <ReviewCard
                                    key={review._id}
                                    review={review}
                                    onAction={handleAction}
                                    actionLoading={actionLoading}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </main>
        
        {/* Custom Styles */}
        <style>{`
            .btn-primary-custom {
                background-color: #2DB8A1 !important;
                border-color: #2DB8A1 !important;
                color: white;
            }
            .btn-primary-custom:hover {
                background-color: #249a85 !important;
                border-color: #249a85 !important;
            }
        `}</style>
    </div>
  );
};

export default AdminReviews; 
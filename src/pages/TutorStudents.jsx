import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import groupImg from '../assets/images/Group.png';
import objectImg from '../assets/images/Object.png';
import Footer from '../components/Footer';

const TutorStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, requested, confirmed, completed
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tutor/students`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setStudents(data.data);
      } else {
        setError(data.message || 'Failed to fetch students');
      }
    } catch (err) {
      setError('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesFilter = filter === 'all' || student.latestBooking?.status === filter;
    const matchesSearch = student.parentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.childName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      requested: { class: 'bg-warning text-dark', text: 'Requested' },
      confirmed: { class: 'bg-info', text: 'Confirmed' },
      completed: { class: 'bg-success', text: 'Completed' },
      cancelled: { class: 'bg-danger', text: 'Cancelled' }
    };
    const config = statusConfig[status] || { class: 'bg-secondary', text: status };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold mb-0" style={{ color: '#14b8a6' }}>
              <i className="bi bi-people me-2"></i>
              My Students
            </h2>
            <button 
              className="btn btn-outline-secondary rounded-pill"
              onClick={() => navigate('/dashboard')}
              style={{ borderColor: '#6c757d', color: '#6c757d' }}
            >
              <i className="bi bi-arrow-left me-1"></i>Back to Dashboard
            </button>
          </div>

          {error && (
            <div className="alert alert-danger mb-4" role="alert" style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)', borderColor: '#dc3545', color: '#dc3545' }}>
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          {/* Filters and Search */}
          <div className="card border-0 shadow-sm rounded-4 mb-4" style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)'
          }}>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold" style={{ color: '#14b8a6' }}>Filter by Status</label>
                  <select 
                    className="form-select" 
                    value={filter} 
                    onChange={(e) => setFilter(e.target.value)}
                    style={{ borderColor: '#e2e8f0', borderRadius: '0.5rem' }}
                  >
                    <option value="all">All Students</option>
                    <option value="requested">Requested</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold" style={{ color: '#14b8a6' }}>Search</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by parent name, child name, or subject..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ borderColor: '#e2e8f0', borderRadius: '0.5rem' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card border-0 shadow-sm rounded-4 text-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
                <div className="card-body">
                  <i className="bi bi-people display-6 mb-2" style={{ color: '#14b8a6' }}></i>
                  <h4 className="fw-bold mb-0" style={{ color: '#14b8a6' }}>{students.length}</h4>
                  <p className="mb-0 text-secondary">Total Students</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm rounded-4 text-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
                <div className="card-body">
                  <i className="bi bi-clock display-6 mb-2" style={{ color: '#ffc107' }}></i>
                  <h4 className="fw-bold mb-0" style={{ color: '#ffc107' }}>{students.filter(s => s.latestBooking?.status === 'requested').length}</h4>
                  <p className="mb-0 text-secondary">Pending</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm rounded-4 text-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
                <div className="card-body">
                  <i className="bi bi-calendar-check display-6 mb-2" style={{ color: '#0dcaf0' }}></i>
                  <h4 className="fw-bold mb-0" style={{ color: '#0dcaf0' }}>{students.filter(s => s.latestBooking?.status === 'confirmed').length}</h4>
                  <p className="mb-0 text-secondary">Confirmed</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm rounded-4 text-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
                <div className="card-body">
                  <i className="bi bi-check-circle display-6 mb-2" style={{ color: '#198754' }}></i>
                  <h4 className="fw-bold mb-0" style={{ color: '#198754' }}>{students.filter(s => s.latestBooking?.status === 'completed').length}</h4>
                  <p className="mb-0 text-secondary">Completed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Students List */}
          {filteredStudents.length === 0 ? (
            <div className="card border-0 shadow-sm rounded-4" style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}>
              <div className="card-body text-center py-5">
                <i className="bi bi-people display-1 mb-3" style={{ color: '#14b8a6' }}></i>
                <h5 className="text-muted">No students found</h5>
                <p className="text-muted">Students will appear here once they book sessions with you.</p>
              </div>
            </div>
          ) : (
            <div className="row">
              {filteredStudents.map((student, index) => (
                <div key={index} className="col-md-6 col-lg-4 mb-4">
                  <div className="card border-0 shadow-sm rounded-4 h-100" style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    transition: 'transform 0.2s ease-in-out'
                  }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h6 className="fw-bold mb-1" style={{ color: '#14b8a6' }}>{student.childName || 'Student'}</h6>
                          <p className="text-muted small mb-0">
                            <i className="bi bi-person me-1"></i>
                            {student.parentName}
                          </p>
                        </div>
                        {getStatusBadge(student.latestBooking?.status)}
                      </div>

                      <div className="mb-3">
                        <div className="d-flex align-items-center mb-2">
                          <i className="bi bi-book me-2" style={{ color: '#14b8a6' }}></i>
                          <span className="fw-semibold">{student.subject}</span>
                        </div>
                        {student.childAge && (
                          <div className="d-flex align-items-center mb-2">
                            <i className="bi bi-calendar me-2" style={{ color: '#0dcaf0' }}></i>
                            <span className="small">Age: {student.childAge}</span>
                          </div>
                        )}
                        {student.childGrade && (
                          <div className="d-flex align-items-center mb-2">
                            <i className="bi bi-mortarboard me-2" style={{ color: '#198754' }}></i>
                            <span className="small">Grade: {student.childGrade}</span>
                          </div>
                        )}
                      </div>

                      {student.latestBooking && (
                        <div className="border-top pt-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="small text-muted">Latest Session:</span>
                            <span className="small fw-semibold">
                              {formatDate(student.latestBooking.sessionTime)}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="small text-muted">Total Sessions:</span>
                            <span className="badge" style={{ backgroundColor: '#6c757d' }}>{student.totalSessions}</span>
                          </div>
                        </div>
                      )}

                      {student.childLearningGoals && (
                        <div className="mt-3">
                          <small className="text-muted">Learning Goals:</small>
                          <p className="small mb-0 text-truncate" title={student.childLearningGoals}>
                            {student.childLearningGoals}
                          </p>
                        </div>
                      )}

                      <div className="mt-3 d-flex gap-2">
                        <button 
                          className="btn btn-outline-info btn-sm flex-fill rounded-pill"
                          onClick={() => navigate('/tutor/bookings')}
                          style={{ borderColor: '#0dcaf0', color: '#0dcaf0' }}
                        >
                          <i className="bi bi-calendar me-1"></i>Bookings
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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

export default TutorStudents; 
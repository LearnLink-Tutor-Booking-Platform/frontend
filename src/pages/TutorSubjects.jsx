import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import groupImg from '../assets/images/Group.png';
import objectImg from '../assets/images/Object.png';
import Footer from '../components/Footer';

const API_URL = `${import.meta.env.VITE_API_URL}/api/tutor/subjects`;

const TutorSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState('');

  const fetchSubjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_URL, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      // Check if response is JSON
      const contentType = res.headers.get('content-type');
      if (!res.ok) {
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          setError(data.message || 'Failed to fetch subjects');
        } else {
          setError('Failed to fetch subjects (not authenticated or server error)');
        }
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setSubjects(data.data.subjects);
      } else {
        setError(data.message || 'Failed to fetch subjects');
      }
    } catch (err) {
      setError('Failed to fetch subjects');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name) return;
    setCreating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, imageUrl }),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setName('');
        setImageUrl('');
        fetchSubjects();
        Swal.fire({
          icon: 'success',
          title: 'Subject Created!',
          text: 'Your subject has been created successfully.',
          confirmButtonColor: '#14b8a6',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Creation Failed',
          text: data.message || 'Failed to create subject',
          confirmButtonColor: '#14b8a6'
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to create subject',
        confirmButtonColor: '#14b8a6'
      });
    }
    setCreating(false);
  };

  const handleDelete = async (subjectId) => {
    const result = await Swal.fire({
      title: 'Delete Subject?',
      text: "Are you sure you want to delete this subject? This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      setDeletingId(subjectId);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/${subjectId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        const data = await res.json();
        if (data.success) {
          fetchSubjects();
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Subject has been deleted successfully.',
            confirmButtonColor: '#14b8a6',
            timer: 2000,
            showConfirmButton: false
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Delete Failed',
            text: data.message || 'Failed to delete subject',
            confirmButtonColor: '#14b8a6'
          });
        }
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete subject',
          confirmButtonColor: '#14b8a6'
        });
      }
      setDeletingId('');
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
        <div className="container py-5">
          <div className="card border-0 shadow-sm rounded-4 mb-4" style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)'
          }}>
            <div className="card-body p-4">
              <h2 className="fw-bold mb-4 text-center" style={{ color: '#14b8a6' }}>
                <i className="bi bi-book me-2"></i>
                Manage Subjects
              </h2>
            </div>
          </div>

          <form className="card p-4 mb-4 shadow-sm mx-auto rounded-4" style={{
            maxWidth: 500,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)'
          }} onSubmit={handleCreate}>
            <div className="mb-3">
              <label className="form-label fw-bold" style={{ color: '#14b8a6' }}>
                <i className="bi bi-bookmark me-2"></i>
                Subject Name
              </label>
              <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required style={{ borderColor: '#e2e8f0', borderRadius: '0.5rem' }} />
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold" style={{ color: '#14b8a6' }}>
                <i className="bi bi-image me-2"></i>
                Image URL (optional)
              </label>
              <input type="url" className="form-control" value={imageUrl} onChange={e => setImageUrl(e.target.value)} style={{ borderColor: '#e2e8f0', borderRadius: '0.5rem' }} />
            </div>
            <button type="submit" className="btn btn-lg fw-bold rounded-pill" style={{ backgroundColor: '#14b8a6', borderColor: '#14b8a6', color: 'white' }} disabled={creating}>
              {creating ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Creating...
                </>
              ) : (
                <>
                  <i className="bi bi-plus-circle me-2"></i>
                  Add Subject
                </>
              )}
            </button>
          </form>

          <div className="row g-4">
            {loading ? (
              <div className="col-12">
                <div className="card border-0 shadow-sm rounded-4" style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div className="card-body p-5">
                    <div className="d-flex justify-content-center align-items-center" style={{minHeight: 200}}>
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
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="col-12">
                <div className="card border-0 shadow-sm rounded-4" style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div className="card-body p-4">
                    <div className="alert alert-danger text-center" style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)', borderColor: '#dc3545', color: '#dc3545' }}>{error}</div>
                  </div>
                </div>
              </div>
            ) : subjects.length === 0 ? (
              <div className="col-12">
                <div className="card border-0 shadow-sm rounded-4" style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div className="card-body p-4">
                    <div className="alert alert-info text-center" style={{ backgroundColor: 'rgba(20, 184, 166, 0.1)', borderColor: '#14b8a6', color: '#14b8a6' }}>No subjects found.</div>
                  </div>
                </div>
              </div>
            ) : (
              subjects.map(subject => (
                <div className="col-md-4 col-lg-3" key={subject._id}>
                  <div className="card h-100 shadow-sm rounded-4" style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    transition: 'transform 0.2s ease-in-out'
                  }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    {subject.imageUrl && (
                      <img 
                        src={subject.imageUrl.startsWith('/uploads/') ? `${import.meta.env.VITE_API_URL}${subject.imageUrl}` : subject.imageUrl} 
                        alt={subject.name} 
                        className="card-img-top" 
                        style={{height: 120, objectFit: 'cover', borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem'}} 
                      />
                    )}
                    <div className="card-body d-flex flex-column justify-content-between p-4">
                      <h5 className="card-title fw-bold" style={{ color: '#14b8a6' }}>{subject.name}</h5>
                      <button className="btn btn-sm fw-bold rounded-pill mt-2" style={{ backgroundColor: '#dc3545', borderColor: '#dc3545', color: 'white' }} disabled={deletingId === subject._id} onClick={() => handleDelete(subject._id)}>
                        {deletingId === subject._id ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-trash me-1"></i>
                            Delete
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 2 }}>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default TutorSubjects; 
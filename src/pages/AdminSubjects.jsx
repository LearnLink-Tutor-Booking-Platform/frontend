import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Footer from '../components/Footer';

const API_URL = `${import.meta.env.VITE_API_URL}/api/admin/subjects`;

const AdminSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [form, setForm] = useState({ name: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(API_URL, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setSubjects(data.data);
    } catch {
      //
    }
    setLoading(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('name', form.name);
      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setShowCreate(false);
        setForm({ name: '' });
        setSelectedFile(null);
        fetchSubjects();
        Swal.fire({
          icon: 'success',
          title: 'Subject Created!',
          text: 'The subject has been created successfully.',
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
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to create subject',
        confirmButtonColor: '#14b8a6'
      });
    }
    setCreating(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Updating subject:', selectedSubject._id, 'with data:', form);
      
      const formData = new FormData();
      formData.append('name', form.name);
      if (selectedFile) {
        formData.append('image', selectedFile);
      }
      
      const res = await fetch(`${API_URL}/${selectedSubject._id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);
      
      if (data.success) {
        setShowEdit(false);
        setSelectedSubject(null);
        setForm({ name: '' });
        setSelectedFile(null);
        fetchSubjects();
        Swal.fire({
          icon: 'success',
          title: 'Subject Updated!',
          text: 'The subject has been updated successfully.',
          confirmButtonColor: '#14b8a6',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: data.message || 'Failed to update subject',
          confirmButtonColor: '#14b8a6'
        });
      }
    } catch (error) {
      console.error('Update error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update subject',
        confirmButtonColor: '#14b8a6'
      });
    }
    setUpdating(false);
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
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/${subjectId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
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
      } catch {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete subject',
          confirmButtonColor: '#14b8a6'
        });
      }
    }
  };

  const openEdit = (subject) => {
    setSelectedSubject(subject);
    setForm({ 
      name: subject.name
    });
    setSelectedFile(null);
    setShowEdit(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File Type',
          text: 'Please select an image file',
          confirmButtonColor: '#14b8a6'
        });
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'File Too Large',
          text: 'File size must be less than 5MB',
          confirmButtonColor: '#14b8a6'
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div className="container py-5">
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center">
              <h2 className="fw-bold mb-0" style={{ color: '#14b8a6' }}>
                <i className="bi bi-book me-2"></i>
                Manage Subjects
              </h2>
              <button className="btn btn-lg fw-bold rounded-pill" style={{ backgroundColor: '#14b8a6', borderColor: '#14b8a6', color: 'white' }} onClick={() => setShowCreate(true)}>
                <i className="bi bi-plus-lg me-2"></i> Add Subject
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-5">
              <div className="text-center py-5">
                <div className="spinner-border" style={{ color: '#14b8a6', width: '3rem', height: '3rem' }} role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            </div>
          </div>
        ) : subjects.length === 0 ? (
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              <div className="alert alert-info text-center" style={{ backgroundColor: 'rgba(20, 184, 166, 0.1)', borderColor: '#14b8a6', color: '#14b8a6' }}>
                <i className="bi bi-info-circle me-2"></i>
                No subjects found.
              </div>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {subjects.map(subject => (
              <div key={subject._id} className="col-md-6 col-lg-4">
                <div className="card border-0 shadow-sm rounded-4 h-100" style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  transition: 'transform 0.2s ease-in-out'
                }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  {subject.imageUrl && (
                    <img 
                      src={`${import.meta.env.VITE_API_URL}${subject.imageUrl}`} 
                      alt={subject.name} 
                      className="card-img-top" 
                      style={{
                        height: 120, 
                        objectFit: 'cover', 
                        borderTopLeftRadius: '1rem', 
                        borderTopRightRadius: '1rem'
                      }} 
                    />
                  )}
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h5 className="fw-bold mb-0" style={{ color: '#14b8a6' }}>{subject.name}</h5>
                      <div className="dropdown">
                        <button 
                          className="btn btn-sm btn-outline-secondary dropdown-toggle" 
                          type="button" 
                          data-bs-toggle="dropdown" 
                          aria-expanded="false"
                        >
                          <i className="bi bi-three-dots"></i>
                        </button>
                        <ul className="dropdown-menu">
                          <li><button className="dropdown-item" onClick={() => openEdit(subject)}>
                            <i className="bi bi-pencil me-2"></i>Edit
                          </button></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Subject Modal */}
        {showCreate && (
          <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050, paddingTop: '80px' }}>
            <div className="modal-dialog" role="document">
              <div className="modal-content rounded-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)', backdropFilter: 'blur(10px)' }}>
                <div className="modal-header border-0">
                  <h5 className="modal-title fw-bold" style={{ color: '#14b8a6' }}>
                    <i className="bi bi-plus-circle me-2"></i>
                    Add New Subject
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowCreate(false)}></button>
                </div>
                <form onSubmit={handleCreate}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label fw-bold" style={{ color: '#14b8a6' }}>
                        <i className="bi bi-type me-2"></i>
                        Subject Name
                      </label>
                      <input className="form-control" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ borderColor: '#e2e8f0', borderRadius: '0.5rem' }} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold" style={{ color: '#14b8a6' }}>
                        <i className="bi bi-image me-2"></i>
                        Subject Image (optional)
                      </label>
                      <input 
                        type="file" 
                        className="form-control" 
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ borderColor: '#e2e8f0', borderRadius: '0.5rem' }} 
                      />
                      <small className="text-muted">Max file size: 5MB. Supported formats: JPG, PNG, GIF</small>
                      {selectedFile && (
                        <div className="mt-2">
                          <small className="text-success">Selected: {selectedFile.name}</small>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="modal-footer border-0">
                    <button type="button" className="btn rounded-pill" onClick={() => setShowCreate(false)} style={{ borderColor: '#6c757d', color: '#6c757d', backgroundColor: 'transparent' }}>
                      <i className="bi bi-x-circle me-2"></i>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-lg fw-bold rounded-pill" style={{ backgroundColor: '#14b8a6', borderColor: '#14b8a6', color: 'white' }} disabled={creating}>
                      {creating ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Creating...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-plus-circle me-2"></i>
                          Create Subject
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Subject Modal */}
        {showEdit && selectedSubject && (
          <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050, paddingTop: '80px' }}>
            <div className="modal-dialog" role="document">
              <div className="modal-content rounded-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)', backdropFilter: 'blur(10px)' }}>
                <div className="modal-header border-0">
                  <h5 className="modal-title fw-bold" style={{ color: '#14b8a6' }}>
                    <i className="bi bi-pencil-square me-2"></i>
                    Edit Subject
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowEdit(false)}></button>
                </div>
                <form onSubmit={handleUpdate}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label fw-bold" style={{ color: '#14b8a6' }}>
                        <i className="bi bi-type me-2"></i>
                        Subject Name
                      </label>
                      <input className="form-control" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ borderColor: '#e2e8f0', borderRadius: '0.5rem' }} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold" style={{ color: '#14b8a6' }}>
                        <i className="bi bi-image me-2"></i>
                        Subject Image (optional)
                      </label>
                      <input 
                        type="file" 
                        className="form-control" 
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ borderColor: '#e2e8f0', borderRadius: '0.5rem' }} 
                      />
                      <small className="text-muted">Max file size: 5MB. Supported formats: JPG, PNG, GIF</small>
                      {selectedFile && (
                        <div className="mt-2">
                          <small className="text-success">Selected: {selectedFile.name}</small>
                        </div>
                      )}
                      {selectedSubject?.imageUrl && !selectedFile && (
                        <div className="mt-2">
                          <small className="text-info">Current image will be kept</small>
                          <img 
                            src={`${import.meta.env.VITE_API_URL}${selectedSubject.imageUrl}`} 
                            alt="Current" 
                            style={{ 
                              display: 'block', 
                              maxWidth: '100px', 
                              maxHeight: '60px', 
                              objectFit: 'cover',
                              borderRadius: '0.25rem',
                              marginTop: '0.5rem'
                            }} 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="modal-footer border-0">
                    <button type="button" className="btn rounded-pill" onClick={() => setShowEdit(false)} style={{ borderColor: '#6c757d', color: '#6c757d', backgroundColor: 'transparent' }}>
                      <i className="bi bi-x-circle me-2"></i>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-lg fw-bold rounded-pill" style={{ backgroundColor: '#14b8a6', borderColor: '#14b8a6', color: 'white' }} disabled={updating}>
                      {updating ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Updating...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Update Subject
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default AdminSubjects; 
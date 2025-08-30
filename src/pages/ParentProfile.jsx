import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import groupImg from '../assets/images/Group.png';
import objectImg from '../assets/images/Object.png';
import Footer from '../components/Footer';

const ParentProfile = () => {
    const [step, setStep] = useState(1);
    const [profile, setProfile] = useState({ 
        name: '', 
        email: '', 
        location: '',
        childName: '',
        childAge: '',
        childGrade: '',
        childLearningGoals: '',
        childSpecialNeeds: ''
    });
    const [subjects, setSubjects] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const [profileRes, subjectsRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
                        headers: { 'Authorization': token ? `Bearer ${token}` : '' },
                    }),
                    fetch(`${import.meta.env.VITE_API_URL}/api/subjects`, {
                        headers: { 'Authorization': token ? `Bearer ${token}` : '' },
                    })
                ]);
                
                const profileData = await profileRes.json();
                const subjectsData = await subjectsRes.json();
                
                if (profileData.success && profileData.user) {
                    setProfile({
                        name: profileData.user.name || '',
                        email: profileData.user.email || '',
                        location: profileData.user.location || '',
                        childName: profileData.user.childName || '',
                        childAge: profileData.user.childAge || '',
                        childGrade: profileData.user.childGrade || '',
                        childLearningGoals: profileData.user.childLearningGoals || '',
                        childSpecialNeeds: profileData.user.childSpecialNeeds || ''
                    });
                    if (profileData.user.childPreferredSubjects && profileData.user.childPreferredSubjects.length > 0) {
                        setSelectedSubjects(profileData.user.childPreferredSubjects.map(subj => typeof subj === 'string' ? subj : subj._id));
                    } else {
                        setSelectedSubjects([]);
                    }
                    if (profileData.user.profileImage) {
                        let img = profileData.user.profileImage;
                        if (img.startsWith('/uploads/')) {
                            img = `${import.meta.env.VITE_API_URL}${img}`;
                        }
                        setImagePreview(img);
                    }
                } else {
                    setError(profileData.message || 'Failed to fetch profile');
                }
                
                if (subjectsData.success) {
                    setSubjects(subjectsData.data.subjects || []);
                }
            } catch (err) {
                setError('Failed to fetch profile');
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    const handleChange = e => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSubjectSelect = (subjId) => {
        if (!selectedSubjects.some(s => (s._id || s) === subjId)) {
            setSelectedSubjects([...selectedSubjects, subjId]);
        }
    };

    const handleSubjectRemove = (subjId) => {
        setSelectedSubjects(selectedSubjects.filter(s => (s._id || s) !== subjId));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async e => {
        e.preventDefault();
        setEditing(true);
        setSuccess(null);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            
            const formData = new FormData();
            formData.append('name', profile.name);
            formData.append('location', profile.location);
            formData.append('childName', profile.childName);
            formData.append('childAge', profile.childAge);
            formData.append('childGrade', profile.childGrade);
            formData.append('childPreferredSubjects', JSON.stringify(selectedSubjects.map(s => s._id || s)));
            formData.append('childLearningGoals', profile.childLearningGoals);
            formData.append('childSpecialNeeds', profile.childSpecialNeeds);
            
            if (profileImage) {
                formData.append('profileImage', profileImage);
            }

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
                method: 'PUT',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                setSuccess('Profile updated successfully!');
                if (step === 1) {
                    setStep(2);
                }
            } else {
                setError(data.message || 'Failed to update profile');
            }
        } catch (err) {
            setError('Failed to update profile');
        }
        setEditing(false);
    };

    if (loading) return <div className="d-flex justify-content-center p-5"><div className="spinner-border" style={{color: '#2DB8A1'}} role="status"><span className="visually-hidden">Loading...</span></div></div>;

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
                <div className="col-md-8">
                  <div className="card border-0 shadow-sm rounded-4" style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <div className="card-body p-5">
                      <div className="text-center mb-4">
                        <h2 className="fw-bold fs-3 mb-2" style={{ color: '#14b8a6' }}>
                          <i className="bi bi-person-circle me-2"></i>
                          Student Profile
                        </h2>
                        <div className="d-flex justify-content-center align-items-center">
                          <div className={`badge ${step >= 1 ? 'bg-primary' : 'bg-secondary'} rounded-pill px-3 py-2 me-2`} style={{ backgroundColor: step >= 1 ? '#14b8a6' : '#6c757d' }}>
                            <i className="bi bi-person me-1"></i>Student Info
                          </div>
                          <div className="text-muted me-2">→</div>
                          <div className={`badge ${step >= 2 ? 'bg-primary' : 'bg-secondary'} rounded-pill px-3 py-2`} style={{ backgroundColor: step >= 2 ? '#14b8a6' : '#6c757d' }}>
                            <i className="bi bi-info-circle me-1"></i>Additional Details
                          </div>
                        </div>
                      </div>

                      {step === 1 ? (
                        // Step 1: Student Information
                        <form onSubmit={handleSave}>
                          <h4 className="fw-bold mb-3" style={{ color: '#14b8a6' }}>
                            <i className="bi bi-person me-2"></i>
                            Student Information
                          </h4>
                          {/* Profile Image */}
                          <div className="mb-4">
                            <label className="form-label fw-bold" style={{ color: '#14b8a6' }}>
                              <i className="bi bi-camera me-2"></i>
                              Student Profile Picture (Optional)
                            </label>
                            <div className="d-flex align-items-center gap-3">
                              <div>
                                <img 
                                  src={imagePreview || 'https://via.placeholder.com/100x100/14b8a6/ffffff?text=' + (profile.childName?.charAt(0) || 'S')} 
                                  alt="Profile" 
                                  style={{ 
                                    width: '100px', 
                                    height: '100px', 
                                    objectFit: 'cover',
                                    borderRadius: '50%',
                                    border: '3px solid #14b8a6'
                                  }} 
                                />
                              </div>
                              <div className="flex-grow-1">
                                <input 
                                  type="file" 
                                  className="form-control" 
                                  accept="image/*"
                                  onChange={handleImageChange}
                                  style={{ borderColor: '#e2e8f0', borderRadius: '0.5rem' }}
                                />
                                <small className="text-muted">Max file size: 5MB. Supported formats: JPG, PNG, GIF</small>
                              </div>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label className="form-label fw-bold" style={{ color: '#14b8a6' }}>Student Name</label>
                              <input type="text" className="form-control" name="childName" value={profile.childName} onChange={handleChange} required style={{ borderColor: '#e2e8f0', borderRadius: '0.5rem' }} />
                            </div>
                            <div className="col-md-3 mb-3">
                              <label className="form-label fw-bold" style={{ color: '#14b8a6' }}>Age</label>
                              <input type="number" className="form-control" name="childAge" value={profile.childAge} onChange={handleChange} min="3" max="18" style={{ borderColor: '#e2e8f0', borderRadius: '0.5rem' }} />
                            </div>
                            <div className="col-md-3 mb-3">
                              <label className="form-label fw-bold" style={{ color: '#14b8a6' }}>Grade</label>
                              <select className="form-select" name="childGrade" value={profile.childGrade} onChange={handleChange} style={{ borderColor: '#e2e8f0', borderRadius: '0.5rem' }}>
                                <option value="">Select Grade</option>
                                <option value="Pre-K">Pre-K</option>
                                <option value="Kindergarten">Kindergarten</option>
                                <option value="1st Grade">1st Grade</option>
                                <option value="2nd Grade">2nd Grade</option>
                                <option value="3rd Grade">3rd Grade</option>
                                <option value="4th Grade">4th Grade</option>
                                <option value="5th Grade">5th Grade</option>
                                <option value="6th Grade">6th Grade</option>
                                <option value="7th Grade">7th Grade</option>
                                <option value="8th Grade">8th Grade</option>
                                <option value="9th Grade">9th Grade</option>
                                <option value="10th Grade">10th Grade</option>
                                <option value="11th Grade">11th Grade</option>
                                <option value="12th Grade">12th Grade</option>
                              </select>
                            </div>
                          </div>
                          <div className="mb-3">
                            <label className="form-label fw-bold" style={{ color: '#14b8a6' }}>
                              <i className="bi bi-book me-2"></i>
                              Preferred Subjects
                            </label>
                            <div className="d-flex flex-wrap gap-2 mb-2">
                              {selectedSubjects.map(subj => (
                                <span key={subj._id || subj} className="badge px-3 py-2" style={{ backgroundColor: '#14b8a6' }}>
                                  {(subjects.find(s => s._id === (subj._id || subj))?.name) || 'Unknown Subject'} <span style={{ cursor: 'pointer', marginLeft: 6 }} onClick={() => handleSubjectRemove(subj)}>&times;</span>
                                </span>
                              ))}
                            </div>
                            <select className="form-select" onChange={e => {
                              const subj = subjects.find(s => s._id === e.target.value);
                              if (subj) handleSubjectSelect(subj._id);
                            }} value="" style={{ borderColor: '#e2e8f0', borderRadius: '0.5rem' }}>
                              <option value="">Add subject...</option>
                              {subjects.filter(s => !selectedSubjects.some(sel => (sel._id || sel) === s._id || sel === s._id)).map(s => (
                                <option key={s._id} value={s._id}>{s.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="mb-3">
                            <label className="form-label fw-bold" style={{ color: '#14b8a6' }}>
                              <i className="bi bi-target me-2"></i>
                              Learning Goals
                            </label>
                            <textarea className="form-control" name="childLearningGoals" value={profile.childLearningGoals} onChange={handleChange} rows="3" placeholder="What are the student's learning goals? (e.g., improve math skills, prepare for exams, etc.)" style={{ borderColor: '#e2e8f0', borderRadius: '0.5rem' }}></textarea>
                          </div>
                          <div className="mb-3">
                            <label className="form-label fw-bold" style={{ color: '#14b8a6' }}>
                              <i className="bi bi-heart me-2"></i>
                              Special Needs or Requirements
                            </label>
                            <textarea className="form-control" name="childSpecialNeeds" value={profile.childSpecialNeeds} onChange={handleChange} rows="2" placeholder="Any special learning needs, accommodations, or preferences? (Optional)" style={{ borderColor: '#e2e8f0', borderRadius: '0.5rem' }}></textarea>
                          </div>
                          {success && <div className="alert alert-success" style={{ backgroundColor: 'rgba(25, 135, 84, 0.1)', borderColor: '#198754', color: '#198754' }}>{success}</div>}
                          {error && <div className="alert alert-danger" style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)', borderColor: '#dc3545', color: '#dc3545' }}>{error}</div>}
                          <button className="btn w-100 fw-bold" type="submit" disabled={editing} style={{ backgroundColor: '#14b8a6', borderColor: '#14b8a6', color: 'white', borderRadius: '0.75rem' }}>
                            {editing ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Saving...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-arrow-right me-2"></i>
                                Next: Parent Details
                              </>
                            )}
                          </button>
                        </form>
                      ) : (
                        // Step 2: Parent Information
                        <form onSubmit={handleSave}>
                          <h4 className="fw-bold mb-3" style={{ color: '#14b8a6' }}>
                            <i className="bi bi-info-circle me-2"></i>
                            Parent Information
                          </h4>
                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label className="form-label fw-bold" style={{ color: '#14b8a6' }}>Parent Name</label>
                              <input type="text" className="form-control" name="name" value={profile.name} onChange={handleChange} required style={{ borderColor: '#e2e8f0', borderRadius: '0.5rem' }} />
                            </div>
                            <div className="col-md-6 mb-3">
                              <label className="form-label fw-bold" style={{ color: '#14b8a6' }}>Email</label>
                              <input type="email" className="form-control" name="email" value={profile.email} onChange={handleChange} required disabled style={{ borderColor: '#e2e8f0', borderRadius: '0.5rem' }} />
                            </div>
                          </div>
                          <div className="mb-3">
                            <label className="form-label fw-bold" style={{ color: '#14b8a6' }}>
                              <i className="bi bi-geo-alt me-2"></i>
                              Location
                            </label>
                            <input type="text" className="form-control" name="location" value={profile.location} onChange={handleChange} placeholder="City, State" style={{ borderColor: '#e2e8f0', borderRadius: '0.5rem' }} />
                          </div>
                          {success && <div className="alert alert-success" style={{ backgroundColor: 'rgba(25, 135, 84, 0.1)', borderColor: '#198754', color: '#198754' }}>{success}</div>}
                          {error && <div className="alert alert-danger" style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)', borderColor: '#dc3545', color: '#dc3545' }}>{error}</div>}
                          <div className="d-flex gap-2">
                            <button type="button" className="btn flex-fill" onClick={() => setStep(1)} style={{ borderColor: '#6c757d', color: '#6c757d', backgroundColor: 'transparent', borderRadius: '0.75rem' }}>
                              <i className="bi bi-arrow-left me-1"></i>Back
                            </button>
                            <button className="btn flex-fill fw-bold" type="submit" disabled={editing} style={{ backgroundColor: '#14b8a6', borderColor: '#14b8a6', color: 'white', borderRadius: '0.75rem' }}>
                              {editing ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-check-circle me-2"></i>
                                  Save Profile
                                </>
                              )}
                            </button>
                          </div>
                        </form>
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
};

export default ParentProfile; 
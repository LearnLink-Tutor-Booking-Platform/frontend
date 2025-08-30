import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import groupImg from '../assets/images/Group.png';
import objectImg from '../assets/images/Object.png';
import blobImg from '../assets/images/blob.png';
import studentsImg from '../assets/images/students.png';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

function ParentRegister() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Student details
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [childGrade, setChildGrade] = useState('');
  const [childLearningGoals, setChildLearningGoals] = useState('');
  const [childSpecialNeeds, setChildSpecialNeeds] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/subjects`).then(res => {
      if (res.data.success) setSubjects(res.data.data.subjects);
    });
  }, []);

  const handleSubjectSelect = (subj) => {
    if (!selectedSubjects.some(s => s._id === subj._id)) {
      setSelectedSubjects([...selectedSubjects, subj]);
    }
  };
  
  const handleSubjectRemove = (subj) => {
    setSelectedSubjects(selectedSubjects.filter(s => s._id !== subj._id));
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

  const handleNextStep = () => {
    if (step === 1) {
      if (!childName || !childAge || !childGrade || !email) {
        setError('Please fill in all required fields');
        return;
      }
      setError('');
      setStep(2);
    } else if (step === 2) {
      if (selectedSubjects.length === 0) {
        setError('Please select at least one subject');
        return;
      }
      setError('');
      setStep(3);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('role', 'parent');
      formData.append('location', location);
      formData.append('preferredSubjects', JSON.stringify(selectedSubjects.map(s => s._id)));
      formData.append('childName', childName);
      formData.append('childAge', childAge);
      formData.append('childGrade', childGrade);
      formData.append('childPreferredSubjects', JSON.stringify(selectedSubjects.map(s => s._id)));
      formData.append('childLearningGoals', childLearningGoals);
      formData.append('childSpecialNeeds', childSpecialNeeds);
      
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }

      const res = await axios.post(`${API_BASE_URL}/api/auth/register`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      localStorage.setItem('token', res.data.token);
      setLoading(false);
      navigate('/parent-login');
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.msg || 'Registration failed');
    }
  };

  return (
    step === 1 ? (
      <div className="login-root" style={{ minHeight: '100vh', background: '#fff', display: 'flex' }}>
        {/* Left Side: blob.png as background, students.png centered */}
        <div className="login-illustration d-none d-md-flex flex-column justify-content-center align-items-center" style={{ flex: 1, minHeight: '100vh', padding: 0, background: `url(${blobImg}) center center / cover no-repeat` }}>
          <img src={studentsImg} alt="students" style={{ width: 560, maxWidth: '80%', zIndex: 2 }} />
        </div>
        {/* Right Side: Registration Form */}
        <div className="login-form-col d-flex flex-column justify-content-center align-items-center" style={{ flex: 1, background: '#fff', minHeight: '100vh', padding: '0 2rem' }}>
          <div className="login-form-box" style={{ width: 400, maxWidth: '100%', background: '#fff', borderRadius: 18, boxShadow: '0 4px 32px rgba(0,0,0,0.07)', padding: '2.5rem 2rem', margin: '2rem 0' }}>
            <h2 className="fw-bold mb-2" style={{ fontSize: 28 }}>Student Registration</h2>
            <div className="mb-3 text-secondary" style={{ fontSize: 16 }}>Tell us about the student</div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Student Profile Picture (Optional)</label>
              <input 
                type="file" 
                className="form-control" 
                accept="image/*"
                onChange={handleImageChange}
              />
              <small className="text-muted">Max file size: 5MB. Supported formats: JPG, PNG, GIF</small>
              {imagePreview && (
                <div className="mt-2">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    style={{ 
                      maxWidth: '100px', 
                      maxHeight: '100px', 
                      objectFit: 'cover',
                      borderRadius: '50%',
                      border: '2px solid #14b8a6'
                    }} 
                  />
                </div>
              )}
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Student Name</label>
              <input type="text" className="form-control" value={childName} onChange={e => setChildName(e.target.value)} required />
            </div>
            <div className="row mb-3">
              <div className="col-6">
                <label className="form-label fw-semibold">Student Age</label>
                <input type="number" className="form-control" value={childAge} onChange={e => setChildAge(e.target.value)} min="3" max="18" required />
              </div>
              <div className="col-6">
                <label className="form-label fw-semibold">Student Grade</label>
                <select className="form-select" value={childGrade} onChange={e => setChildGrade(e.target.value)} required>
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
              <label className="form-label fw-semibold">Student Learning Goals</label>
              <textarea className="form-control" value={childLearningGoals} onChange={e => setChildLearningGoals(e.target.value)} rows="3" placeholder="What are the student's learning goals? (e.g., improve math skills, prepare for exams, etc.)"></textarea>
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Special Needs or Requirements</label>
              <textarea className="form-control" value={childSpecialNeeds} onChange={e => setChildSpecialNeeds(e.target.value)} rows="2" placeholder="Any special learning needs, accommodations, or preferences? (Optional)"></textarea>
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Email address</label>
              <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            {error && <div className="alert alert-danger py-2 small mb-2">{error}</div>}
            <button type="button" className="btn w-100 fw-bold" style={{ background: '#14b8a6', color: '#fff', fontSize: 18, borderRadius: 8 }} onClick={handleNextStep}>
              Next: Preferred Subjects
            </button>
          </div>
        </div>
        <style>{`
          .login-root { font-family: 'Inter', sans-serif; }
          .cloud { box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
          @media (max-width: 900px) {
            .login-illustration { display: none !important; }
            .login-form-col { flex: 1 1 100%; min-width: 0; }
          }
        `}</style>
      </div>
    ) : step === 2 ? (
      <div style={{ minHeight: '100vh', background: '#7ee3f2', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Clouds at the top */}
        <img src={groupImg} alt="clouds" style={{ position: 'absolute', top: 0, left: 0, width: '100%', maxWidth: '100vw', zIndex: 0, pointerEvents: 'none' }} />
        {/* Buildings at the bottom */}
        <img src={objectImg} alt="buildings" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', maxWidth: '100vw', zIndex: 0, pointerEvents: 'none' }} />
        <div className="shadow-sm" style={{ background: '#fff', borderRadius: 20, padding: '2.5rem 2rem', minWidth: 400, maxWidth: 500, width: '100%', zIndex: 1, position: 'relative' }}>
          <div className="mb-4 d-flex justify-content-center align-items-center">
            <div className={`badge bg-primary rounded-pill px-3 py-2 me-2`}>
              <i className="bi bi-person me-1"></i>Student
            </div>
            <div className="text-muted me-2">→</div>
            <div className={`badge bg-primary rounded-pill px-3 py-2 me-2`}>
              <i className="bi bi-book me-1"></i>Preferred Subjects
            </div>
            <div className="text-muted me-2">→</div>
            <div className={`badge bg-secondary rounded-pill px-3 py-2`}>
              <i className="bi bi-info-circle me-1"></i>Parent Details
            </div>
          </div>
          <h2 className="fw-bold mb-2" style={{ fontSize: 28 }}>Preferred Subjects</h2>
          <div className="mb-3 text-secondary" style={{ fontSize: 16 }}>Select the subjects your child is interested in</div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Preferred Subjects</label>
            <div className="d-flex flex-wrap gap-2 mb-2">
              {selectedSubjects.map(subj => (
                <span key={subj._id} className="badge bg-secondary px-3 py-2" style={{ fontSize: 15 }}>
                  {subj.name} <span style={{ cursor: 'pointer', marginLeft: 6 }} onClick={() => handleSubjectRemove(subj)}>&times;</span>
                </span>
              ))}
            </div>
            <select className="form-select" onChange={e => {
              const subj = subjects.find(s => s._id === e.target.value);
              if (subj) handleSubjectSelect(subj);
            }} value="">
              <option value="">Add subject...</option>
              {subjects.filter(s => !selectedSubjects.some(sel => sel._id === s._id)).map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>
          {error && <div className="alert alert-danger py-2 small mb-2">{error}</div>}
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-outline-secondary flex-fill" onClick={() => setStep(1)}>
              <i className="bi bi-arrow-left me-1"></i>Back
            </button>
            <button type="button" className="btn flex-fill fw-bold" style={{ background: '#14b8a6', color: '#fff', fontSize: 18, borderRadius: 8 }} onClick={handleNextStep}>
              Next: Parent Details
            </button>
          </div>
        </div>
      </div>
    ) : (
      <div style={{ minHeight: '100vh', background: '#7ee3f2', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Clouds at the top */}
        <img src={groupImg} alt="clouds" style={{ position: 'absolute', top: 0, left: 0, width: '100%', maxWidth: '100vw', zIndex: 0, pointerEvents: 'none' }} />
        {/* Buildings at the bottom */}
        <img src={objectImg} alt="buildings" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', maxWidth: '100vw', zIndex: 0, pointerEvents: 'none' }} />
        <div className="shadow-sm" style={{ background: '#fff', borderRadius: 20, padding: '2.5rem 2rem', minWidth: 400, maxWidth: 500, width: '100%', zIndex: 1, position: 'relative' }}>
          <div className="mb-4 d-flex justify-content-center align-items-center">
            <div className={`badge bg-primary rounded-pill px-3 py-2 me-2`}>
              <i className="bi bi-person me-1"></i>Student
            </div>
            <div className="text-muted me-2">→</div>
            <div className={`badge bg-primary rounded-pill px-3 py-2 me-2`}>
              <i className="bi bi-book me-1"></i>Preferred Subjects
            </div>
            <div className="text-muted me-2">→</div>
            <div className={`badge bg-primary rounded-pill px-3 py-2`}>
              <i className="bi bi-info-circle me-1"></i>Parent Details
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <h2 className="fw-bold mb-2" style={{ fontSize: 28 }}>Additional Details</h2>
            <div className="mb-3">
              <label className="form-label fw-semibold">Parent Full Name</label>
              <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Location</label>
              <input type="text" className="form-control" value={location} onChange={e => setLocation(e.target.value)} autoComplete="off" placeholder="City, State" />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Password</label>
              <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {error && <div className="alert alert-danger py-2 small mb-2">{error}</div>}
            <div className="d-flex gap-2">
              <button type="button" className="btn btn-outline-secondary flex-fill" onClick={() => setStep(2)}>
                <i className="bi bi-arrow-left me-1"></i>Back
              </button>
              <button type="submit" className="btn flex-fill fw-bold" style={{ background: '#14b8a6', color: '#fff', fontSize: 18, borderRadius: 8 }} disabled={loading}>
                {loading ? 'Registering...' : 'Sign Up'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );
}

export default ParentRegister; 
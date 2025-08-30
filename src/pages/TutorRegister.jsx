import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import groupImg from '../assets/images/Group.png';
import objectImg from '../assets/images/Object.png';

const API_BASE_URL = `${import.meta.env.VITE_API_URL}`;

function TutorRegister() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [education, setEducation] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]); // [{subject, hourlyRate, hours}]
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/subjects`).then(res => {
      if (res.data.success) setSubjects(res.data.data.subjects);
    });
  }, []);

  const handleSubjectAdd = (subj) => {
    if (!selectedSubjects.some(s => s.subject === subj._id)) {
      setSelectedSubjects([...selectedSubjects, { subject: subj._id, hourlyRate: '', hours: 0, title: '', name: subj.name }]);
    }
  };
  const handleSubjectRemove = (subjId) => {
    setSelectedSubjects(selectedSubjects.filter(s => s.subject !== subjId));
  };
  const handleSubjectChange = (subjId, field, value) => {
    setSelectedSubjects(selectedSubjects.map(s => s.subject === subjId ? { ...s, [field]: value } : s));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('role', 'tutor');
      formData.append('education', education);
      formData.append('bio', bio);
      formData.append('location', location);
      formData.append('experience', experience);
      
      const subjectsData = selectedSubjects.map(s => ({ 
        subject: s.subject, 
        hourlyRate: Number(s.hourlyRate) || 0, 
        hours: Number(s.hours) || 0,
        title: s.title || ''
      }));
      
      console.log('Frontend - Subjects data being sent:', subjectsData);
      formData.append('subjects', JSON.stringify(subjectsData));
      
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
      navigate('/tutor-login');
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.msg || 'Registration failed');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <>
          <h2 className="fw-bold mb-2" style={{ fontSize: 28 }}>Tutor Registration</h2>
          <div className="mb-3 text-secondary" style={{ fontSize: 16 }}>Enter your basic information</div>
          <div className="mb-3">
            <label className="form-label">Profile Picture (Optional)</label>
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
          <div className="mb-3"><label className="form-label">Full Name</label><input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required /></div>
          <div className="mb-3"><label className="form-label">Email address</label><input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          <div className="mb-3"><label className="form-label">Password</label><input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required /></div>
        </>;
      case 2:
        return <>
          <h2 className="fw-bold mb-2" style={{ fontSize: 28 }}>Profile Details</h2>
          <div className="mb-3 text-secondary" style={{ fontSize: 16 }}>Tell us more about yourself</div>
          <div className="mb-3"><label className="form-label">Education</label><input type="text" className="form-control" value={education} onChange={e => setEducation(e.target.value)} required /></div>
          <div className="mb-3"><label className="form-label">Location</label><input type="text" className="form-control"  autoComplete="off" value={location} onChange={e => setLocation(e.target.value)} required /></div>
          <div className="mb-3"><label className="form-label">Experience</label><input type="text" className="form-control" value={experience} onChange={e => setExperience(e.target.value)} required /></div>
          <div className="mb-3"><label className="form-label">Bio</label><textarea className="form-control" value={bio} onChange={e => setBio(e.target.value)} rows={3} required /></div>
        </>;
      case 3:
        return <>
          <h2 className="fw-bold mb-2" style={{ fontSize: 28 }}>Subjects You Teach</h2>
          <div className="mb-3 text-secondary" style={{ fontSize: 16 }}>Add all subjects you can teach, with your hourly rate and experience</div>
          <div className="mb-3">
            <label className="form-label">Add Subject</label>
            <select className="form-select" onChange={e => {
              const subj = subjects.find(s => s._id === e.target.value);
              if (subj) handleSubjectAdd(subj);
            }} value="">
              <option value="">Select subject...</option>
              {subjects.filter(s => !selectedSubjects.some(sel => sel.subject === s._id)).map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="d-flex flex-wrap gap-2 mb-2">
            {selectedSubjects.map(s => (
              <div key={s.subject} className="d-flex align-items-center gap-2 bg-light px-3 py-2 rounded-3">
                <span className="fw-semibold">{s.name}</span>
                <input type="number" className="form-control" style={{ width: 90 }} placeholder="Rate" value={s.hourlyRate} onChange={e => handleSubjectChange(s.subject, 'hourlyRate', e.target.value)} min="1" required />
                <input type="number" className="form-control" style={{ width: 70 }} placeholder="Hours" value={s.hours} onChange={e => handleSubjectChange(s.subject, 'hours', e.target.value)} min="0" required />
                <input type="text" className="form-control" style={{ width: 120 }} placeholder="Title" value={s.title} onChange={e => handleSubjectChange(s.subject, 'title', e.target.value)} />
                <span style={{ cursor: 'pointer', color: '#e11d48', fontWeight: 'bold' }} onClick={() => handleSubjectRemove(s.subject)}>&times;</span>
              </div>
            ))}
          </div>
        </>;
      case 4:
        return <>
          <h2 className="fw-bold mb-2" style={{ fontSize: 28 }}>Review & Submit</h2>
          <div className="mb-3 text-secondary" style={{ fontSize: 16 }}>Please review your details before submitting</div>
          <div className="mb-2"><b>Name:</b> {name}</div>
          <div className="mb-2"><b>Email:</b> {email}</div>
          <div className="mb-2"><b>Education:</b> {education}</div>
          <div className="mb-2"><b>Location:</b> {location}</div>
          <div className="mb-2"><b>Experience:</b> {experience}</div>
          <div className="mb-2"><b>Bio:</b> {bio}</div>
          <div className="mb-2"><b>Subjects:</b></div>
          {selectedSubjects.map(s => (
            <div key={s.subject} className="mb-1 ms-3">
              • {s.name} - Rate: Rs.{s.hourlyRate}/hr, Hours: {s.hours}, Title: {s.title || 'N/A'}
            </div>
          ))}
          {imagePreview && (
            <div className="mb-2">
              <b>Profile Picture:</b> 
              <img 
                src={imagePreview} 
                alt="Preview" 
                style={{ 
                  maxWidth: '50px', 
                  maxHeight: '50px', 
                  objectFit: 'cover',
                  borderRadius: '50%',
                  marginLeft: '10px'
                }} 
              />
            </div>
          )}
        </>;
      default:
        return null;
    }
  };

  const canContinue = () => {
    switch (step) {
      case 1:
        return name && email && password;
      case 2:
        return education && bio && location && experience;
      case 3:
        return selectedSubjects.length > 0 && selectedSubjects.every(s => s.hourlyRate && s.hours !== '');
      default:
        return true;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#7ee3f2', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Clouds at the top */}
      <img src={groupImg} alt="clouds" style={{ position: 'absolute', top: 0, left: 0, width: '100%', maxWidth: '100vw', zIndex: 0, pointerEvents: 'none' }} />
      {/* Buildings at the bottom */}
      <img src={objectImg} alt="buildings" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', maxWidth: '100vw', zIndex: 0, pointerEvents: 'none' }} />
      {/* Registration Card */}
      <form className="shadow-sm" style={{ background: '#fff', borderRadius: 20, padding: '2.5rem 2rem', minWidth: 370, maxWidth: 420, width: '100%', zIndex: 1, position: 'relative' }} onSubmit={handleSubmit}>
        <div className="mb-3 d-flex align-items-center gap-2">
          <button type="button" className="btn btn-light btn-sm rounded-circle" style={{ fontSize: 20 }} onClick={() => setStep(step - 1)} disabled={step === 1}>&larr;</button>
          <span className="fw-bold text-info">Back</span>
          <span className="ms-auto text-secondary small">Step {step}/4</span>
        </div>
        {renderStep()}
        {error && <div className="alert alert-danger py-2 small mb-2">{error}</div>}
        <div className="d-flex justify-content-end mt-4">
          {step < 4 ? (
            <button type="button" className="btn fw-bold" style={{ background: '#14b8a6', color: '#fff', fontSize: 18, borderRadius: 8 }} disabled={!canContinue()} onClick={() => setStep(step + 1)}>Continue</button>
          ) : (
            <button type="submit" className="btn fw-bold" style={{ background: '#14b8a6', color: '#fff', fontSize: 18, borderRadius: 8 }} disabled={loading}>{loading ? 'Registering...' : 'Submit'}</button>
          )}
        </div>
      </form>
    </div>
  );
}

export default TutorRegister; 
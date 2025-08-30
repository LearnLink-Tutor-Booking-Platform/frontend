import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link, useNavigate } from 'react-router-dom';
import blobImg from '../assets/images/blob.png';
import studentsImg from '../assets/images/students.png';
import groupImg from '../assets/images/Group.png';
import objectImg from '../assets/images/Object.png';
import Footer from '../components/Footer';

const API_URL = `${import.meta.env.VITE_API_URL}/api/tutor/profile`;
const SUBJECTS_API_URL = `${import.meta.env.VITE_API_URL}/api/tutor/subjects`;
const ALL_SUBJECTS_API_URL = `${import.meta.env.VITE_API_URL}/api/subjects`;

// Reusable Tag Input component for subjects and expertise
const TagInput = ({ label, placeholder, value, onChange }) => {
    const [inputValue, setInputValue] = useState('');
    const tags = Array.isArray(value) ? value : [];

    const handleKeyDown = (e) => {
        if (e.key !== 'Enter' && e.key !== ',') return;
        e.preventDefault();
        const newTag = inputValue.trim();
        if (!newTag || tags.includes(newTag)) {
            setInputValue('');
            return;
        };
        onChange({ target: { value: [...tags, newTag].join(', ') } });
        setInputValue('');
    };

    const removeTag = (tagToRemove) => {
        const newTags = tags.filter(tag => tag !== tagToRemove);
        onChange({ target: { value: newTags.join(', ') } });
    };

    return (
        <div className="mb-3">
            <label className="form-label">{label}</label>
            <div className="tags-input-container form-control">
                {tags.map(tag => (
                    <div className="tag-item" key={tag}>
                        <span className="text">{tag}</span>
                        <span className="close" onClick={() => removeTag(tag)}>&times;</span>
                    </div>
                ))}
                <input
                    type="text"
                    className="tags-input"
                    placeholder={placeholder}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
            </div>
        </div>
    );
};

// --- Wizard Header ---
const WizardHeader = () => (
    <header className="position-absolute top-0 start-0 w-100 p-3">
        <nav className="container navbar navbar-expand-lg navbar-dark">
            <Link className="navbar-brand fw-bold fs-4" to="/dashboard">LearnLink</Link>
            <div className="collapse navbar-collapse">
                <ul className="navbar-nav mx-auto">
                    <li className="nav-item"><Link className="nav-link" to="/dashboard">Dashboard</Link></li>
                </ul>
                <Link to="/dashboard" className="btn btn-outline-light btn-sm">Exit Editor</Link>
            </div>
        </nav>
    </header>
);

const TutorProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [allSubjects, setAllSubjects] = useState([]);
    const [subjectToAdd, setSubjectToAdd] = useState('');
    const [subjectRateToAdd, setSubjectRateToAdd] = useState('');
    const [subjectTitleToAdd, setSubjectTitleToAdd] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const res = await fetch(ALL_SUBJECTS_API_URL);
                const data = await res.json();
                if (data.success) {
                    setAllSubjects(data.data.subjects);
                }
            } catch (err) {}
        };
        fetchSubjects();
    }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(API_URL, { headers: { 'Authorization': `Bearer ${token}` } });
                const data = await res.json();
                if (data.success) {
                    // Normalize subjects to array of { subject, hourlyRate }
                    let normalizedSubjects = [];
                    if (Array.isArray(data.data.subjects)) {
                        normalizedSubjects = data.data.subjects.map(s => {
                            if (s.subject && s.hourlyRate !== undefined) return s;
                            if (typeof s === 'object' && s._id) return { subject: s._id, hourlyRate: '' };
                            return { subject: s, hourlyRate: '' };
                        });
                    }
                    setProfile({ ...data.data, subjects: normalizedSubjects });
                } else {
                    throw new Error(data.message || 'Failed to fetch profile');
                }
            } catch (err) {
                setError(err.message);
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile((prev) => ({ ...prev, [name]: value }));
    };

    const handleArrayChange = (e, field) => {
        const value = typeof e.target.value === 'string' ? e.target.value : '';
        setProfile((prev) => ({ ...prev, [field]: value.split(',').map(s => s.trim()).filter(Boolean) }));
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

    // Add subject with rate and title
    const handleAddSubject = () => {
        if (!subjectToAdd || !subjectRateToAdd) return;
        if (profile.subjects.some(s => s.subject === subjectToAdd)) return;
        setProfile(prev => ({
            ...prev,
            subjects: [...prev.subjects, { subject: subjectToAdd, hourlyRate: subjectRateToAdd, title: subjectTitleToAdd }]
        }));
        setSubjectToAdd('');
        setSubjectRateToAdd('');
        setSubjectTitleToAdd('');
    };

    // Remove subject
    const handleRemoveSubject = (subjectId) => {
        setProfile(prev => ({
            ...prev,
            subjects: prev.subjects.filter(s => s.subject !== subjectId)
        }));
    };

    // Update hourly rate for a subject
    const handleSubjectRateChange = (subjectId, rate) => {
        setProfile(prev => ({
            ...prev,
            subjects: prev.subjects.map(s => s.subject === subjectId ? { ...s, hourlyRate: rate } : s)
        }));
    };

    // Add handler for hours change
    const handleSubjectHoursChange = (subjectId, hours) => {
        setProfile(prev => ({
            ...prev,
            subjects: prev.subjects.map(s => s.subject === subjectId ? { ...s, hours: hours } : s)
        }));
    };

    // Update title for a subject
    const handleSubjectTitleChange = (subjectId, title) => {
        setProfile(prev => ({
            ...prev,
            subjects: prev.subjects.map(s => s.subject === subjectId ? { ...s, title } : s)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            // Remove duplicates
            const subjects = Array.from(new Set(profile.subjects.map(s => JSON.stringify(s)))).map(s => JSON.parse(s));
            
            const formData = new FormData();
            formData.append('name', profile.name);
            formData.append('subjects', JSON.stringify(subjects));
            formData.append('expertise', JSON.stringify(profile.expertise));
            formData.append('location', profile.location);
            formData.append('bio', profile.bio || '');
            formData.append('education', profile.education || '');
            formData.append('experience', profile.experience || '');
            
            if (profileImage) {
                formData.append('profileImage', profileImage);
            }

            const res = await fetch(API_URL, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Profile Updated!',
                    text: 'Your profile has been updated successfully.',
                    confirmButtonColor: '#14b8a6',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    navigate('/dashboard');
                });
            } else {
                throw new Error(data.message || 'Failed to update profile');
            }
        } catch (err) {
            setError(err.message);
        }
        setSaving(false);
    };

    if (loading || !profile) {
        return <div className="text-center mt-5"><div className="spinner-border text-primary" role="status"></div></div>;
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
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <div className="card shadow-sm rounded-4 p-4" style={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(10px)'
                            }}>
                                <h2 className="fw-bold mb-4" style={{ color: '#14b8a6' }}>
                                    <i className="bi bi-person-gear me-2"></i>
                                    Edit Profile
                                </h2>
                                {error && <div className="alert alert-danger" style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)', borderColor: '#dc3545', color: '#dc3545' }}>{error}</div>}
                                <form onSubmit={handleSubmit}>
                                    {/* Profile Image */}
                                    <div className="mb-4">
                                        <label className="form-label fw-bold" style={{ color: '#14b8a6' }}>
                                            <i className="bi bi-camera me-2"></i>
                                            Profile Picture
                                        </label>
                                        <div className="d-flex align-items-center gap-3">
                                            <div>
                                                <img 
                                                    src={imagePreview || (profile.profileImage ? `${import.meta.env.VITE_API_URL}${profile.profileImage}` : 'https://via.placeholder.com/100x100/14b8a6/ffffff?text=' + profile.name?.charAt(0))} 
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

                                    {/* Basic Information */}
                                    <div className="mb-3">
                                        <label className="form-label fw-bold" style={{ color: '#14b8a6' }}>
                                            <i className="bi bi-person me-2"></i>
                                            Full Name
                                        </label>
                                        <input type="text" className="form-control" name="name" value={profile.name || ''} onChange={handleChange} style={{ borderColor: '#e2e8f0', borderRadius: '0.5rem' }} />
                                    </div>

                                    {/* Subjects Section */}
                                    <div className="mb-4">
                                        <label className="form-label fw-bold" style={{ color: '#14b8a6' }}>
                                            <i className="bi bi-book me-2"></i>
                                            Subjects You Teach
                                        </label>
                                        <div className="d-flex gap-2 mb-2">
                                            <select className="form-select" value={subjectToAdd} onChange={e => setSubjectToAdd(e.target.value)} style={{ borderColor: '#e2e8f0', borderRadius: '0.5rem' }}>
                                                <option value="">Select a subject...</option>
                                                {allSubjects.filter(subj => !profile.subjects.some(s => s.subject === subj._id)).map(subj => (
                                                    <option key={subj._id} value={subj._id}>{subj.name}</option>
                                                ))}
                                            </select>
                                            <input type="number" className="form-control" placeholder="Hourly Rate (Rs)" value={subjectRateToAdd} min="1" onChange={e => setSubjectRateToAdd(e.target.value)} style={{ borderColor: '#e2e8f0', borderRadius: '0.5rem' }} />
                                            <input type="text" className="form-control" placeholder="Title (optional)" value={subjectTitleToAdd} onChange={e => setSubjectTitleToAdd(e.target.value)} style={{ borderColor: '#e2e8f0', borderRadius: '0.5rem' }} />
                                            <button type="button" className="btn" style={{ backgroundColor: '#14b8a6', borderColor: '#14b8a6', color: 'white' }} onClick={handleAddSubject} disabled={!subjectToAdd || !subjectRateToAdd}>Add</button>
                                        </div>
                                        {/* List current subjects */}
                                        <div className="mt-2">
                                            {profile.subjects.length === 0 && <div className="text-secondary">No subjects added yet.</div>}
                                            {profile.subjects.length > 0 && (
                                                <div className="d-flex align-items-center mb-2 gap-2 fw-bold" style={{fontSize: '15px', color: '#14b8a6'}}>
                                                    <span style={{width: 120}}>Subject</span>
                                                    <span style={{width: 120}}>Hourly Rate (Rs)</span>
                                                    <span style={{width: 100}}>Hours</span>
                                                    <span style={{width: 180}}>Title</span>
                                                    <span style={{width: 40}}></span>
                                                </div>
                                            )}
                                            {profile.subjects.map(s => {
                                                const subj = allSubjects.find(sub => sub._id === s.subject);
                                                return subj ? (
                                                    <div key={s.subject} className="d-flex align-items-center mb-2 gap-2">
                                                        <span className="badge px-3 py-2" style={{width: 120, backgroundColor: '#14b8a6'}}>{subj.name}</span>
                                                        <input
                                                            type="number"
                                                            className="form-control"
                                                            style={{ width: 120, borderColor: '#e2e8f0', borderRadius: '0.5rem' }}
                                                            placeholder="Hourly Rate"
                                                            value={s.hourlyRate}
                                                            min="1"
                                                            onChange={e => handleSubjectRateChange(s.subject, e.target.value)}
                                                        />
                                                        <input
                                                            type="number"
                                                            className="form-control"
                                                            style={{ width: 100, borderColor: '#e2e8f0', borderRadius: '0.5rem' }}
                                                            placeholder="Hours"
                                                            value={s.hours || ''}
                                                            min="0"
                                                            onChange={e => handleSubjectHoursChange(s.subject, e.target.value)}
                                                        />
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            style={{ width: 180, borderColor: '#e2e8f0', borderRadius: '0.5rem' }}
                                                            placeholder="Title (optional)"
                                                            value={s.title || ''}
                                                            onChange={e => handleSubjectTitleChange(s.subject, e.target.value)}
                                                        />
                                                        <button type="button" className="btn btn-sm" style={{ backgroundColor: '#dc3545', borderColor: '#dc3545', color: 'white' }} onClick={() => handleRemoveSubject(s.subject)}>
                                                            <i className="bi bi-x"></i>
                                                        </button>
                                                    </div>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>
                                    {/* Expertise */}
                                    <TagInput label="Your Expertise" placeholder="Add an expertise..." value={profile.expertise} onChange={e => handleArrayChange(e, 'expertise')} />
                                    {/* Education */}
                                    <div className="mb-3">
                                        <label className="form-label fw-bold" style={{ color: '#14b8a6' }}>
                                            <i className="bi bi-mortarboard me-2"></i>
                                            Education
                                        </label>
                                        <input type="text" className="form-control" name="education" value={profile.education || ''} onChange={handleChange} style={{ borderColor: '#e2e8f0', borderRadius: '0.5rem' }} />
                                    </div>
                                    {/* Bio */}
                                    <div className="mb-3">
                                        <label className="form-label fw-bold" style={{ color: '#14b8a6' }}>
                                            <i className="bi bi-person-lines-fill me-2"></i>
                                            Bio / About Me
                                        </label>
                                        <textarea className="form-control" name="bio" rows="4" value={profile.bio || ''} onChange={handleChange} style={{ borderColor: '#e2e8f0', borderRadius: '0.5rem' }} />
                                    </div>
                                    {/* Location */}
                                    <div className="mb-3">
                                        <label className="form-label fw-bold" style={{ color: '#14b8a6' }}>
                                            <i className="bi bi-geo-alt me-2"></i>
                                            Location
                                        </label>
                                        <input type="text" className="form-control" name="location" value={profile.location || ''} onChange={handleChange} style={{ borderColor: '#e2e8f0', borderRadius: '0.5rem' }} />
                                    </div>
                                    <div className="d-grid mt-4">
                                        <button type="submit" className="btn btn-lg fw-bold" style={{ backgroundColor: '#14b8a6', borderColor: '#14b8a6', color: 'white', borderRadius: '0.75rem' }} disabled={saving}>
                                            {saving ? (
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
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ position: 'relative', zIndex: 2 }}>
                    <Footer />
                </div>
            </div>
            <style>{`
                .tags-input-container { 
                    display: flex; 
                    flex-wrap: wrap; 
                    gap: 8px; 
                    padding: 8px; 
                    min-height: 48px;
                    border-color: #e2e8f0 !important;
                    border-radius: 0.5rem !important;
                }
                .tag-item { 
                    background-color: #14b8a6; 
                    color: white;
                    padding: 5px 10px; 
                    border-radius: 15px; 
                    display: flex; 
                    align-items: center; 
                }
                .tag-item .text { margin-right: 8px; }
                .tag-item .close { cursor: pointer; font-weight: bold; }
                .tags-input { flex-grow: 1; border: none; outline: none; padding: 5px; }
            `}</style>
        </div>
    );
};

export default TutorProfile;
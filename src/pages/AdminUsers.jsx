import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const API_URL = `${import.meta.env.VITE_API_URL}/api/admin/users`;
const AVATAR_PLACEHOLDER = 'https://ui-avatars.com/api/?background=2DB8A1&color=fff&size=128&name=';

const UserCard = ({ user, onViewDetails }) => (
    <div className="card border-0 shadow-sm rounded-4 mb-3">
        <div className="card-body p-4">
            <div className="row align-items-center">
                <div className="col-auto">
                    <img 
                        src={user.profileImage ? (user.profileImage.startsWith('/uploads/') ? `${import.meta.env.VITE_API_URL}${user.profileImage}` : user.profileImage) : `${AVATAR_PLACEHOLDER}${user.name?.split(' ').join('+')}`} 
                        alt={user.name} 
                        className="rounded-circle" 
                        style={{width: '60px', height: '60px'}}
                    />
                </div>
                <div className="col">
                    <div className="d-flex align-items-center mb-2">
                        <h5 className="fw-bold mb-0 me-3">{user.name}</h5>
                        <span className={`badge ${user.role === 'tutor' ? 'bg-primary' : user.role === 'parent' ? 'bg-success' : 'bg-danger'}`}>
                            {user.role === 'tutor' ? 'Tutor' : user.role === 'parent' ? 'Student' : user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                        </span>
                        {user.status && (
                            <span className={`badge ms-2 ${user.status === 'rejected' ? 'bg-danger' : user.status === 'deactivated' ? 'bg-secondary' : 'bg-success'}`}>
                                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                            </span>
                        )}
                        {user.isVerified && user.role === 'tutor' && (
                            <span className="badge bg-success ms-2">
                                <i className="bi bi-check-circle me-1"></i>Verified
                            </span>
                        )}
                    </div>
                    
                    <div className="row g-3">
                        <div className="col-md-6">
                            <div className="d-flex align-items-center mb-2">
                                <i className="bi bi-envelope text-primary me-2"></i>
                                <span className="text-secondary">{user.email}</span>
                            </div>
                            {user.location && (
                                <div className="d-flex align-items-center mb-2">
                                    <i className="bi bi-geo-alt text-info me-2"></i>
                                    <span className="text-secondary">{user.location}</span>
                                </div>
                            )}
                        </div>
                        <div className="col-md-6">
                            <div className="d-flex align-items-center mb-2">
                                <i className="bi bi-calendar text-warning me-2"></i>
                                <span className="text-secondary">
                                    Joined: {user.date ? new Date(user.date).toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'short', 
                                        day: 'numeric'
                                    }) : 'No date'}
                                </span>
                            </div>
                            {user.role === 'tutor' && user.subjects && user.subjects.length > 0 && (
                                <div className="d-flex align-items-start">
                                    <i className="bi bi-book text-success me-2 mt-1"></i>
                                    <div>
                                        <small className="text-secondary fw-bold">Subjects:</small>
                                        <p className="text-secondary small mb-0">
                                            {user.subjects.map(subjectObj => {
                                                if (subjectObj && typeof subjectObj === 'object') {
                                                    if (subjectObj.subject && typeof subjectObj.subject === 'object' && subjectObj.subject.name) {
                                                        return subjectObj.subject.name;
                                                    }
                                                    if (subjectObj.name) {
                                                        return subjectObj.name;
                                                    }
                                                    if (typeof subjectObj === 'string') {
                                                        return subjectObj;
                                                    }
                                                }
                                                return 'Unknown Subject';
                                            }).join(', ')}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="col-auto">
                    <Link to={`/admin/users/${user._id}`} className="btn btn-outline-primary btn-sm">
                        <i className="bi bi-eye me-1"></i>View Details
                    </Link>
                </div>
            </div>
        </div>
    </div>
);

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0
  });

  useEffect(() => {
    fetchUsers();
  }, [filters, pagination.currentPage]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: 10,
        ...filters
      });

      const res = await fetch(`${API_URL}?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        setUsers(data.data.users || []);
        setPagination(prev => ({
          ...prev,
          totalPages: data.data.pagination.totalPages,
          totalUsers: data.data.pagination.totalUsers
        }));
      } else {
        setError(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Failed to fetch users');
    }
    setLoading(false);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
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
                        <h1 className="fw-bolder display-5">User Management</h1>
                        <p className="text-secondary lead">Manage all platform users, view profiles, and monitor account status.</p>
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
                                    <label className="form-label fw-bold">Role</label>
                                    <select 
                                        className="form-select" 
                                        value={filters.role} 
                                        onChange={(e) => handleFilterChange('role', e.target.value)}
                                    >
                                        <option value="">All Roles</option>
                                        <option value="parent">Parents</option>
                                        <option value="tutor">Tutors</option>
                                        <option value="admin">Admins</option>
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fw-bold">Status</label>
                                    <select 
                                        className="form-select" 
                                        value={filters.status} 
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                    >
                                        <option value="">All Status</option>
                                        <option value="verified">Verified</option>
                                        <option value="unverified">Unverified</option>
                                        <option value="rejected">Rejected</option>
                                        <option value="deactivated">Deactivated</option>
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fw-bold">Search</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="Search by name, email, or location..."
                                        value={filters.search} 
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Users List */}
                    {users.length === 0 ? (
                        <div className="card border-0 shadow-sm rounded-4">
                            <div className="card-body p-5 text-center">
                                <i className="bi bi-people display-1 text-muted mb-3"></i>
                                <h4 className="fw-bold mb-2">No Users Found</h4>
                                <p className="text-secondary">Try adjusting your filters or search criteria.</p>
                            </div>
                        </div>
                    ) : (
                        <div>
                            {users.map((user) => (
                                <UserCard
                                    key={user._id}
                                    user={user}
                                />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="d-flex justify-content-center mt-4">
                            <nav>
                                <ul className="pagination">
                                    <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                                        <button 
                                            className="page-link" 
                                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                                            disabled={pagination.currentPage === 1}
                                        >
                                            <i className="bi bi-chevron-left"></i>
                                        </button>
                                    </li>
                                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                                        <li key={page} className={`page-item ${page === pagination.currentPage ? 'active' : ''}`}>
                                            <button 
                                                className="page-link" 
                                                onClick={() => handlePageChange(page)}
                                            >
                                                {page}
                                            </button>
                                        </li>
                                    ))}
                                    <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                                        <button 
                                            className="page-link" 
                                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                                            disabled={pagination.currentPage === pagination.totalPages}
                                        >
                                            <i className="bi bi-chevron-right"></i>
                                        </button>
                                    </li>
                                </ul>
                            </nav>
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

export default AdminUsers; 
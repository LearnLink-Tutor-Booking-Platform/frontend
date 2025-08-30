import React from 'react';
import ParentDashboard from './ParentDashboard';
import TutorDashboard from './TutorDashboard';
import AdminDashboard from './AdminDashboard';

function Dashboard(props) {
  // Try to get user from props, or from localStorage
  let user = props.user;
  console.log(user);
  if (!user) {
    try {
      user = JSON.parse(localStorage.getItem('user'));
      console.log(user);
    } catch (e) {
      user = null;
    }
  }

  if (!user) return <div>Please log in to view your dashboard.</div>;
  if (user.role === 'parent') return <ParentDashboard user={user} />;
  if (user.role === 'tutor') return <TutorDashboard user={user} />;
  if (user.role === 'admin') return <AdminDashboard user={user} />;
  // Premium error page for unknown user role
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 4px 32px rgba(0,0,0,0.07)', padding: '2.5rem 2rem', maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 60, color: '#f59e42', marginBottom: 16 }}>
          <i className="bi bi-exclamation-triangle-fill"></i>
        </div>
        <h2 className="fw-bold mb-2" style={{ fontSize: 28 }}>Unknown User Role</h2>
        <div className="mb-3 text-secondary" style={{ fontSize: 16 }}>We couldn't determine your dashboard type. Please contact support or try logging in again.</div>
        <a href="/" className="btn btn-info fw-bold" style={{ color: '#fff', borderRadius: 8, fontSize: 17 }}>Go to Home</a>
      </div>
    </div>
  );
}

export default Dashboard;
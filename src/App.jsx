import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ParentLogin from './pages/ParentLogin';
import TutorLogin from './pages/TutorLogin';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ParentDashboard from './pages/ParentDashboard';
import TutorDashboard from './pages/TutorDashboard';
import TutorProfile from './pages/TutorProfile';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminUserDetails from './pages/AdminUserDetails';
import AdminTutorsVerification from './pages/AdminTutorsVerification';
import AdminActivity from './pages/AdminActivity';
import AdminDisputes from './pages/AdminDisputes';
import AdminReviews from './pages/AdminReviews';
import AdminSubjects from './pages/AdminSubjects';
import ParentSearchTutors from './pages/ParentSearchTutors';
import ParentBookSession from './pages/ParentBookSession';
import ParentBookings from './pages/ParentBookings';
import ParentTutorProfile from './pages/ParentTutorProfile';
import ParentAddReview from './pages/ParentAddReview';
import ParentMessages from './pages/ParentMessages';
import ParentWaitlist from './pages/ParentWaitlist';
import ParentDispute from './pages/ParentDispute';
import TutorAvailability from './pages/TutorAvailability';
import TutorBookingRequests from './pages/TutorBookingRequests';
import TutorMessages from './pages/TutorMessages';
import TutorWaitlist from './pages/TutorWaitlist';
import TutorSubjects from './pages/TutorSubjects';
import TutorDispute from './pages/TutorDispute';
import TutorStudents from './pages/TutorStudents';
import ParentSubjectTutors from './pages/ParentSubjectTutors';
import ParentTutorAllReviews from './pages/ParentTutorAllReviews';
import TutorBookings from './pages/TutorBookings';
import ParentRegister from './pages/ParentRegister';
import TutorRegister from './pages/TutorRegister';
import ParentBookmarks from './pages/ParentBookmarks';
import ParentProfile from './pages/ParentProfile';
import Notifications from './pages/Notifications';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  });

  useEffect(() => {
    // Listen for login/logout changes in localStorage (multi-tab)
    const handleStorage = () => {
      try {
        setUser(JSON.parse(localStorage.getItem('user')));
      } catch {
        setUser(null);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };
  

  return (
    <Router>
      <Navbar user={user} handleLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/parent-login" element={<ParentLogin setUser={setUser} />} />
        <Route path="/tutor-login" element={<TutorLogin setUser={setUser} />} />
        <Route path="/register" element={<Register setUser={setUser} />} />
        <Route path="/dashboard" element={<Dashboard user={user} />} />
        <Route path="/parent-dashboard" element={<ParentDashboard user={user} />} />
        <Route path="/tutor-dashboard" element={<TutorDashboard user={user} />} />
        <Route path="/tutor-profile/:id" element={<TutorProfile />} />
        <Route path="/tutor/bookings" element={<TutorBookings />} />
        {/* Admin routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/users/:userId" element={<AdminUserDetails />} />
        <Route path="/admin/tutors-verification" element={<AdminTutorsVerification />} />
        <Route path="/admin/activity" element={<AdminActivity />} />
        <Route path="/admin/disputes" element={<AdminDisputes />} />
        <Route path="/admin/reviews" element={<AdminReviews />} />
        <Route path="/admin/subjects" element={<AdminSubjects />} />
        {/* Parent routes */}
        <Route path="/parent/search-tutors" element={<ParentSearchTutors />} />
        <Route path="/parent/book-session" element={<ParentBookSession />} />
        <Route path="/parent/book-session/:tutorId/:subjectId" element={<ParentBookSession />} />
        <Route path="/parent/bookings" element={<ParentBookings />} />
        <Route path="/parent/tutor/:tutorId" element={<ParentTutorProfile />} />
        <Route path="/parent/tutor/:tutorId/subject/:subjectId" element={<ParentTutorProfile />} />
        <Route path="/parent/tutor/:tutorId/reviews" element={<ParentTutorAllReviews />} />
        <Route path="/parent/add-review/:bookingId" element={<ParentAddReview />} />
        <Route path="/parent/messages/:tutorId" element={<ParentMessages />} />
        <Route path="/parent/waitlist" element={<ParentWaitlist />} />
        <Route path="/parent/disputes" element={<ParentDispute />} />
        <Route path="/tutor/availability" element={<TutorAvailability />} />
        <Route path="/tutor/booking-requests" element={<TutorBookingRequests />} />
        <Route path="/tutor/messages" element={<TutorMessages />} />
        <Route path="/tutor/waitlist" element={<TutorWaitlist />} />
        <Route path="/tutor/subjects" element={<TutorSubjects />} />
        <Route path="/tutor/disputes" element={<TutorDispute />} />
        <Route path="/tutor/students" element={<TutorStudents />} />
        <Route path="/subjects/:subjectId" element={<ParentSubjectTutors />} />
        <Route path="/register/parent" element={<ParentRegister />} />
        <Route path="/register/tutor" element={<TutorRegister />} />
        <Route path="/parent/bookmarks" element={<ParentBookmarks />} />
        <Route path="/parent/profile" element={<ParentProfile />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
}

export default App;

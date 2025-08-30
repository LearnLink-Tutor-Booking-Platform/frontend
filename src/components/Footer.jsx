import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-5 mt-5">
      <div className="container">
        <div className="row">
          <div className="col-lg-4 mb-4">
            <h5 className="text-uppercase mb-4 fw-bold" style={{ color: '#2DB8A1' }}>LearnLink</h5>
            <p className="text-white-50">
              Connect with qualified tutors and students for personalized learning experiences. 
              Find the perfect match for your educational journey.
            </p>
            <div className="d-flex gap-3">
              <a href="#" className="text-white-50 fs-5"><i className="bi bi-facebook"></i></a>
              <a href="#" className="text-white-50 fs-5"><i className="bi bi-twitter"></i></a>
              <a href="#" className="text-white-50 fs-5"><i className="bi bi-instagram"></i></a>
              <a href="#" className="text-white-50 fs-5"><i className="bi bi-linkedin"></i></a>
            </div>
          </div>
          <div className="col-lg-2 col-md-6 mb-4">
            <h6 className="text-uppercase mb-3 fw-bold">For Students</h6>
            <ul className="list-unstyled">
              <li><Link to="/parent/search-tutors" className="text-white-50 text-decoration-none">Find Tutors</Link></li>
              <li><Link to="/parent/bookings" className="text-white-50 text-decoration-none">My Bookings</Link></li>
              <li><Link to="/parent/bookmarks" className="text-white-50 text-decoration-none">Bookmarks</Link></li>
            </ul>
          </div>
          <div className="col-lg-2 col-md-6 mb-4">
            <h6 className="text-uppercase mb-3 fw-bold">For Tutors</h6>
            <ul className="list-unstyled">
              <li><Link to="/tutor/dashboard" className="text-white-50 text-decoration-none">Dashboard</Link></li>
              <li><Link to="/tutor/bookings" className="text-white-50 text-decoration-none">My Sessions</Link></li>
              <li><Link to="/tutor/profile" className="text-white-50 text-decoration-none">Profile</Link></li>
            </ul>
          </div>
          <div className="col-lg-2 col-md-6 mb-4">
            <h6 className="text-uppercase mb-3 fw-bold">Support</h6>
            <ul className="list-unstyled">
              <li><Link to="/help" className="text-white-50 text-decoration-none">Help Center</Link></li>
              <li><Link to="/contact" className="text-white-50 text-decoration-none">Contact Us</Link></li>
              <li><Link to="/faq" className="text-white-50 text-decoration-none">FAQ</Link></li>
            </ul>
          </div>
          <div className="col-lg-2 col-md-6 mb-4">
            <h6 className="text-uppercase mb-3 fw-bold">Legal</h6>
            <ul className="list-unstyled">
              <li><Link to="/privacy" className="text-white-50 text-decoration-none">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-white-50 text-decoration-none">Terms of Service</Link></li>
              <li><Link to="/cookies" className="text-white-50 text-decoration-none">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        <hr className="my-4" />
        <div className="row align-items-center">
          <div className="col-md-6">
            <p>&copy; 2025 LearnLink, Inc. All rights reserved.</p>
          </div>
          <div className="col-md-6 text-md-end">
            <p className="text-white-50 mb-0">Made with ❤️ for better education</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
import React from "react";
import { Link } from "react-router-dom";

const PawIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <ellipse cx="12" cy="16" rx="4" ry="3" />
    <circle cx="8" cy="10" r="1.5" />
    <circle cx="12" cy="8" r="1.5" />
    <circle cx="16" cy="10" r="1.5" />
    <circle cx="18" cy="13" r="1.2" />
  </svg>
);

function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-main">
      {/* Header */}
      <header className="bg-gradient-header header">
        <div className="header-container">
          <div className="header-content">
            <div className="logo-section">
              <div className="logo-icon">
                <PawIcon />
              </div>
              <div>
                <h1 className="logo-text">Hope Paws</h1>
                <p className="logo-subtitle">Animal Rescue & Sanctuary</p>
              </div>
            </div>
            <nav className="nav">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/animals" className="nav-link">Our Animals</Link>
              <Link to="/login" className="nav-link">Login</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Register Form */}
      <div className="login-container">
        <div className="login-box">
          <h2 className="text-center mb-3">Create an Account</h2>
          <p className="text-center text-muted mb-4">
            Join the Hope Paws family and start helping animals today.
          </p>
          <form>
            <div className="mb-3">
              <label>Full Name</label>
              <input type="text" className="form-input" placeholder="Jane Doe" required />
            </div>
            <div className="mb-3">
              <label>Email</label>
              <input type="email" className="form-input" placeholder="you@example.com" required />
            </div>
            <div className="mb-3">
              <label>Password</label>
              <input type="password" className="form-input" placeholder="••••••••" required />
            </div>
            <div className="mb-4">
              <label>Confirm Password</label>
              <input type="password" className="form-input" placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn btn-primary w-100">Register</button>
          </form>
          <p className="mt-3 text-center">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;

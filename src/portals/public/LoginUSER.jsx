import React from "react";
import { Link } from "react-router-dom";
import "../../css/LoginUSER.css";

// Reuse icons and header layout from HomePage
const PawIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <ellipse cx="12" cy="16" rx="4" ry="3" />
    <circle cx="8" cy="10" r="1.5" />
    <circle cx="12" cy="8" r="1.5" />
    <circle cx="16" cy="10" r="1.5" />
    <circle cx="18" cy="13" r="1.2" />
  </svg>
);

function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-main">
      {/* Header Bar */}
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
              <Link to="/register" className="nav-link">Register</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Login Bubble Container */}
      <div className="login-bubble">
        <h2>Welcome Back</h2>
        <p>Log in to continue your journey with Hope Paws</p>
        <form>
          <input
            type="email"
            placeholder="you@example.com"
            required
          />
          <input
            type="password"
            placeholder="••••••••"
            required
          />
          <button type="submit">Login</button>
        </form>
        <p className="register-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;

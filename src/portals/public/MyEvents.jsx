import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
// import "../../css/LoginUSER.css";

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

const MenuIcon = () => (
    <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
        <path d="M4 6h16M4 12h16M4 18h16" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
)

function MyEvents() {

  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return(

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
          {/* Mobile Menu Toggle Button */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Toggle Menu"
            > <MenuIcon />
          </button>
          <nav className="nav">
            <Link to="/animals" className="nav-link">
              Our Animals
            </Link>
            <Link to="/my-events" className="nav-link">
              Events
            </Link>
            <a href="#volunteer" className="nav-link">
              Volunteer
            </a>
            <a href="#donate" className="nav-link">
              Donate
            </a>
          </nav>
          <div className="header-buttons desktop-only">
            <button className="btn btn-outline">Sign In</button>
            <button className="btn btn-primary">Get Started</button>
          </div>
        </div>
        {showMobileMenu && (
          <div className="mobile-nav-dropdown">
            <Link to="/animals" className="nav-link" onClick={() => setShowMobileMenu(false)}>Our Animals</Link>
            <Link to="/my-events" className="nav-link" onClick={() => setShowMobileMenu(false)}>Events</Link>
            <a href="#volunteer" className="nav-link" onClick={() => setShowMobileMenu(false)}>Volunteer</a>
            <a href="#donate" className="nav-link" onClick={() => setShowMobileMenu(false)}>Donate</a>
                  
    
            <div className="mobile-buttons">
              <button className="btn btn-outline" onClick={() => setShowMobileMenu(false)}>Sign In</button>
              <button className="btn btn-primary" onClick={() => setShowMobileMenu(false)}>Get Started</button>
            </div>
          </div>
        )}
      </div>
    </header>
  );


}

export default MyEvents;
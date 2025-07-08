import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = ({ userType = "manager" }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    sessionStorage.clear();
    navigate("/");
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Diferentes menús según el tipo de usuario
  const getNavLinks = () => {
    switch (userType) {
      case "manager":
        return (
          <>
            <Link to="/managerdash" className="nav-link">Dashboard</Link>
            <Link to="/manageanimals" className="nav-link">Animals</Link>
            <Link to="/assigntasks" className="nav-link">Tasks</Link>
            <Link to="/eventmanager" className="nav-link">Events</Link>
            <Link to="/donatereports" className="nav-link">Reports</Link>
            <Link to="/reviewVolunteersApps" className="nav-link">Volunteers</Link>
          </>
        );
      case "volunteer":
        return (
          <>
            <Link to="/volunteerDash" className="nav-link">Dashboard</Link>
            <Link to="/mytasks" className="nav-link">My Tasks</Link>
            <Link to="/activityHistory" className="nav-link">History</Link>
            <Link to="/volunteerMatchPage" className="nav-link">Matches</Link>
          </>
        );
      case "vet":
        return (
          <>
            <Link to="/vetdashboard" className="nav-link">Dashboard</Link>
            <Link to="/animalMedicalForm" className="nav-link">Medical</Link>
            <Link to="/readyStatusForm" className="nav-link">Status</Link>
          </>
        );
      case "public":
        return (
          <>
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/animals" className="nav-link">Animals</Link>
            <Link to="/donate" className="nav-link">Donate</Link>
            <Link to="/my-events" className="nav-link">Events</Link>
            <Link to="/submit-adoption" className="nav-link">Adopt</Link>
          </>
        );
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (userType) {
      case "manager":
        return "Manager Portal";
      case "volunteer":
        return "Volunteer Portal";
      case "vet":
        return "Veterinary Portal";
      case "public":
        return "Animal Shelter";
      default:
        return "Animal Shelter";
    }
  };

  return (
    <header className="header bg-gradient-header">
      <div className="header-container">
        <div className="header-content">
          {/* Logo Section */}
          <div className="logo-section">
            <Link to="/" className="logo-icon">
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </Link>
            <div>
              <div className="logo-text">Paws & Hearts</div>
              <div className="logo-subtitle">{getTitle()}</div>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
            >
            <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{width: '28px', height: '28px'}} >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Desktop Navigation */}
          <nav className="nav">
            {getNavLinks()}
          </nav>

          {/* Desktop Header Buttons */}
          <div className="header-buttons">
            <div className="desktop-only">
              <Link to="/profilePage" className="btn btn-outline">
                <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{width: '16px', height: '16px', marginRight: '0.5rem'}}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </Link>
              <button onClick={handleLogout} className="btn btn-primary">
                <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{width: '16px', height: '16px', marginRight: '0.5rem'}}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="mobile-nav-dropdown">
            {getNavLinks()}
            <div className="mobile-buttons">
              <Link to="/profilePage" className="btn btn-outline" onClick={() => setMobileMenuOpen(false)}>
                Profile
              </Link>
              <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="btn btn-primary">
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
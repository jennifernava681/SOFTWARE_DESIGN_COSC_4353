
import "../../css/home.css";
import { useState } from "react";
import { Link } from "react-router-dom";

// Proper Paw Print Icon that matches the design
const PawIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
        {/* Main paw pad */}
        <ellipse cx="12" cy="16" rx="4" ry="3" />
        {/* Top left toe pad */}
        <circle cx="8" cy="10" r="1.5" />
        {/* Top center toe pad */}
        <circle cx="12" cy="8" r="1.5" />
        {/* Top right toe pad */}
        <circle cx="16" cy="10" r="1.5" />
        {/* Side toe pad */}
        <circle cx="18" cy="13" r="1.2" />
    </svg>
)

const HeartIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" />
    </svg>
)

const UsersIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 4C18.2 4 20 5.8 20 8S18.2 12 16 12 12 10.2 12 8 13.8 4 16 4M16 14C20.4 14 24 15.8 24 18V20H8V18C8 15.8 11.6 14 16 14M8 4C10.2 4 12 5.8 12 8S10.2 12 8 12 4 10.2 4 8 5.8 4 8 4M8 14C12.4 14 16 15.8 16 18V20H0V18C0 15.8 3.6 14 8 14Z" />
    </svg>
)

const StarIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
)

const AwardIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M5 16L3 21L8.5 18L12 21L15.5 18L21 21L19 16H5M12 11C14.21 11 16 9.21 16 7S14.21 3 12 3 8 4.79 8 7 9.79 11 12 11M12 9C10.9 9 10 8.1 10 7S10.9 5 12 5 14 5.9 14 7 13.1 9 12 9Z" />
    </svg>
)

const CalendarIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3H18V1H16V3H8V1H6V3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M19 19H5V8H19V19M7 10H12V15H7" />
    </svg>
)

const MapPinIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2M12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5Z" />
    </svg>
)

const PhoneIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6.62 10.79C8.06 13.62 10.38 15.94 13.21 17.38L15.41 15.18C15.69 14.9 16.08 14.82 16.43 14.93C17.55 15.3 18.75 15.5 20 15.5C20.55 15.5 21 15.95 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z" />
    </svg>
)

const MailIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4M20 8L12 13L4 8V6L12 11L20 6V8Z" />
    </svg>
)

const ShieldIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1M12 7C13.4 7 14.8 8.6 14.8 10.5V11.5C15.4 11.5 16 12.4 16 13V16C16 17.4 15.4 18 14.8 18H9.2C8.6 18 8 17.4 8 16V13C8 12.4 8.6 11.5 9.2 11.5V10.5C9.2 8.6 10.6 7 12 7M12 8.2C11.2 8.2 10.5 8.7 10.5 10.5V11.5H13.5V10.5C13.5 8.7 12.8 8.2 12 8.2Z" />
    </svg>
)

const MenuIcon = () => (
    <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
        <path d="M4 6h16M4 12h16M4 18h16" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
)

// Mock data for available animals
const featuredAnimals = [
    {
        id: 1,
        name: "Buddy",
        type: "Dog",
        breed: "Golden Retriever",
        age: "3 years",
        status: "Available",
        image: "https://via.placeholder.com/400x300/22c55e/ffffff?text=Buddy+Dog",
        description: "Friendly and energetic, great with kids and other pets",
    },
    {
        id: 2,
        name: "Luna",
        type: "Cat",
        breed: "Siamese Mix",
        age: "2 years",
        status: "Available",
        image: "https://via.placeholder.com/400x300/16a34a/ffffff?text=Luna+Cat",
        description: "Calm and affectionate, loves to cuddle and purr",
    },
    {
        id: 3,
        name: "Max",
        type: "Dog",
        breed: "German Shepherd",
        age: "5 years",
        status: "Available",
        image: "https://via.placeholder.com/400x300/15803d/ffffff?text=Max+Dog",
        description: "Loyal and protective, needs experienced owner",
    },
]


function BrowseAnimals() {

  const [showMobileMenu, setShowMobileMenu] = useState(false);
  return (
    <div className="full-width-wrapper bg-gradient-main">
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
            {/* Mobile Menu Toggle Button */}
            <button
              className="mobile-menu-toggle"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label="Toggle Menu"
              > <MenuIcon />
            </button>
            <nav className="nav">
              <Link to="/" className="nav-link">Home</Link>
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
              <Link to="/" className="nav-link" onClick={() => setShowMobileMenu(false)}>Home Page</Link>
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
    

      {/* Featured Animals */}
      <section id="animals" className="all-animals">
        <div className="all-animals-container">
          <div className="section-header-all">
            <h3 className="section-title-all">Meet Our Friends</h3>
            <p className="section-description-all">
              These beautiful souls are waiting for their forever families. Each one has been lovingly cared for and is
              ready to bring joy to your home.
            </p>
            <div className="section-divider-all"></div>
          </div>
          <div className="all-animals-grid">
            {featuredAnimals.map((animal) => (
              <div key={animal.id} className="animal-card-all">
                <div className="animal-image-container-all">
                  <img src={animal.image || "/placeholder.svg"} alt={animal.name} className="animal-image" />
                  <div className="animal-status-all">{animal.status}</div>
                  <div className="animal-overlay-all"></div>
                </div>
                <div className="animal-content-all">
                  <h4 className="animal-name-all">{animal.name}</h4>
                  <p className="animal-details-all">
                    {animal.breed} • {animal.age}
                  </p>
                  <p className="animal-description-all">{animal.description}</p>
                  <button className="btn-animal-all">
                    <HeartIcon />
                    <span style={{ marginLeft: "0.5rem" }}>Learn More About {animal.name}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
          {/*<div className="view-btn-all">
            <button className="btn-all-view">View All Available Animals</button>
          </div>*/}
        </div>
      </section>
    </div>
  );
}

export default BrowseAnimals;
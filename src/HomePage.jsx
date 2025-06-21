"use client"

import "./index.css"
import { useState } from "react"
import { Link } from "react-router-dom"

// Proper Paw Print Icon that matches the design
function PawIcon() {
  return (
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
}

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
    image: "/placeholder.svg?height=300&width=400&text=Buddy+Dog",
    description: "Friendly and energetic, great with kids and other pets",
  },
  {
    id: 2,
    name: "Luna",
    type: "Cat",
    breed: "Siamese Mix",
    age: "2 years",
    status: "Available",
    image: "/placeholder.svg?height=300&width=400&text=Luna+Cat",
    description: "Calm and affectionate, loves to cuddle and purr",
  },
  {
    id: 3,
    name: "Max",
    type: "Dog",
    breed: "German Shepherd",
    age: "5 years",
    status: "Available",
    image: "/placeholder.svg?height=300&width=400&text=Max+Dog",
    description: "Loyal and protective, needs experienced owner",
  },
]

const upcomingEvents = [
  {
    id: 1,
    title: "Weekend Adoption Fair",
    date: "January 20, 2024",
    time: "10:00 AM - 4:00 PM",
    type: "Adoption",
    location: "Hope Paws Main Campus",
  },
  {
    id: 2,
    title: "Charity Fundraising Gala",
    date: "January 25, 2024",
    time: "6:00 PM - 10:00 PM",
    type: "Fundraising",
    location: "Downtown Community Center",
  },
]

function HomePage() {
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-main">
      {/* Header */}
      <header className="bg-gradient-header header" style={{ position: "sticky", top: "0px" }}>
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
            >
              <MenuIcon />
            </button>
            <nav className="nav">
              <Link to="/animals" className="nav-link">
                Our Animals
              </Link>
              <Link to="/my-events" className="nav-link">
                Events
              </Link>
              <Link to="/applyVolunteer" className="nav-link">
                Volunteer
              </Link>
              <Link to="/donate" className="nav-link">
                Donate
              </Link>
            </nav>
            <div className="header-buttons desktop-only">
              <Link to="/login" className="btn btn-outline">
                Sign In
              </Link>
              <Link to="/stafflogin" className="btn btn-outline">
                Staff Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
            </div>
          </div>
          {showMobileMenu && (
            <div className="mobile-nav-dropdown">
              <Link to="/animals" className="nav-link" onClick={() => setShowMobileMenu(false)}>
                Our Animals
              </Link>
              <Link to="/my-events" className="nav-link" onClick={() => setShowMobileMenu(false)}>
                Events
              </Link>
              <Link to="/applyVolunteer" className="nav-link" onClick={() => setShowMobileMenu(false)}>
                Volunteer
              </Link>
              <Link to="/donate" className="nav-link" onClick={() => setShowMobileMenu(false)}>
                Donate
              </Link>

              <div className="mobile-buttons">
                <Link to="/login" className="btn btn-outline" onClick={() => setShowMobileMenu(false)}>
                  Sign In
                </Link>
                <Link to="/stafflogin" className="btn btn-outline" onClick={() => setShowMobileMenu(false)}>
                  Staff Login
                </Link>
                <Link to="/register" className="btn btn-primary" onClick={() => setShowMobileMenu(false)}>
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-overlay-2"></div>
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <div className="hero-badge-icon">
                <ShieldIcon />
              </div>
              <span className="hero-badge-text">Trusted Animal Care Since 2025</span>
            </div>
            <h2 className="hero-title">
              Every Animal
              <span className="hero-title-gradient">Deserves Hope</span>
            </h2>
            <p className="hero-description">
              At Hope Paws, we believe every rescued animal has a story worth telling and a future worth fighting for.
              Join us in creating happy endings, one paw at a time.
            </p>
            <div className="hero-buttons">
              <Link to="/animals" className="btn-hero btn-hero-primary">
                <HeartIcon />
                <span style={{ marginLeft: "0.5rem" }}>Find Your Companion</span>
              </Link>
              <Link to="/login" className="btn-hero btn-hero-secondary">
                <UsersIcon />
                <span style={{ marginLeft: "0.5rem" }}>Volunteer With Us</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Animals */}
      <section id="animals" className="animals">
        <div className="animals-container">
          <div className="section-header">
            <h3 className="section-title">Meet Our Friends</h3>
            <p className="section-description">
              These beautiful souls are waiting for their forever families. Each one has been lovingly cared for and is
              ready to bring joy to your home.
            </p>
            <div className="section-divider"></div>
          </div>
          <div className="animals-grid">
            {featuredAnimals.map((animal) => (
              <div key={animal.id} className="animal-card">
                <div className="animal-image-container">
                  <img src={animal.image || "/placeholder.svg"} alt={animal.name} className="animal-image" />
                  <div className="animal-status">{animal.status}</div>
                  <div className="animal-overlay"></div>
                </div>
                <div className="animal-content">
                  <h4 className="animal-name">{animal.name}</h4>
                  <p className="animal-details">
                    {animal.breed} • {animal.age}
                  </p>
                  <p className="animal-description">{animal.description}</p>
                  <Link to="/submit-adoption" className="btn-animal">
                    <HeartIcon />
                    <span style={{ marginLeft: "0.5rem" }}>Learn More About {animal.name}</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="view-all-btn">
            <Link to="/animals" className="btn-view-all">
              View All Available Animals
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <div className="testimonials-container">
          <div className="section-header">
            <h3 className="stats-title">Make a Difference</h3>
            <p className="stats-description">
              Discover how adoption and volunteering can transform lives - both yours and theirs.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "3rem" }}>
            <div className="testimonial-card">
              <div className="stat-value" style={{ marginBottom: "2rem", color: "white", fontSize: "2.25rem" }}>
                Why Adopt
              </div>
              <div style={{ textAlign: "left" }}>
                <div className="testimonial-text" style={{ marginBottom: "1rem" }}>
                  • Give a homeless animal a second chance
                </div>
                <div className="testimonial-text" style={{ marginBottom: "1rem" }}>
                  • Reduce shelter overcrowding and euthanasia
                </div>
                <div className="testimonial-text">• Gain a loyal companion who changes your life</div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="stat-value" style={{ marginBottom: "2rem", color: "white", fontSize: "2.25rem" }}>
                Why Volunteer
              </div>
              <div style={{ textAlign: "left" }}>
                <div className="testimonial-text" style={{ marginBottom: "1rem" }}>
                  • Support animals through care, love, and time
                </div>
                <div className="testimonial-text" style={{ marginBottom: "1rem" }}>
                  • Help shelters run and reach more people
                </div>
                <div className="testimonial-text">• Be part of something meaningful and lasting</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section id="events" className="events">
        <div className="events-container">
          <div className="section-header">
            <h3 className="section-title">Upcoming Events</h3>
            <p className="section-description">
              Join our community events and help us make a difference in the lives of animals in need.
            </p>
            <div className="section-divider"></div>
          </div>
          <div className="events-grid">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="event-card">
                <div className="event-header">
                  <div className="event-header-content">
                    <h4 className="event-title">{event.title}</h4>
                    <span className="event-type">{event.type}</span>
                  </div>
                  <p className="event-date">
                    <CalendarIcon />
                    <span style={{ marginLeft: "0.75rem" }}>
                      {event.date} • {event.time}
                    </span>
                  </p>
                  <p className="event-location">
                    <MapPinIcon />
                    <span style={{ marginLeft: "0.75rem" }}>{event.location}</span>
                  </p>
                </div>
                <div className="event-content">
                  <Link to="/my-events" className="btn-event">
                    Register for Event
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta">
        <div className="cta-overlay"></div>
        <div className="cta-container">
          <h3 className="cta-title">Be Part of Their Story</h3>
          <p className="cta-description">
            Every animal deserves a chance at happiness. Whether through adoption, volunteering, or donation, you can be
            the hero in their story of hope and healing.
          </p>
          <div className="cta-buttons">
            <Link to="/donate" className="btn-cta btn-cta-primary">
              <HeartIcon />
              <span style={{ marginLeft: "0.75rem" }}>Make a Donation</span>
            </Link>
            <Link to="/surrender" className="btn-cta btn-cta-secondary">
              <PawIcon />
              <span style={{ marginLeft: "0.75rem" }}>Rehome an Animal</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage

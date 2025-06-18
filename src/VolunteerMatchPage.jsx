import React from "react";
import { dummyMatches } from "./dummyData";
import { Link } from "react-router-dom";
import "./css/VolunteerMatchPage.css";

const PawIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <ellipse cx="12" cy="16" rx="4" ry="3" />
    <circle cx="8" cy="10" r="1.5" />
    <circle cx="12" cy="8" r="1.5" />
    <circle cx="16" cy="10" r="1.5" />
    <circle cx="18" cy="13" r="1.2" />
  </svg>
);

function VolunteerMatchPage() {
  return (
    <div className="match-page">
      <header className="match-header">
        <div className="logo-section">
          <PawIcon />
          <div>
            <h1>Hope Paws</h1>
            <p>Animal Rescue & Sanctuary</p>
          </div>
        </div>
        <nav className="nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/animals" className="nav-link">Our Animals</Link>
          <Link to="/register" className="nav-link">Register</Link>
        </nav>
      </header>

      <div className="match-container">
        <h2>Volunteer Matches</h2>
        <div className="match-grid">
          {dummyMatches.map((match, idx) => (
            <div key={idx} className="match-card">
              <h3>{match.volunteerName}</h3>
              <p><strong>Matched Event:</strong> {match.event}</p>
              <p><strong>Skills:</strong> {match.skills.join(", ")}</p>
              <p><strong>Urgency:</strong> {match.urgency}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VolunteerMatchPage;

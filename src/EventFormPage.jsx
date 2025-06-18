import React from "react";
import { Link } from "react-router-dom";
import "./css/EventFormPage.css";

const PawIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <ellipse cx="12" cy="16" rx="4" ry="3" />
    <circle cx="8" cy="10" r="1.5" />
    <circle cx="12" cy="8" r="1.5" />
    <circle cx="16" cy="10" r="1.5" />
    <circle cx="18" cy="13" r="1.2" />
  </svg>
);

function EventFormPage() {
  return (
    <div className="event-page">
      <header className="event-header">
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

      <div className="event-container">
        <h2>Create New Event</h2>
        <form className="event-form">
          <input type="text" placeholder="Event Name" required />
          <textarea placeholder="Event Description" required />
          <textarea placeholder="Location" required />
          <select multiple>
            <option>Feeding</option>
            <option>Walking</option>
            <option>Cleaning</option>
          </select>
          <select>
            <option value="">Select Urgency</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
          <input type="date" />
          <button type="submit">Create Event</button>
        </form>
      </div>
    </div>
  );
}

export default EventFormPage;

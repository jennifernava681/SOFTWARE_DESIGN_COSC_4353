import React from "react";
import { dummyVolunteerHistory } from "./dummyData";
import { Link } from "react-router-dom";
import "./css/VolunteerHistoryPage.css";

const PawIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <ellipse cx="12" cy="16" rx="4" ry="3" />
    <circle cx="8" cy="10" r="1.5" />
    <circle cx="12" cy="8" r="1.5" />
    <circle cx="16" cy="10" r="1.5" />
    <circle cx="18" cy="13" r="1.2" />
  </svg>
);

function VolunteerHistoryPage() {
  return (
    <div className="history-page">
      <header className="history-header">
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

      <div className="history-container">
        <h2>Volunteer History</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Volunteer</th>
                <th>Event</th>
                <th>Location</th>
                <th>Urgency</th>
                <th>Skills Used</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {dummyVolunteerHistory.map((entry, idx) => (
                <tr key={idx}>
                  <td>{entry.volunteer}</td>
                  <td>{entry.event}</td>
                  <td>{entry.location}</td>
                  <td>{entry.urgency}</td>
                  <td>{entry.skillsUsed.join(", ")}</td>
                  <td>{entry.date}</td>
                  <td>{entry.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default VolunteerHistoryPage;

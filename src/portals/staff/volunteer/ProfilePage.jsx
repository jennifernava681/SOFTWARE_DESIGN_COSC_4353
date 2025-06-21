import React, { useState } from "react";
import { dummyUsers } from "../../../dummyData";
import { Link } from "react-router-dom";
import "../../../css/ProfilePage.css";

const PawIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <ellipse cx="12" cy="16" rx="4" ry="3" />
    <circle cx="8" cy="10" r="1.5" />
    <circle cx="12" cy="8" r="1.5" />
    <circle cx="16" cy="10" r="1.5" />
    <circle cx="18" cy="13" r="1.2" />
  </svg>
);

function ProfilePage() {
  const user = dummyUsers[0];
  const [profile] = useState(user);

  return (
    <div className="profile-page">
      {/* Header */}
      <header className="profile-header">
        <div className="logo-container">
          <PawIcon />
          <div className="header-texts">
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

      {/* Profile Form */}
      <main className="profile-card">
        <h2>Volunteer Profile</h2>
        <form className="profile-form">
          <input type="text" value={profile.name} readOnly />
          <input type="text" value="1234 Main St" readOnly />
          <input type="text" value="Apt 101" readOnly />
          <input type="text" value="Houston" readOnly />
          <select value="TX" disabled>
            <option value="TX">TX</option>
          </select>
          <input type="text" value={profile.zip} readOnly />

          <select multiple disabled className="full-width">
            {profile.skills.map((skill, idx) => (
              <option key={idx}>{skill}</option>
            ))}
          </select>

          <textarea
            className="full-width"
            readOnly
            value="No preferences"
          />

          <input
            type="date"
            value={profile.availability[0]}
            readOnly
            className="full-width"
          />

          <button className="full-width" disabled>Submit</button>
        </form>
      </main>
    </div>
  );
}

export default ProfilePage;

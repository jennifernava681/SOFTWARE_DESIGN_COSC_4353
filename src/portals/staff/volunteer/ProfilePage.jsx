"use client"

import { dummyUsers } from "../../../dummyData"
import { Link } from "react-router-dom"
import "../../../css/ProfilePage.css"
import { apiFetch } from "../../../api";
import { useState, useEffect } from "react";

const PawIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <ellipse cx="12" cy="16" rx="4" ry="3" />
    <circle cx="8" cy="10" r="1.5" />
    <circle cx="12" cy="8" r="1.5" />
    <circle cx="16" cy="10" r="1.5" />
    <circle cx="18" cy="13" r="1.2" />
  </svg>
)

function ProfilePage() {

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    preferences: "",
    availability: [],
    skills: [],
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiFetch("/api/users/profile");
        console.log("Fetched profile data:", data);
        
        const updated = {
          name: data.name || "",
          email: data.email || "",
          address: data.address || "",
          apartment: data.apartment || "",
          city: data.city || "",
          state: data.state || "",
          zip: data.zip || "",
          phone: data.phone || "",
          preferences: data.preferences || "",
          availability: data.availability || [],
          skills: data.skills || [],
        };
        
        setProfile(updated);
        setEditForm(updated);
      } catch (err) {
        console.error("Failed to load profile:", err);
        // Set default values if profile fetch fails
        const defaultProfile = {
          name: "",
          email: "",
          address: "",
          apartment: "",
          city: "",
          state: "",
          zip: "",
          phone: "",
          preferences: "",
          availability: [],
          skills: [],
        };
        setProfile(defaultProfile);
        setEditForm(defaultProfile);
      }
    };

    fetchProfile();
  }, []);

  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState(profile)

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setIsEditing(false)
    
    try {
      // Prepare data for API
      const updateData = {
        name: editForm.name,
        email: editForm.email,
        address: editForm.address,
        apartment: editForm.apartment,
        city: editForm.city,
        state: editForm.state,
        skills: editForm.skills,
        preferences: editForm.preferences
      };
      
      await apiFetch("/api/users/profile", "PUT", updateData);
      
      // Update local state
      setProfile(editForm);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
      // Revert to original data
      setEditForm(profile);
    }
  }

  const handleCancel = () => {
    setEditForm(profile)
    setIsEditing(false)
  }

  const handleInputChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

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
          <Link to="/dashboard" className="nav-link">
            Dashboard
          </Link>
          <Link to="/animals" className="nav-link">
            Our Animals
          </Link>
          <Link to="/mytasks" className="nav-link">
            My Tasks
          </Link>
          <Link to="/volunteerDash" className="nav-link">
            Volunteer Hub
          </Link>
        </nav>
      </header>

      {/* Profile Form */}
      <main className="profile-card">
        <h2>Volunteer Profile</h2>
        <form className="profile-form" onSubmit={handleSave}>
          {/* Personal Information */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              value={isEditing ? editForm.name : profile.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              readOnly={!isEditing}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              value={isEditing ? editForm.email : profile.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              readOnly={!isEditing}
            />
          </div>

          {/* Address Information */}
          <div className="form-group">
            <label className="form-label">Street Address</label>
            <input
              type="text"
              value={isEditing ? editForm.address : profile.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              readOnly={!isEditing}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Apartment/Unit</label>
            <input
              type="text"
              value={isEditing ? editForm.apartment : profile.apartment}
              onChange={(e) => handleInputChange("apartment", e.target.value)}
              readOnly={!isEditing}
            />
          </div>

          <div className="form-group">
            <label className="form-label">City</label>
            <input
              type="text"
              value={isEditing ? editForm.city : profile.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
              readOnly={!isEditing}
            />
          </div>

          <div className="form-group">
            <label className="form-label">State</label>
            <select
              value={isEditing ? editForm.state : profile.state}
              onChange={(e) => handleInputChange("state", e.target.value)}
              disabled={!isEditing}
            >
              <option value="TX">Texas</option>
              <option value="CA">California</option>
              <option value="NY">New York</option>
              <option value="FL">Florida</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">ZIP Code</label>
            <input
              type="text"
              value={isEditing ? editForm.zip : profile.zip}
              onChange={(e) => handleInputChange("zip", e.target.value)}
              readOnly={!isEditing}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              value={isEditing ? editForm.phone : profile.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              readOnly={!isEditing}
            />
          </div>

          {/* Skills */}
          <div className="form-group full-width">
            <label className="form-label">Skills & Abilities</label>
            {isEditing ? (
              <textarea
                value={editForm.skills.join(', ')}
                onChange={(e) => handleInputChange("skills", e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                placeholder="Enter skills separated by commas..."
                className="form-textarea"
                rows={3}
              />
            ) : (
              <div className="skills-display">
                {profile.skills.length > 0 ? (
                  profile.skills.map((skill, idx) => (
                    <span key={idx} className="skill-tag">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="no-data">No skills listed</span>
                )}
              </div>
            )}
          </div>

          {/* Preferences */}
          <div className="form-group full-width">
            <label className="form-label">Volunteer Preferences</label>
            <textarea
              value={isEditing ? editForm.preferences : profile.preferences}
              onChange={(e) => handleInputChange("preferences", e.target.value)}
              readOnly={!isEditing}
              placeholder="Share any preferences or special requirements..."
            />
          </div>

          {/* Availability */}
          <div className="form-group full-width">
            <label className="form-label">Availability Dates</label>
            {isEditing ? (
              <textarea
                value={editForm.availability.map(a => a.date).join(', ')}
                onChange={(e) => {
                  const dates = e.target.value.split(',').map(d => d.trim()).filter(d => d);
                  const availability = dates.map(date => ({ date, time: 'Any time' }));
                  handleInputChange("availability", availability);
                }}
                placeholder="Enter dates separated by commas (e.g., 2024-03-15, 2024-03-20)..."
                className="form-textarea"
                rows={3}
              />
            ) : (
              <div className="availability-display">
                {profile.availability.length > 0 ? (
                  profile.availability.map((date, idx) => (
                    <span key={idx} className="availability-tag">
                      {new Date(date.date || date).toLocaleDateString()}
                    </span>
                  ))
                ) : (
                  <span className="no-data">No availability dates set</span>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="profile-actions">
            {!isEditing ? (
              <>
                <button type="button" onClick={handleEdit} className="btn-primary">
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ marginRight: "0.5rem" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Profile
                </button>
                <Link to="/dashboard" className="btn-secondary">
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ marginRight: "0.5rem" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Back to Dashboard
                </Link>
              </>
            ) : (
              <>
                <button type="submit" className="btn-primary">
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ marginRight: "0.5rem" }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </button>
                <button type="button" onClick={handleCancel} className="btn-secondary">
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ marginRight: "0.5rem" }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </button>
              </>
            )}
          </div>
        </form>
      </main>
    </div>
  )
}

export default ProfilePage

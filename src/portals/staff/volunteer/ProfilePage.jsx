"use client"

import { dummyUsers } from "../../../dummyData"
import { Link, useNavigate } from "react-router-dom"
import "../../../css/ProfilePage.css"
import "../../../css/volunteer.css"  
import { apiFetch, isAuthenticated } from "../../../api";
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
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

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

  const [editForm, setEditForm] = useState({
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
      // Check if user is authenticated
      if (!isAuthenticated()) {
        setError("Please log in to view your profile");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
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
        setEditForm(updated); // Update editForm with the fetched data
      } catch (err) {
        console.error("Failed to load profile:", err);
        setError("Failed to load profile. Please try again.");
        
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    // Make sure editForm has the current profile data
    setEditForm(profile);
  }

  const handleSave = async (e) => {
    e.preventDefault();
    setIsEditing(false);
    
    try {
      // Prepare data for API
      const updateData = {
        name: editForm.name,
        email: editForm.email,
        address: editForm.address,
        apartment: editForm.apartment,
        city: editForm.city,
        state: editForm.state,
        zip: editForm.zip,
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
    setEditForm(profile);
    setIsEditing(false);
  }

  const handleInputChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <h2>Loading Profile...</h2>
          <p>Please wait while we load your information.</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate("/login")} className="btn btn-primary">
            Go to Login
          </button>
        </div>
      </div>
    );
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
          {/* Public Pages */}
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/animals" className="nav-link">
            Browse Animals
          </Link>
          <Link to="/donate" className="nav-link">
            Donate
          </Link>
          <Link to="/my-events" className="nav-link">
            Events
          </Link>
          
          {/* Volunteer Pages */}
          <Link to="/volunteerDash" className="nav-link">
            Volunteer Dashboard
          </Link>
          <Link to="/mytasks" className="nav-link">
            My Tasks
          </Link>
          <Link to="/activityHistory" className="nav-link">
            Activity History
          </Link>
          <Link to="/applyVolunteer" className="nav-link">
            Apply for Opportunities
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
              className={!isEditing ? "readonly" : ""}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              value={isEditing ? editForm.email : profile.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              readOnly={!isEditing}
              className={!isEditing ? "readonly" : ""}
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
              className={!isEditing ? "readonly" : ""}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Apartment/Unit</label>
            <input
              type="text"
              value={isEditing ? editForm.apartment : profile.apartment}
              onChange={(e) => handleInputChange("apartment", e.target.value)}
              readOnly={!isEditing}
              className={!isEditing ? "readonly" : ""}
            />
          </div>

          <div className="form-group">
            <label className="form-label">City</label>
            <input
              type="text"
              value={isEditing ? editForm.city : profile.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
              readOnly={!isEditing}
              className={!isEditing ? "readonly" : ""}
            />
          </div>

          <div className="form-group">
            <label className="form-label">State</label>
            <select
              value={isEditing ? editForm.state : profile.state}
              onChange={(e) => handleInputChange("state", e.target.value)}
              disabled={!isEditing}
              className={!isEditing ? "readonly" : ""}
            >
              <option value="">Select State</option>
              <option value="AL">Alabama</option>
              <option value="AK">Alaska</option>
              <option value="AZ">Arizona</option>
              <option value="AR">Arkansas</option>
              <option value="CA">California</option>
              <option value="CO">Colorado</option>
              <option value="CT">Connecticut</option>
              <option value="DE">Delaware</option>
              <option value="FL">Florida</option>
              <option value="GA">Georgia</option>
              <option value="HI">Hawaii</option>
              <option value="ID">Idaho</option>
              <option value="IL">Illinois</option>
              <option value="IN">Indiana</option>
              <option value="IA">Iowa</option>
              <option value="KS">Kansas</option>
              <option value="KY">Kentucky</option>
              <option value="LA">Louisiana</option>
              <option value="ME">Maine</option>
              <option value="MD">Maryland</option>
              <option value="MA">Massachusetts</option>
              <option value="MI">Michigan</option>
              <option value="MN">Minnesota</option>
              <option value="MS">Mississippi</option>
              <option value="MO">Missouri</option>
              <option value="MT">Montana</option>
              <option value="NE">Nebraska</option>
              <option value="NV">Nevada</option>
              <option value="NH">New Hampshire</option>
              <option value="NJ">New Jersey</option>
              <option value="NM">New Mexico</option>
              <option value="NY">New York</option>
              <option value="NC">North Carolina</option>
              <option value="ND">North Dakota</option>
              <option value="OH">Ohio</option>
              <option value="OK">Oklahoma</option>
              <option value="OR">Oregon</option>
              <option value="PA">Pennsylvania</option>
              <option value="RI">Rhode Island</option>
              <option value="SC">South Carolina</option>
              <option value="SD">South Dakota</option>
              <option value="TN">Tennessee</option>
              <option value="TX">Texas</option>
              <option value="UT">Utah</option>
              <option value="VT">Vermont</option>
              <option value="VA">Virginia</option>
              <option value="WA">Washington</option>
              <option value="WV">West Virginia</option>
              <option value="WI">Wisconsin</option>
              <option value="WY">Wyoming</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">ZIP Code</label>
            <input
              type="text"
              value={isEditing ? editForm.zip : profile.zip}
              onChange={(e) => handleInputChange("zip", e.target.value)}
              readOnly={!isEditing}
              className={!isEditing ? "readonly" : ""}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              value={isEditing ? editForm.phone : profile.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              readOnly={!isEditing}
              className={!isEditing ? "readonly" : ""}
            />
          </div>

          {/* Skills */}
          <div className="form-group full-width">
            <label className="form-label">Skills & Abilities</label>
            {isEditing ? (
              <div>
                <textarea
                  value={editForm.skills.join(', ')}
                  onChange={(e) => handleInputChange("skills", e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                  placeholder="Enter skills separated by commas (e.g., Animal Care, Dog Walking, First Aid)..."
                  className="form-textarea"
                  rows={3}
                />
                <div className="skills-help">
                  <small>Enter skills separated by commas. Examples: Animal Care, Dog Walking, First Aid, Cleaning, Administrative Work</small>
                </div>
              </div>
            ) : (
              <div className="skills-display">
                {profile.skills.length > 0 ? (
                  <div className="skills-tags">
                    {profile.skills.map((skill, idx) => (
                      <span key={idx} className="skill-tag">
                        {skill}
                      </span>
                    ))}
                  </div>
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
              className={!isEditing ? "readonly" : ""}
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
                <button type="button" onClick={handleEdit} className="btn btn-primary">
                  Edit Profile
                </button>
              </>
            ) : (
              <>
                <button type="submit" className="btn btn-success">
                  Save Changes
                </button>
                <button type="button" onClick={handleCancel} className="btn btn-outline">
                  Cancel
                </button>
              </>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}

export default ProfilePage;

import React, { useState, useEffect } from "react";
import { apiFetch } from "../../../api";
import NotificationBanner from "../../../NotificationBanner";
import "../../../css/VolunteerMatchPage.css";

function VolunteerMatchPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    // Check user role from localStorage or token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role);
      } catch (err) {
        console.error('Error parsing token:', err);
      }
    }

    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Get volunteer matches from the API
      const matchData = await apiFetch('/api/volunteers/matches');
      setMatches(matchData);
    } catch (err) {
      console.error('Error loading matches:', err);
      setError('Failed to load volunteer matches');
      setBannerMessage('Error loading volunteer matches');
      setShowBanner(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignVolunteer = async (match) => {
    try {
      const response = await apiFetch('/api/volunteers/assign', {
        method: 'POST',
        body: JSON.stringify({
          volunteerId: match.volunteerId,
          eventId: match.eventId,
          taskName: `Help with ${match.event}`,
          taskDescription: `Assigned to ${match.event} at ${match.eventLocation}`,
          taskDate: match.eventDate
        })
      });
      
      setBannerMessage('Volunteer assigned successfully!');
      setShowBanner(true);
      
      // Update the match status
      setMatches(prev => prev.map(m => 
        m.id === match.id ? { ...m, status: 'assigned' } : m
      ));
    } catch (err) {
      console.error('Error assigning volunteer:', err);
      setBannerMessage('Error assigning volunteer');
      setShowBanner(true);
    }
  };

  // Check if user has admin/manager access
  if (userRole !== 'manager' && userRole !== 'admin') {
    return (
      <div className="match-page">
        <div className="match-container">
          <h2>Access Denied</h2>
          <p>You don't have permission to view volunteer matches. This page is only available to managers and administrators.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="match-page">
        <div className="match-container">
          <h2>Loading Volunteer Matches...</h2>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="match-page">
      <NotificationBanner 
        message={bannerMessage}
        show={showBanner}
        onClose={() => setShowBanner(false)}
      />

      <div className="match-container">
        <div className="match-header">
          <h2>Volunteer Matches</h2>
          <button onClick={loadMatches} className="refresh-btn">
            Refresh Matches
          </button>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {matches.length === 0 ? (
          <div className="no-matches">
            <p>No volunteer matches found. Create some events with required skills to see matches.</p>
          </div>
        ) : (
          <div className="match-grid">
            {matches.map((match) => (
              <div key={match.id} className={`match-card ${match.status}`}>
                <div className="match-header">
                  <h3>{match.volunteerName}</h3>
                  <span className={`status-badge ${match.status}`}>
                    {match.status}
                  </span>
                </div>
                <div className="match-details">
                  <p><strong>Event:</strong> {match.event}</p>
                  <p><strong>Date:</strong> {new Date(match.eventDate).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {match.eventTime}</p>
                  <p><strong>Location:</strong> {match.eventLocation}</p>
                  <p><strong>Urgency:</strong> 
                    <span className={`urgency-badge ${match.urgency}`}>
                      {match.urgency}
                    </span>
                  </p>
                  <p><strong>Required Skills:</strong> {match.requiredSkills.join(", ") || "None specified"}</p>
                  <p><strong>Volunteer Skills:</strong> {match.volunteerSkills.join(", ") || "None specified"}</p>
                  <p><strong>Match Score:</strong> {match.matchScore}%</p>
                  <p><strong>Availability Match:</strong> 
                    <span className={`availability-badge ${match.availabilityMatch ? 'yes' : 'no'}`}>
                      {match.availabilityMatch ? 'Yes' : 'No'}
                    </span>
                  </p>
                  <p><strong>Email:</strong> {match.volunteerEmail}</p>
                </div>
                {match.status === 'pending' && (
                  <button 
                    onClick={() => handleAssignVolunteer(match)}
                    className="assign-btn"
                  >
                    Assign Volunteer
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default VolunteerMatchPage;

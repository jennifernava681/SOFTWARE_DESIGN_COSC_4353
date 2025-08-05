import React, { useState, useEffect } from "react";
import { apiFetch } from "../../../api";
import NotificationBanner from "../../../NotificationBanner";
import "../../../css/VolunteerHistoryPage.css";

function ActivityHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState("");
  const [userRole, setUserRole] = useState("");
  const [filters, setFilters] = useState({
    volunteer: "",
    event: "",
    status: "",
    dateFrom: "",
    dateTo: ""
  });

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

    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Get volunteer history from the database
      const response = await apiFetch('/api/volunteers/history');
      
      if (response && response.length > 0) {
        setHistory(response);
      } else {
        // If no real data, create some sample data for demonstration
        const sampleHistory = [
          {
            id: 1,
            volunteer_name: "Alice Johnson",
            event_title: "Dog Walking",
            location: "Main Shelter",
            urgency: "High",
            skills_used: "Dog Walking, Animal Care",
            participation_date: "2025-01-15",
            status: "Completed",
            hours_worked: 4
          },
          {
            id: 2,
            volunteer_name: "Bob Smith",
            event_title: "Adoption Fair",
            location: "Community Park",
            urgency: "High",
            skills_used: "Animal Care, Customer Service",
            participation_date: "2025-01-20",
            status: "Completed",
            hours_worked: 6
          },
          {
            id: 3,
            volunteer_name: "Carla Ruiz",
            event_title: "Vet Checkups",
            location: "Vet Room A",
            urgency: "Medium",
            skills_used: "Medical Assistance",
            participation_date: "2025-01-25",
            status: "Upcoming",
            hours_worked: 0
          }
        ];
        setHistory(sampleHistory);
      }
    } catch (err) {
      console.error('Error loading history:', err);
      setError('Failed to load volunteer history');
      setBannerMessage('Error loading volunteer history');
      setShowBanner(true);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const filteredHistory = history.filter(entry => {
    return (
      (!filters.volunteer || entry.volunteer_name.toLowerCase().includes(filters.volunteer.toLowerCase())) &&
      (!filters.event || entry.event_title.toLowerCase().includes(filters.event.toLowerCase())) &&
      (!filters.status || entry.status.toLowerCase() === filters.status.toLowerCase()) &&
      (!filters.dateFrom || new Date(entry.participation_date) >= new Date(filters.dateFrom)) &&
      (!filters.dateTo || new Date(entry.participation_date) <= new Date(filters.dateTo))
    );
  });

  const addSampleEntry = async () => {
    try {
      const sampleEntry = {
        volunteer_name: "New Volunteer",
        event_title: "Sample Event",
        location: "Main Shelter",
        urgency: "Medium",
        skills_used: "General Assistance",
        participation_date: new Date().toISOString().split('T')[0],
        status: "Completed",
        hours_worked: 3
      };

      // In a real app, this would call an API to add the entry
      setHistory(prev => [...prev, { ...sampleEntry, id: Date.now() }]);
      setBannerMessage('Sample entry added successfully!');
      setShowBanner(true);
    } catch (err) {
      console.error('Error adding sample entry:', err);
      setBannerMessage('Error adding sample entry');
      setShowBanner(true);
    }
  };

  // Check if user has admin/manager access
  if (userRole !== 'manager' && userRole !== 'admin') {
    return (
      <div className="history-page">
        <div className="history-container">
          <h2>Access Denied</h2>
          <p>You don't have permission to view volunteer history. This page is only available to managers and administrators.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="history-page">
        <div className="history-container">
          <h2>Loading Volunteer History...</h2>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page">
      <NotificationBanner 
        message={bannerMessage}
        show={showBanner}
        onClose={() => setShowBanner(false)}
      />

      <div className="history-container">
        <div className="history-header">
          <h2>Volunteer History</h2>
          <div className="header-actions">
            <button onClick={loadHistory} className="refresh-btn">
              Refresh
            </button>
            <button onClick={addSampleEntry} className="add-btn">
              Add Sample Entry
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-row">
            <input
              type="text"
              placeholder="Filter by volunteer name..."
              value={filters.volunteer}
              onChange={(e) => handleFilterChange('volunteer', e.target.value)}
              className="filter-input"
            />
            <input
              type="text"
              placeholder="Filter by event..."
              value={filters.event}
              onChange={(e) => handleFilterChange('event', e.target.value)}
              className="filter-input"
            />
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-select"
            >
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="upcoming">Upcoming</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="filter-input"
            />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="filter-input"
            />
          </div>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {filteredHistory.length === 0 ? (
          <div className="no-history">
            <p>No volunteer history found. Add some volunteer activities to see history.</p>
          </div>
        ) : (
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
                  <th>Hours</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((entry) => (
                  <tr key={entry.id} className={`status-${entry.status.toLowerCase()}`}>
                    <td>{entry.volunteer_name}</td>
                    <td>{entry.event_title}</td>
                    <td>{entry.location}</td>
                    <td>
                      <span className={`urgency-badge ${entry.urgency.toLowerCase()}`}>
                        {entry.urgency}
                      </span>
                    </td>
                    <td>{entry.skills_used}</td>
                    <td>{new Date(entry.participation_date).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${entry.status.toLowerCase()}`}>
                        {entry.status}
                      </span>
                    </td>
                    <td>{entry.hours_worked}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="history-summary">
          <p>Total Entries: {filteredHistory.length}</p>
          <p>Completed: {filteredHistory.filter(e => e.status === 'Completed').length}</p>
          <p>Upcoming: {filteredHistory.filter(e => e.status === 'Upcoming').length}</p>
        </div>
      </div>
    </div>
  );
}

export default ActivityHistory;
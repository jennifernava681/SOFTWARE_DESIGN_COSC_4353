import React, { useState, useEffect } from "react";
import { apiFetch } from "../../../api";
import "../../../css/EventFormPage.css";

const EventManager = () => {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    max_volunteers: "",
    urgency: "low",
    required_skills: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [error, setError] = useState(null);

  const urgencyLevels = ["low", "medium", "high", "critical"];
  const availableSkills = [
    "Animal Handling",
    "Medical Experience", 
    "Heavy Lifting",
    "Dog Training",
    "Cat Care",
    "Administrative Skills",
    "Driving License",
    "Event Planning"
  ];

  // Load existing events
  useEffect(() => {
    loadEvents();
    
    // Test API connection
    const testAPI = async () => {
      try {
        console.log('Testing API connection...');
        const testResponse = await apiFetch('/api/test');
        console.log('API test response:', testResponse);
      } catch (err) {
        console.error('API test failed:', err);
      }
    };
    
    testAPI();
  }, []);

  const loadEvents = async () => {
    try {
      const eventsData = await apiFetch('/api/events');
      setEvents(eventsData);
    } catch (err) {
      console.error('Error loading events:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addSkill = (skill) => {
    if (!formData.required_skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        required_skills: [...prev.required_skills, skill]
      }));
    }
  };

  const removeSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      required_skills: prev.required_skills.filter(s => s !== skill)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log('Submitting event data:', formData);
      console.log('User token:', localStorage.getItem('token'));
      
      // Check if user is authenticated and has manager role
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('User data:', user);
      
      if (!user.role || user.role !== 'manager') {
        setError('Only managers can create events. Please log in with a manager account.');
        return;
      }
      
      const response = await apiFetch('/api/events', 'POST', formData);

      if (response) {
        setShowSuccessMessage(true);
        resetForm();
        await loadEvents(); // Reload events
        setTimeout(() => setShowSuccessMessage(false), 3000);
      }
    } catch (err) {
      console.error('Event creation error:', err);
      setError(err.message || 'Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      max_volunteers: "",
      urgency: "low",
      required_skills: []
    });
  };

  const getUrgencyClass = (urgency) => {
    switch (urgency) {
      case "critical": return "badge-priority-urgent";
      case "high": return "badge-priority-high";
      case "medium": return "badge-priority-medium";
      case "low": return "badge-priority-low";
      default: return "badge-secondary";
    }
  };

  const getRegistrationStatus = (event) => {
    if (!event.max_volunteers) return "No limit";
    const registered = event.registered_volunteers || 0;
    const remaining = event.max_volunteers - registered;
    
    if (remaining <= 0) return "Full";
    return `${registered}/${event.max_volunteers} registered`;
  };

  return (
    <div className="event-manager">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="notification-overlay">
          <div className="notification-banner floating show">
            <svg className="icon" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Event created successfully!
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="notification-overlay">
          <div className="notification-banner floating show error">
            <svg className="icon" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        </div>
      )}

      <div className="event-container">
        <div className="event-header">
          <h1 className="event-title">Event Management</h1>
          <p className="event-subtitle">Create and manage shelter events</p>
        </div>

        <div className="event-grid">
          {/* Event Creation Form */}
          <div className="event-card">
            <div className="card-header">
              <h2 className="card-title">
                <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Event
              </h2>
              <p className="card-description">Fill out the details to create a new event</p>
            </div>
            <div className="card-content">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="title" className="form-label">
                    Event Title *
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    className="form-input"
                    placeholder="e.g., Adoption Fair, Volunteer Orientation"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description" className="form-label">
                    Event Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className="form-textarea"
                    placeholder="Detailed description of the event..."
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-grid form-grid-2">
                  <div className="form-group">
                    <label htmlFor="date" className="form-label">
                      Event Date *
                    </label>
                    <input
                      id="date"
                      name="date"
                      type="date"
                      className="form-input"
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="time" className="form-label">
                      Event Time
                    </label>
                    <input
                      id="time"
                      name="time"
                      type="time"
                      className="form-input"
                      value={formData.time}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="location" className="form-label">
                    Location *
                  </label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    className="form-input"
                    placeholder="e.g., Main Shelter, Community Center"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-grid form-grid-2">
                  <div className="form-group">
                    <label htmlFor="max_volunteers" className="form-label">
                      Max Volunteers
                    </label>
                    <input
                      id="max_volunteers"
                      name="max_volunteers"
                      type="number"
                      className="form-input"
                      placeholder="Leave empty for no limit"
                      value={formData.max_volunteers}
                      onChange={handleChange}
                      min="1"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="urgency" className="form-label">
                      Urgency Level
                    </label>
                    <select
                      id="urgency"
                      name="urgency"
                      className="form-select"
                      value={formData.urgency}
                      onChange={handleChange}
                    >
                      {urgencyLevels.map(level => (
                        <option key={level} value={level}>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Required Skills</label>
                  <div className="skills-container">
                    {formData.required_skills.map((skill) => (
                      <span
                        key={skill}
                        className="badge badge-secondary badge-removable"
                        onClick={() => removeSkill(skill)}
                        title="Click to remove"
                      >
                        {skill} ×
                      </span>
                    ))}
                  </div>
                  <select
                    className="form-select"
                    onChange={(e) => {
                      if (e.target.value) {
                        addSkill(e.target.value);
                        e.target.value = "";
                      }
                    }}
                  >
                    <option value="">Add required skills</option>
                    {availableSkills
                      .filter((skill) => !formData.required_skills.includes(skill))
                      .map((skill) => (
                        <option key={skill} value={skill}>
                          {skill}
                        </option>
                      ))}
                  </select>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary btn-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Event..." : "Create Event"}
                </button>
              </form>
            </div>
          </div>

          {/* Events List */}
          <div className="event-card">
            <div className="card-header">
              <h2 className="card-title">Created Events</h2>
              <p className="card-description">
                {events.length} event{events.length !== 1 ? "s" : ""} created
              </p>
            </div>
            <div className="card-content">
              <div className="event-list">
                {events.length === 0 ? (
                  <div className="empty-state">
                    <p>No events created yet. Create your first event using the form.</p>
                  </div>
                ) : (
                  events
                    .slice()
                    .reverse()
                    .map((event) => (
                      <div key={event.id} className="event-item">
                        <div className="event-item-header">
                          <h3 className="event-item-title">{event.title}</h3>
                          <span className={`badge ${getUrgencyClass(event.urgency)}`}>
                            {event.urgency}
                          </span>
                        </div>

                        <p className="event-item-description">{event.description}</p>

                        <div className="event-separator"></div>

                        <div className="event-item-meta">
                          <div className="event-item-meta-item">
                            <svg className="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            {new Date(event.date).toLocaleDateString()}
                          </div>
                          {event.time && (
                            <div className="event-item-meta-item">
                              <svg className="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              {event.time}
                            </div>
                          )}
                          <div className="event-item-meta-item">
                            <svg className="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            {event.location}
                          </div>
                          <div className="event-item-meta-item">
                            <svg className="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            {getRegistrationStatus(event)}
                          </div>
                        </div>

                        {event.required_skills && event.required_skills.length > 0 && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.75rem" }}>
                            {event.required_skills.map((skill) => (
                              <span key={skill} className="badge badge-secondary">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventManager;
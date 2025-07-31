"use client"
import { useState, useEffect } from "react"
import "../../css/home.css"

// API Configuration
const API_BASE_URL = "https://hopepaws-api-hfbwhtazhsg4cjbb.centralus-01.azurewebsites.net/api"

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

// Check if user is authenticated
const isAuthenticated = () => {
  const token = localStorage.getItem("token")
  return token && token.length > 0
}

// API Functions
const getAllEvents = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: "GET",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const events = await response.json()
    return events
  } catch (error) {
    console.error("Error fetching events:", error)
    return []
  }
}

const registerForEvent = async (eventId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/register`, {
      method: "POST",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error("Registration error:", error)
    throw error
  }
}

const getMyRegisteredEvents = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/events/my/registered`, {
      method: "GET",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      if (response.status === 401) {
        // User not authenticated, return empty array
        return []
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const events = await response.json()
    return events
  } catch (error) {
    console.error("Error fetching registered events:", error)
    return []
  }
}

// Reuse icons and header layout from HomePage
const PawIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <ellipse cx="12" cy="16" rx="4" ry="3" />
    <circle cx="8" cy="10" r="1.5" />
    <circle cx="12" cy="8" r="1.5" />
    <circle cx="16" cy="10" r="1.5" />
    <circle cx="18" cy="13" r="1.2" />
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

const MenuIcon = () => (
  <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
    <path d="M4 6h16M4 12h16M4 18h16" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

function MyEvents() {
  const [events, setEvents] = useState([])
  const [registeredEvents, setRegisteredEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(null)
  const [userAuthenticated, setUserAuthenticated] = useState(false)

  // Load events and registered events
  const loadEvents = async () => {
    try {
      setLoading(true)
      const authenticated = isAuthenticated()
      setUserAuthenticated(authenticated)

      // Always load all events
      const allEvents = await getAllEvents()
      setEvents(allEvents)

      // Only load registered events if user is authenticated
      if (authenticated) {
        const myEvents = await getMyRegisteredEvents()
        setRegisteredEvents(myEvents.map((event) => event.id))
      } else {
        setRegisteredEvents([])
      }
    } catch (err) {
      console.error("Error loading events:", err)
      // Fallback to empty arrays if API fails
      setEvents([])
      setRegisteredEvents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  const handleRegister = async (eventId) => {
    if (!userAuthenticated) {
      alert("Please log in to register for events.")
      return
    }

    try {
      setRegistering(eventId)
      await registerForEvent(eventId)

      setRegisteredEvents((prev) => [...prev, eventId])

      // Update registered volunteers count locally
      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId ? { ...event, registered_volunteers: (event.registered_volunteers || 0) + 1 } : event,
        ),
      )

      alert("Successfully registered for the event!")
    } catch (err) {
      if (err.message.includes("401") || err.message.includes("Unauthorized")) {
        alert("Please log in to register for events.")
      } else {
        alert(err.message || "Failed to register for event. Please try again.")
      }
    } finally {
      setRegistering(null)
    }
  }

  const handleUnregister = (eventId) => {
    setRegisteredEvents(registeredEvents.filter((id) => id !== eventId))
  }

  if (loading) {
    return (
      <section id="events" className="events">
        <div className="events-container">
          <div className="section-header">
            <h3 className="section-title">Loading Events...</h3>
            <p className="section-description">Please wait while we load the latest events.</p>
            <div className="section-divider"></div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="events" className="events">
      <div className="events-container">
        <div className="section-header">
          <h3 className="section-title">Upcoming Events</h3>
          <p className="section-description">
            Join our community events and help us make a difference in the lives of animals in need.
            {!userAuthenticated && " (Log in to register for events)"}
          </p>
          <div className="section-divider"></div>
        </div>
        <div className="events-grid">
          {events.map((event) => (
            <div key={event.id} className="event-card">
              <div className="event-header">
                <div className="event-header-content">
                  <h4 className="event-title">{event.title}</h4>
                  <span className="event-type">
                    {event.urgency ? event.urgency.charAt(0).toUpperCase() + event.urgency.slice(1) : "Event"}
                  </span>
                </div>
                <p className="event-date">
                  <CalendarIcon />
                  <span style={{ marginLeft: "0.75rem" }}>
                    {new Date(event.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    {event.time && `• ${event.time}`}
                  </span>
                </p>
                <p className="event-location">
                  <MapPinIcon />
                  <span style={{ marginLeft: "0.75rem" }}>{event.location}</span>
                </p>
              </div>
              <div className="event-content">
                {!userAuthenticated ? (
                  <button
                    className="btn-event"
                    onClick={() => alert("Please log in to register for events.")}
                    style={{
                      backgroundColor: "#6c757d",
                      cursor: "pointer",
                    }}
                  >
                    Log in to Register
                  </button>
                ) : registeredEvents.includes(event.id) ? (
                  <>
                    <button className="btn-event registered" disabled>
                      Registered
                    </button>
                    <button
                      className="btn-event cancel"
                      onClick={() => handleUnregister(event.id)}
                      style={{
                        marginTop: "0.75rem",
                        backgroundColor: "#ccc",
                        color: "#333",
                      }}
                    >
                      Unregister
                    </button>
                  </>
                ) : (
                  <button
                    className="btn-event"
                    onClick={() => handleRegister(event.id)}
                    disabled={registering === event.id}
                  >
                    {registering === event.id ? "Registering..." : "Register for Event"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {events.length === 0 && !loading && (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <p>No events available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default MyEvents

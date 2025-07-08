import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import "../../css/home.css";

// Reuse icons and header layout from HomePage
const PawIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <ellipse cx="12" cy="16" rx="4" ry="3" />
    <circle cx="8" cy="10" r="1.5" />
    <circle cx="12" cy="8" r="1.5" />
    <circle cx="16" cy="10" r="1.5" />
    <circle cx="18" cy="13" r="1.2" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H18V1H16V3H8V1H6V3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M19 19H5V8H19V19M7 10H12V15H7" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2M12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5Z" />
  </svg>
);

const MenuIcon = () => (
    <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
        <path d="M4 6h16M4 12h16M4 18h16" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
)

const upcomingEvents = [
  {
    id: 1,
    title: "Weekend Adoption Fair",
    date: "January 20, 2024",
    time: "10:00 AM - 4:00 PM",
    type: "Adoption",
    location: "Hope Paws Main Campus",
  },
  {
    id: 2,
    title: "Charity Fundraising Gala",
    date: "January 25, 2024",
    time: "6:00 PM - 10:00 PM",
    type: "Fundraising",
    location: "Downtown Community Center",
  },
  {
    id: 3,
    title: "Puppy Play Date & Adoption Event",
    date: "February 3, 2024",
    time: "11:00 AM - 2:00 PM",
    type: "Adoption",
    location: "City Park Pavilion",
  },
  {
    id: 4,
    title: "Low-Cost Vaccination Clinic",
    date: "March 10, 2024",
    time: "9:00 AM - 12:00 PM",
    type: "Health",
    location: "Hope Paws Veterinary Center",
  }
];

function MyEvents() {

  const [registeredEvents, setRegisteredEvents] = useState([]);

  const handleRegister = (eventId) => {
    if(!registeredEvents.includes(eventId)){
      setRegisteredEvents([...registeredEvents, eventId]);
    }
  };

  const handleUnregister = (eventId) => {
    setRegisteredEvents(registeredEvents.filter((id) => id !== eventId));
  }

  return (
    <section id="events" className="events">
      <div className="events-container">
        <div className="section-header">
          <h3 className="section-title">Upcoming Events</h3>
          <p className="section-description">
            Join our community events and help us make a difference in the lives
            of animals in need.
          </p>
          <div className="section-divider"></div>
        </div>
        <div className="events-grid">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="event-card">
              <div className="event-header">
                <div className="event-header-content">
                  <h4 className="event-title">{event.title}</h4>
                  <span className="event-type">{event.type}</span>
                </div>
                <p className="event-date">
                  <CalendarIcon />
                  <span style={{ marginLeft: "0.75rem" }}>
                    {event.date} • {event.time}
                  </span>
                </p>
                <p className="event-location">
                  <MapPinIcon />
                  <span style={{ marginLeft: "0.75rem" }}>
                    {event.location}
                  </span>
                </p>
              </div>
              <div className="event-content">
                {registeredEvents.includes(event.id) ? (
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
                  >
                    Register for Event
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );


}

export default MyEvents;
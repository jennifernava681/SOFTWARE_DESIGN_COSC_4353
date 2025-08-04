import React, { useState } from "react";
import NotificationBanner from '../../../NotificationBanner.jsx';
import NotificationBell from '../../../components/NotificationBell';
import { apiFetch } from '../../../api';
import { useNotifications } from '../../../hooks/useNotifications';

function VolunteerDash() {
  const { unreadCount, notifications } = useNotifications();
  const [apiBanner, setApiBanner] = useState("");
  const [showApiBanner, setShowApiBanner] = useState(false);

  // Example notification messages for testing
  const notificationTemplates = [
    {
      label: "New Event Assignment",
      message: "You have been assigned to the 'Adoption Fair' event on March 10th! Check your tasks for details.",
    },
    {
      label: "Event Update",
      message: "The location for 'Adoption Fair' has changed to Community Park Pavilion.",
    },
    {
      label: "Event Reminder",
      message: "Reminder: 'Adoption Fair' starts tomorrow at 10:00 AM. Please arrive 15 minutes early!",
    },
  ];

  const pingTestPost = async () => {
    setApiBanner("");
    setShowApiBanner(false);
    try {
      const data = await apiFetch("/api/test", "POST", { test: true });
      setApiBanner(data.message || "POST success");
    } catch (err) {
      setApiBanner("POST network error");
    }
    setShowApiBanner(true);
  };

  const pingTestGet = async () => {
    setApiBanner("");
    setShowApiBanner(false);
    try {
      const data = await apiFetch("/api/test", "GET");
      setApiBanner(data.message || "GET success");
    } catch (err) {
      setApiBanner("GET network error");
    }
    setShowApiBanner(true);
  };

  // Overlay container for API test banner
  const overlayStyle = {
    position: 'fixed',
    top: '2.5rem',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 9999,
    width: '100%',
    maxWidth: 600,
    pointerEvents: 'none',
    height: 'auto',
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 600, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2>Volunteer Dashboard</h2>
          <p>Welcome! Here you will see important notifications about your event assignments and updates.</p>
        </div>
        <NotificationBell position="top-right" />
      </div>

      <div style={{ display: 'flex', gap: '1rem', margin: '1.5rem 0' }}>
        {notificationTemplates.map((n, idx) => (
          <button
            key={idx}
            onClick={() => console.log('Test notification:', n.message)}
            style={{ padding: '0.75rem 1.5rem', borderRadius: 8, border: 'none', background: '#286FB4', color: 'white', cursor: 'pointer', fontWeight: 600 }}
          >
            {n.label}
          </button>
        ))}
        <button
          onClick={pingTestPost}
          style={{ background: '#4CAF50', color: 'white', border: 'none', borderRadius: 8, padding: '0.75rem 1.5rem', fontWeight: 600, cursor: 'pointer' }}
        >
          Test POST /api/test
        </button>
        <button
          onClick={pingTestGet}
          style={{ background: '#2196F3', color: 'white', border: 'none', borderRadius: 8, padding: '0.75rem 1.5rem', fontWeight: 600, cursor: 'pointer' }}
        >
          Test GET /api/test
        </button>
      </div>

      {/* API Test Banner */}
      <div style={overlayStyle}>
        <NotificationBanner
          message={apiBanner}
          floating
          show={showApiBanner}
          onClose={() => setShowApiBanner(false)}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            transform: 'translateY(0px)',
            zIndex: 100,
            boxShadow: '0 16px 32px -8px rgba(76,175,80,0.18), 0 2px 8px -2px rgba(0,0,0,0.10)',
            opacity: showApiBanner ? 1 : 0,
            transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.18s cubic-bezier(0.4,0,0.2,1)',
            pointerEvents: 'auto',
          }}
        />
      </div>

    </div>
  );
}

export default VolunteerDash;

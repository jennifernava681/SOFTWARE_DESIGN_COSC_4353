import React, { useState, useRef } from "react";
import NotificationBanner from '../../../NotificationBanner.jsx';
import { apiFetch } from '../../../api';

function VolunteerDash() {
  const [notifications, setNotifications] = useState([]);
  const [notifCount, setNotifCount] = useState(0); // notif badge count
  const notifId = useRef(0);
  const [apiBanner, setApiBanner] = useState("");
  const [showApiBanner, setShowApiBanner] = useState(false);

  // Example notification messages
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

  // Add a new notification 
  const triggerNotification = (message) => {
    const id = notifId.current++;
    setNotifications((prev) => [{ id, message, show: false }, ...prev]);
    setNotifCount((prev) => prev + 1);
    // Fade in after mount
    setTimeout(() => {
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, show: true } : n));
    }, 10);
    
    setTimeout(() => {
      setNotifications((prev) => {
        if (prev.length === 0) return prev;
        const oldest = prev[prev.length - 1].id;
        return prev.map((n) => n.id === oldest ? { ...n, show: false } : n);
      });
      // Remove from DOM after fade out
      setTimeout(() => {
        setNotifications((prev) => prev.slice(0, -1));
      }, 400);
    }, 4000);
  };

  // Clear badge count (simulate going to notifications page)
  const clearNotifCount = () => setNotifCount(0);

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

  // Overlay container for stacking notifications
  const overlayStyle = {
    position: 'fixed',
    top: '2.5rem',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 9999, // this makes it on the very tippy top
    width: '100%',
    maxWidth: 600,
    pointerEvents: 'none',
    height: 'auto',
  };

  // Notification gap for stacking
  const NOTIF_OVERLAP = 32; // in px, how much each notif overlaps the previous

  return (
    <div style={{ padding: '2rem', maxWidth: 600, margin: '0 auto' }}>
      <h2>Volunteer Dashboard</h2>
      <p>Welcome! Here you will see important notifications about your event assignments and updates.</p>

      <div style={{ display: 'flex', gap: '1rem', margin: '1.5rem 0' }}>
        {notificationTemplates.map((n, idx) => (
          <button
            key={idx}
            onClick={() => triggerNotification(n.message)}
            style={{ padding: '0.75rem 1.5rem', borderRadius: 8, border: 'none', background: '#286FB4', color: 'white', cursor: 'pointer', fontWeight: 600 }}
          >
            {n.label}
          </button>
        ))}
        <button
          onClick={clearNotifCount}
          style={{ marginLeft: 'auto', background: '#DF4C73', color: 'white', border: 'none', borderRadius: 8, padding: '0.75rem 1.5rem', fontWeight: 600, cursor: 'pointer' }}
        >
          Clear Notifications
        </button>
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

      {/* Notification Overlay Stack */}
      <div style={overlayStyle}>
        {notifications.map((notif, idx) => (
          <NotificationBanner
            key={notif.id}
            message={notif.message}
            floating
            show={notif.show}
            onClose={() => {
              // Fade out this notification
              setNotifications((prev) => prev.map((n) => n.id === notif.id ? { ...n, show: false } : n));
              // Remove from DOM after fade out
              setTimeout(() => {
                setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
              }, 400);
            }}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              // Each notification is layered above the previous, slightly shifted down
              transform: `translateY(${(NOTIF_OVERLAP) * idx}px)`,
              zIndex: 100 + (notifications.length - idx),
              boxShadow: idx === 0 ? '0 16px 32px -8px rgba(40,111,180,0.18), 0 2px 8px -2px rgba(0,0,0,0.10)' : '0 4px 12px rgba(40,111,180,0.10)',
              opacity: notif.show ? 1 : 0,
              transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.18s cubic-bezier(0.4,0,0.2,1)',
              pointerEvents: 'auto',
            }}
          />
        ))}
        {/* API Test Banner */}
        <NotificationBanner
          message={apiBanner}
          floating
          show={showApiBanner}
          onClose={() => setShowApiBanner(false)}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            transform: `translateY(${(NOTIF_OVERLAP) * notifications.length}px)`,
            zIndex: 100 + notifications.length + 1,
            boxShadow: '0 16px 32px -8px rgba(76,175,80,0.18), 0 2px 8px -2px rgba(0,0,0,0.10)',
            opacity: showApiBanner ? 1 : 0,
            transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.18s cubic-bezier(0.4,0,0.2,1)',
            pointerEvents: 'auto',
          }}
        />
        {/* Notification count badge (note the count is  hidden if its 0) */}
        {notifCount > 0 && (
          <div style={{
            position: 'absolute',
            top: -28,
            right: 24,
            background: '#DF4C73',
            color: 'white',
            borderRadius: '999px',
            padding: '0.25rem 0.75rem',
            fontWeight: 700,
            fontSize: '1rem',
            boxShadow: '0 2px 8px rgba(40,111,180,0.10)',
            zIndex: 10000,
            pointerEvents: 'none',
          }}>
            {notifCount}
          </div>
        )}
      </div>

    </div>
  );
}

export default VolunteerDash;

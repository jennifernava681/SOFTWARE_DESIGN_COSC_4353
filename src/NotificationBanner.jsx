import React from 'react';

function NotificationBanner({ message, floating = false, show = true, onClose, style }) {
  if (!message) return null;

  // Floating overlay mode
  if (floating) {
    return (
      <div className="notification-overlay" style={style}>
        <div className={`notification-banner floating${show ? ' show' : ' hide'}`}
             role="alert"
             style={{ minWidth: 0, pointerEvents: 'auto', display: 'flex', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ marginRight: '0.75rem' }}>
              <circle cx="12" cy="12" r="12" fill="#15803d" fillOpacity="0.15" />
              <circle cx="12" cy="12" r="10" stroke="#15803d" strokeWidth="2" fill="none" />
              <path d="M12 8.5a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5zm-1 3.5h2v5h-2v-5z" fill="#15803d" />
            </svg>
          </span>
          <span style={{ flex: 1 }}>{message}</span>
          {onClose && (
            <button
              aria-label="Close notification"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#14532d',
                fontSize: '1.5rem',
                fontWeight: 700,
                marginLeft: '1rem',
                cursor: 'pointer',
                padding: '0 0.5rem',
                lineHeight: 1,
                opacity: 0.7,
                transition: 'opacity 0.2s',
                alignSelf: 'center',
              }}
              onMouseOver={e => (e.currentTarget.style.opacity = 1)}
              onMouseOut={e => (e.currentTarget.style.opacity = 0.7)}
            >
              &times;
            </button>
          )}
        </div>
      </div>
    );
  }

  // Default inline mode
  return (
    <div className="notification-banner" style={style}>
      <span style={{ display: 'flex', alignItems: 'center' }}>
        {/* Info Icon in green */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ marginRight: '0.75rem' }}>
          <circle cx="12" cy="12" r="12" fill="#15803d" fillOpacity="0.15" />
          <circle cx="12" cy="12" r="10" stroke="#15803d" strokeWidth="2" fill="none" />
          <path d="M12 8.5a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5zm-1 3.5h2v5h-2v-5z" fill="#15803d" />
        </svg>
      </span>
      <span>{message}</span>
    </div>
  );
}

export default NotificationBanner;

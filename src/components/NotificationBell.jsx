import React, { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import NotificationCenter from './NotificationCenter';
import '../css/NotificationBell.css';

const NotificationBell = ({ 
  position = 'top-right',
  showCount = true,
  className = '',
  style = {}
}) => {
  const { unreadCount } = useNotifications();
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);

  const handleBellClick = () => {
    setShowNotificationCenter(!showNotificationCenter);
  };

  const handleCloseNotificationCenter = () => {
    setShowNotificationCenter(false);
  };

  return (
    <div className={`notification-bell-container ${className}`} style={style}>
      <button
        className="notification-bell"
        onClick={handleBellClick}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        title={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="bell-icon"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        
        {showCount && unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationCenter
        show={showNotificationCenter}
        onClose={handleCloseNotificationCenter}
        position={position}
      />
    </div>
  );
};

export default NotificationBell; 
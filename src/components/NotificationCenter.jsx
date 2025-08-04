import React, { useState, useEffect, useRef } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import NotificationBanner from '../NotificationBanner';
import '../css/NotificationCenter.css';

const NotificationCenter = ({ 
  show = false, 
  onClose, 
  position = 'top-right',
  maxNotifications = 5,
  autoHide = true,
  autoHideDelay = 5000
}) => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    error,
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();
  
  const [visibleNotifications, setVisibleNotifications] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const timeoutRef = useRef(null);

  // Filter and sort notifications
  const sortedNotifications = notifications
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, showAll ? notifications.length : maxNotifications);

  // Show new notifications automatically
  useEffect(() => {
    if (!show || !autoHide) return;

    const newUnreadNotifications = notifications
      .filter(notif => !notif.is_read)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3); // Show max 3 new notifications at once

    if (newUnreadNotifications.length > 0) {
      setVisibleNotifications(prev => {
        const existingIds = prev.map(n => n.notifications_id);
        const newNotifications = newUnreadNotifications.filter(
          notif => !existingIds.includes(notif.notifications_id)
        );
        return [...newNotifications, ...prev].slice(0, 5);
      });

      // Auto-hide after delay
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setVisibleNotifications([]);
      }, autoHideDelay);
    }
  }, [notifications, show, autoHide, autoHideDelay]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.notifications_id);
    }
    
    // Remove from visible notifications
    setVisibleNotifications(prev => 
      prev.filter(n => n.notifications_id !== notification.notifications_id)
    );
  };

  const handleDeleteNotification = async (notificationId, event) => {
    event.stopPropagation();
    await deleteNotification(notificationId);
    
    // Remove from visible notifications
    setVisibleNotifications(prev => 
      prev.filter(n => n.notifications_id !== notificationId)
    );
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'event_assignment':
        return '📅';
      case 'event_reminder':
        return '⏰';
      case 'event_update':
        return '📢';
      case 'task_assignment':
        return '📋';
      case 'adoption_update':
        return '🐾';
      case 'donation_received':
        return '💰';
      default:
        return 'ℹ️';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'event_assignment':
        return '#3b82f6'; // blue
      case 'event_reminder':
        return '#f59e0b'; // amber
      case 'event_update':
        return '#10b981'; // emerald
      case 'task_assignment':
        return '#8b5cf6'; // violet
      case 'adoption_update':
        return '#ef4444'; // red
      case 'donation_received':
        return '#06b6d4'; // cyan
      default:
        return '#6b7280'; // gray
    }
  };

  if (!show) return null;

  return (
    <div className={`notification-center ${position}`}>
      {/* Header */}
      <div className="notification-header">
        <h3>Notifications {unreadCount > 0 && `(${unreadCount})`}</h3>
        <div className="notification-actions">
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="mark-all-read-btn"
              title="Mark all as read"
            >
              ✓
            </button>
          )}
          <button 
            onClick={onClose}
            className="close-btn"
            title="Close"
          >
            ×
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="notification-loading">
          <div className="loading-spinner"></div>
          <span>Loading notifications...</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="notification-error">
          <span>Error loading notifications: {error}</span>
        </div>
      )}

      {/* Notifications list */}
      <div className="notifications-list">
        {sortedNotifications.length === 0 ? (
          <div className="no-notifications">
            <span>No notifications</span>
          </div>
        ) : (
          sortedNotifications.map((notification) => (
            <div
              key={notification.notifications_id}
              className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notification)}
              style={{
                borderLeftColor: getNotificationColor(notification.type)
              }}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-content">
                <div className="notification-message">
                  {notification.message}
                </div>
                <div className="notification-meta">
                  <span className="notification-time">
                    {formatTimeAgo(notification.created_at)}
                  </span>
                  <span className="notification-type">
                    {notification.type.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <div className="notification-actions">
                <button
                  onClick={(e) => handleDeleteNotification(notification.notifications_id, e)}
                  className="delete-btn"
                  title="Delete notification"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Show more/less toggle */}
      {notifications.length > maxNotifications && (
        <div className="notification-footer">
          <button
            onClick={() => setShowAll(!showAll)}
            className="toggle-btn"
          >
            {showAll ? 'Show less' : `Show ${notifications.length - maxNotifications} more`}
          </button>
        </div>
      )}

      {/* Floating notifications overlay */}
      <div className="floating-notifications">
        {visibleNotifications.map((notification, index) => (
          <NotificationBanner
            key={notification.notifications_id}
            message={notification.message}
            floating
            show={true}
            onClose={() => {
              setVisibleNotifications(prev => 
                prev.filter(n => n.notifications_id !== notification.notifications_id)
              );
              if (!notification.is_read) {
                markAsRead(notification.notifications_id);
              }
            }}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              transform: `translateY(${index * 80}px)`,
              zIndex: 1000 + index,
              backgroundColor: getNotificationColor(notification.type),
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationCenter; 
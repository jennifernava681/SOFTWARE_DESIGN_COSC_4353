import { useState, useEffect, useRef } from 'react';
import { apiFetch, isAuthenticated } from '../api';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  // Fetch notifications from database
  const fetchNotifications = async () => {
    if (!isAuthenticated()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiFetch('/api/notifications');
      setNotifications(data);
      
      // Count unread notifications
      const unread = data.filter(notif => !notif.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count only
  const fetchUnreadCount = async () => {
    if (!isAuthenticated()) return;
    
    try {
      const data = await apiFetch('/api/notifications/unread-count');
      setUnreadCount(data.unread_count);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await apiFetch(`/api/notifications/${notificationId}/read`, 'PUT');
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.notifications_id === notificationId 
            ? { ...notif, is_read: 1 }
            : notif
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await apiFetch('/api/notifications/read-all', 'PUT');
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: 1 }))
      );
      
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await apiFetch(`/api/notifications/${notificationId}`, 'DELETE');
      
      // Update local state
      setNotifications(prev => 
        prev.filter(notif => notif.notifications_id !== notificationId)
      );
      
      // Update unread count if it was unread
      const deletedNotif = notifications.find(n => n.notifications_id === notificationId);
      if (deletedNotif && !deletedNotif.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  // Start polling for new notifications
  const startPolling = (intervalMs = 30000) => { // Default 30 seconds
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      fetchUnreadCount(); // Only fetch count to avoid unnecessary data transfer
    }, intervalMs);
  };

  // Stop polling
  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Initial fetch and setup
  useEffect(() => {
    fetchNotifications();
    
    // Start polling for new notifications
    startPolling();
    
    // Cleanup on unmount
    return () => {
      stopPolling();
    };
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    startPolling,
    stopPolling
  };
}; 
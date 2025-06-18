import React from 'react';

function NotificationBanner({ message }) {
  return message ? (
    <div className="alert alert-info">
      {message}
    </div>
  ) : null;
}

export default NotificationBanner;

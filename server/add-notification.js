const pool = require('./db');

async function addNotification(userId, message, type) {
  try {
    console.log(`Adding notification for user ${userId}...`);
    
    await pool.query(
      'INSERT INTO notifications (USERS_id, message, type, created_at, is_read) VALUES (?, ?, ?, NOW(), 0)',
      [userId, message, type]
    );
    
    console.log('Notification added successfully!');
    
    // Display the new notification
    const [notifications] = await pool.query(
      'SELECT * FROM notifications WHERE USERS_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    
    if (notifications.length > 0) {
      const notif = notifications[0];
      console.log(`\nNew notification for user ${userId}:`);
      console.log(`[${notif.type}] ${notif.message} (${notif.is_read ? 'Read' : 'Unread'})`);
    }
    
  } catch (error) {
    console.error('Error adding notification:', error);
  } finally {
    process.exit(0);
  }
}

// Example usage - modify these values as needed
const userId = 51; // John Doe
const message = "Your volunteer application has been approved! Welcome to the team!";
const type = "volunteer_approval";

addNotification(userId, message, type); 
const pool = require('./db');

async function addTestNotification() {
  try {
    console.log('Adding test notification...');
    
    // Add a test notification for user ID 51
    const [result] = await pool.query(
      'INSERT INTO notifications (USERS_id, message, type, created_at, is_read) VALUES (?, ?, ?, NOW(), 0)',
      [51, 'This is a test notification from the add-notification.js script!', 'test']
    );
    
    console.log('✅ Test notification added successfully!');
    console.log('Notification ID:', result.insertId);
    
    // Verify the notification was added
    const [notifications] = await pool.query(
      'SELECT * FROM notifications WHERE USERS_id = ? ORDER BY created_at DESC LIMIT 1',
      [51]
    );
    
    if (notifications.length > 0) {
      console.log('✅ Verification successful!');
      console.log('Notification details:', notifications[0]);
    }
    
  } catch (error) {
    console.error('❌ Error adding test notification:', error);
  } finally {
    process.exit(0);
  }
}

addTestNotification(); 
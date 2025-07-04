const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Get my notifications
router.get('/', auth, async (req, res) => {
  try {
    const [notifications] = await pool.query('SELECT * FROM notifications WHERE USERS_id = ?', [req.user.id_user]);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Mark as read 
router.put('/:id/read', auth, async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read = 1 WHERE notifications_id = ? AND USERS_id = ?', [req.params.id, req.user.id_user]);
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 
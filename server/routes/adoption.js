const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Submit an adoption request (fingers crossed)
router.post('/', auth, async (req, res) => {
  const { request_date, USERS_id_user, USERS_adrees_idadrees_id, USERS_adrees_state_state_id } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO adoption_requests (request_date, status, USERS_id_user, USERS_adrees_idadrees_id, USERS_adrees_state_state_id) VALUES (?, ?, ?, ?, ?)',
      [request_date, 'pending', USERS_id_user, USERS_adrees_idadrees_id, USERS_adrees_state_state_id]
    );
    
    // Create notification for user
    await pool.query(
      'INSERT INTO notifications (USERS_id, message, type, created_at, is_read) VALUES (?, ?, ?, NOW(), 0)',
      [USERS_id_user, 'Your adoption request has been submitted and is under review. We will notify you once a decision is made.', 'adoption_submitted']
    );
    
    res.status(201).json({ message: 'Adoption request submitted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// List all adoption requests (managers only)
router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'manager') return res.status(403).json({ message: 'Forbidden' });
  try {
    const [requests] = await pool.query('SELECT * FROM adoption_requests');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Approve/reject adoption (managers only)
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'manager') return res.status(403).json({ message: 'Forbidden' });
  const { status, decision_date } = req.body;
  try {
    // Get the adoption request to find the user
    const [requests] = await pool.query('SELECT USERS_id_user FROM adoption_requests WHERE id=?', [req.params.id]);
    if (requests.length === 0) {
      return res.status(404).json({ message: 'Adoption request not found' });
    }
    
    const userId = requests[0].USERS_id_user;
    
    await pool.query('UPDATE adoption_requests SET status=?, decision_date=? WHERE id=?', [status, decision_date, req.params.id]);
    
    // Create notification for user based on decision
    const message = status === 'approved' 
      ? 'Congratulations! Your adoption request has been approved. Please contact us to arrange pickup.'
      : 'Your adoption request has been reviewed. Unfortunately, it was not approved at this time.';
    
    const type = status === 'approved' ? 'adoption_approved' : 'adoption_rejected';
    
    await pool.query(
      'INSERT INTO notifications (USERS_id, message, type, created_at, is_read) VALUES (?, ?, ?, NOW(), 0)',
      [userId, message, type]
    );
    
    res.json({ message: 'Adoption request updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get user's adoption requests
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const [requests] = await pool.query('SELECT * FROM adoption_requests WHERE USERS_id_user=?', [req.params.userId]);
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get current user's adoption requests
router.get('/my', auth, async (req, res) => {
  try {
    const [requests] = await pool.query('SELECT * FROM adoption_requests WHERE USERS_id_user=?', [req.user.id_user]);
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 
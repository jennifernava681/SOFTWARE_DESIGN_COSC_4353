const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Validation helper for surrender requests
const validateSurrenderData = (data) => {
  const errors = [];
  
  if (!data.animal_description || data.animal_description.length > 500) {
    errors.push('Animal description is required and must be under 500 characters');
  }
  
  if (!data.reason || data.reason.length > 300) {
    errors.push('Reason for surrender is required and must be under 300 characters');
  }
  
  if (!data.urgency || !['immediate', 'urgent', 'moderate', 'flexible'].includes(data.urgency)) {
    errors.push('Urgency must be immediate, urgent, moderate, or flexible');
  }
  
  return errors;
};

// Get all surrender requests (managers only)
router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Only managers can view surrender requests' });
  }
  
  try {
    const [requests] = await pool.query(`
      SELECT sr.*, u.name as user_name, u.email as user_email
      FROM surrender_requests sr
      JOIN users u ON sr.USERS_id_user = u.id_user
      ORDER BY sr.status ASC, sr.id_request DESC
    `);
    
    res.json(requests);
  } catch (err) {
    console.error('Surrender requests query error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get surrender request by ID (managers only)
router.get('/:id', auth, async (req, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Only managers can view surrender requests' });
  }
  
  try {
    const [requests] = await pool.query(`
      SELECT sr.*, u.name as user_name, u.email as user_email
      FROM surrender_requests sr
      JOIN users u ON sr.USERS_id_user = u.id_user
      WHERE sr.USERS_id_user = ?
    `, [req.params.id]);
    
    if (requests.length === 0) {
      return res.status(404).json({ message: 'Surrender request not found' });
    }
    
    res.json(requests[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// Create new surrender request (public + logged-in users)
router.post('/', async (req, res) => {
  const {
    animal_description,
    reason,
    urgency,
    user_id,
    animalName,
    animalType,
    breed,
    age,
    gender,
    weight
  } = req.body;

  // Require login
  if (!user_id) {
    return res.status(401).json({ message: 'You must be logged in to submit a surrender request.' });
  }

  // Validate required fields
  const errors = validateSurrenderData({ animal_description, reason, urgency });
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  try {
    // Verify user exists
    const [users] = await pool.query(
      'SELECT id_user FROM users WHERE id_user = ?',
      [user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Insert surrender request
    const [result] = await pool.query(
      `INSERT INTO surrender_requests (
        animal_description, reason, urgency, status,
        animalName, animalType, breed, age, gender, weight,
        USERS_id_user
      ) VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?)`,
      [
        animal_description,
        reason,
        urgency,
        animalName,
        animalType,
        breed,
        age,
        gender,
        weight,
        user_id
      ]
    );

    // Create a notification for the user
    await pool.query(
      `INSERT INTO notifications 
       (USERS_id, message, type, created_at, is_read) 
       VALUES (?, ?, ?, NOW(), 0)`,
      [
        user_id,
        'Your animal surrender request has been submitted and is under review.',
        'surrender_submitted'
      ]
    );

    res.status(201).json({
      message: 'Surrender request created successfully',
      request_id: result.insertId
    });

  } catch (err) {
    console.error('Surrender request creation error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});




// Update surrender request status (managers only)
router.put('/:id/status', auth, async (req, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Only managers can update surrender requests' });
  }

  const { status } = req.body;
  const requestId = req.params.id;

  if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Status must be pending, approved, or rejected' });
  }

  try {
    // First, get the user_id of the surrender request
    const [rows] = await pool.query(
      'SELECT USERS_id_user FROM surrender_requests WHERE id_request = ?',
      [requestId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Surrender request not found' });
    }

    const userId = rows[0].USERS_id_user;

    // Update the surrender request status
    await pool.query(
      'UPDATE surrender_requests SET status = ? WHERE id_request = ?',
      [status, requestId]
    );

    // Send notification if a user is associated with the request
    if (userId) {
      const message =
        status === 'approved'
          ? 'Your animal surrender request has been approved. Please contact us to arrange the surrender.'
          : status === 'rejected'
          ? 'Your animal surrender request was not approved at this time.'
          : 'Your animal surrender request is under review.';

      const type =
        status === 'approved'
          ? 'surrender_approved'
          : status === 'rejected'
          ? 'surrender_rejected'
          : 'surrender_pending';

      await pool.query(
        'INSERT INTO notifications (USERS_id, message, type, created_at, is_read) VALUES (?, ?, ?, NOW(), 0)',
        [userId, message, type]
      );
    }

    res.json({ message: 'Surrender request status updated successfully' });
  } catch (err) {
    console.error('Error updating surrender request status:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// Delete surrender request (managers only)
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Only managers can delete surrender requests' });
  }
  
  try {
    await pool.query('DELETE FROM surrender_requests WHERE USERS_id_user = ?', [req.params.id]);
    res.json({ message: 'Surrender request deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 
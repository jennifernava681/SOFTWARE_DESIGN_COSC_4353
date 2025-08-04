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
      ORDER BY sr.status ASC, sr.surrender_requestscol DESC
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

// Create new surrender request (public users)
router.post('/', async (req, res) => {
  const { 
    animal_description, 
    reason, 
    urgency, 
    user_id,
    animal_name,
    animal_type,
    breed,
    age,
    gender,
    weight,
    color,
    microchipped,
    microchip_number,
    spayed_neutered,
    vaccinated
  } = req.body;
  
  // Validate the data
  const errors = validateSurrenderData({ animal_description, reason, urgency });
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  
  try {
    // Get user's address information
    const [users] = await pool.query(
      'SELECT adrees_idadrees_id, adrees_state_state_id FROM users WHERE id_user = ?',
      [user_id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = users[0];
    
    // Insert surrender request
    const [result] = await pool.query(
      `INSERT INTO surrender_requests (
        animal_description, reason, urgency, status, 
        USERS_id_user, USERS_adrees_idadrees_id, USERS_adrees_state_state_id
      ) VALUES (?, ?, ?, 'pending', ?, ?, ?)`,
      [animal_description, reason, urgency, user_id, user.adrees_idadrees_id, user.adrees_state_state_id]
    );
    
    // Create notification for user
    await pool.query(
      'INSERT INTO notifications (USERS_id, message, type, created_at, is_read) VALUES (?, ?, ?, NOW(), 0)',
      [user_id, 'Your animal surrender request has been submitted and is under review. We will contact you soon to discuss next steps.', 'surrender_submitted']
    );
    
    // If animal details are provided, create an animal record
    if (animal_name && animal_type) {
      await pool.query(
        `INSERT INTO animals (
          name, species, age, status, intake_date, sex, weight, color, 
          microchipped, microchip_number, spayed_neutered, vaccinated,
          surrender_requests_USERS_id_user, surrender_requests_USERS_adrees_idadrees_id, 
          surrender_requests_USERS_adrees_state_state_id
        ) VALUES (?, ?, ?, 'surrendered', CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          animal_name, animal_type, age || null, gender || null, weight || null, 
          color || null, microchipped || false, microchip_number || null,
          spayed_neutered || false, vaccinated || false,
          user_id, user.adrees_idadrees_id, user.adrees_state_state_id
        ]
      );
    }
    
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
  
  if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Status must be pending, approved, or rejected' });
  }
  
  try {
    await pool.query(
      'UPDATE surrender_requests SET status = ? WHERE USERS_id_user = ?',
      [status, req.params.id]
    );
    
    // Create notification for user based on status
    const message = status === 'approved' 
      ? 'Your animal surrender request has been approved. Please contact us to arrange the surrender.'
      : 'Your animal surrender request has been reviewed. Unfortunately, it was not approved at this time.';
    
    const type = status === 'approved' ? 'surrender_approved' : 'surrender_rejected';
    
    await pool.query(
      'INSERT INTO notifications (USERS_id, message, type, created_at, is_read) VALUES (?, ?, ?, NOW(), 0)',
      [req.params.id, message, type]
    );
    
    res.json({ message: 'Surrender request status updated successfully' });
  } catch (err) {
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
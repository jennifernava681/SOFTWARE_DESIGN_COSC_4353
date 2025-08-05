const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Submit an adoption request
router.post('/', auth, async (req, res) => {
  const { request_date, USERS_id_user, USERS_adrees_idadrees_id, USERS_adrees_state_state_id, animal_id, reason } = req.body;
  
  // Validate required fields
  if (!request_date || !USERS_id_user || !USERS_adrees_idadrees_id || !USERS_adrees_state_state_id) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  try {
    // Check if animal is available for adoption
    if (animal_id) {
      const [animals] = await pool.query('SELECT status FROM animals WHERE id_animal = ?', [animal_id]);
      if (animals.length === 0) {
        return res.status(404).json({ message: 'Animal not found' });
      }
      if (animals[0].status !== 'available') {
        return res.status(400).json({ message: 'Animal is not available for adoption' });
      }
    }
    
    // Check if user already has a pending request for this animal
    if (animal_id) {
      const [existingRequests] = await pool.query(`
        SELECT ar.id FROM adoption_requests ar
        JOIN animals_has_adoption_requests ahar ON ar.id = ahar.adoption_requests_id
        WHERE ar.USERS_id_user = ? AND ahar.ANIMALS_id_animal = ? AND ar.status = 'pending'
      `, [USERS_id_user, animal_id]);
      
      if (existingRequests.length > 0) {
        return res.status(400).json({ message: 'You already have a pending adoption request for this animal' });
      }
    }
    
    const [result] = await pool.query(
      'INSERT INTO adoption_requests (request_date, status, USERS_id_user, USERS_adrees_idadrees_id, USERS_adrees_state_state_id) VALUES (?, ?, ?, ?, ?)',
      [request_date, 'pending', USERS_id_user, USERS_adrees_idadrees_id, USERS_adrees_state_state_id]
    );
    
    // Link animal to adoption request if provided
    if (animal_id) {
      await pool.query(
        'INSERT INTO animals_has_adoption_requests (ANIMALS_id_animal, adoption_requests_id, adoption_requests_USERS_id_user, adoption_requests_USERS_adrees_idadrees_id, adoption_requests_USERS_adrees_state_state_id) VALUES (?, ?, ?, ?, ?)',
        [animal_id, result.insertId, USERS_id_user, USERS_adrees_idadrees_id, USERS_adrees_state_state_id]
      );
    }
    
    // Create notification for user
    const animalMessage = animal_id ? ' for the selected animal' : '';
    await pool.query(
      'INSERT INTO notifications (USERS_id, message, type, created_at, is_read) VALUES (?, ?, ?, NOW(), 0)',
      [USERS_id_user, `Your adoption request${animalMessage} has been submitted and is under review. We will notify you once a decision is made.`, 'adoption_submitted']
    );
    
    res.status(201).json({ 
      message: 'Adoption request submitted', 
      requestId: result.insertId 
    });
  } catch (err) {
    console.error('Error submitting adoption request:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// List all adoption requests (managers only)
router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'manager') return res.status(403).json({ message: 'Forbidden' });
  try {
    const [requests] = await pool.query(`
      SELECT 
        ar.*,
        u.name as user_name,
        u.email as user_email,
        a.name as animal_name,
        a.species as animal_species,
        a.age as animal_age
      FROM adoption_requests ar
      LEFT JOIN users u ON ar.USERS_id_user = u.id_user
      LEFT JOIN animals_has_adoption_requests ahar ON ar.id = ahar.adoption_requests_id
      LEFT JOIN animals a ON ahar.ANIMALS_id_animal = a.id_animal
      ORDER BY ar.request_date DESC
    `);
    res.json(requests);
  } catch (err) {
    console.error('Error fetching adoption requests:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Approve/reject adoption (managers only)
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'manager') return res.status(403).json({ message: 'Forbidden' });
  const { status, decision_date } = req.body;
  try {
    // Get the adoption request to find the user and animal
    const [requests] = await pool.query(`
      SELECT ar.USERS_id_user, ahar.ANIMALS_id_animal 
      FROM adoption_requests ar
      LEFT JOIN animals_has_adoption_requests ahar ON ar.id = ahar.adoption_requests_id
      WHERE ar.id = ?
    `, [req.params.id]);
    
    if (requests.length === 0) {
      return res.status(404).json({ message: 'Adoption request not found' });
    }
    
    const userId = requests[0].USERS_id_user;
    const animalId = requests[0].ANIMALS_id_animal;
    
    await pool.query('UPDATE adoption_requests SET status=?, decision_date=? WHERE id=?', [status, decision_date, req.params.id]);
    
    // Update animal status if approved
    if (status === 'approved' && animalId) {
      await pool.query('UPDATE animals SET status = ? WHERE id_animal = ?', ['adopted', animalId]);
    }
    
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
    console.error('Error updating adoption request:', err);
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
const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Get all animals
router.get('/', async (req, res) => {
  try {
    const [animals] = await pool.query('SELECT * FROM animals');
    res.json(animals);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get one animal
router.get('/:id', async (req, res) => {
  try {
    const [animals] = await pool.query('SELECT * FROM animals WHERE id_animal = ?', [req.params.id]);
    if (animals.length === 0) return res.status(404).json({ message: 'Animal not found' });
    res.json(animals[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Add a new animal
router.post('/', auth, async (req, res) => {
  const { name, species, age, status, intake_date, photo_url, sex, note, notes, donation_date, surrender_requests_USERS_id_user, surrender_requests_USERS_adrees_idadrees_id, surrender_requests_USERS_adrees_state_state_id } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO animals (name, species, age, status, intake_date, photo_url, sex, note, notes, donation_date, surrender_requests_USERS_id_user, surrender_requests_USERS_adrees_idadrees_id, surrender_requests_USERS_adrees_state_state_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, species, age, status, intake_date, photo_url, sex, note, notes, donation_date, surrender_requests_USERS_id_user, surrender_requests_USERS_adrees_idadrees_id, surrender_requests_USERS_adrees_state_state_id]
    );
    res.status(201).json({ message: 'Animal created', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update animal info (will require auth later)
router.put('/:id', auth, async (req, res) => {
  const { name, species, age, status, intake_date, photo_url, sex, note, notes, donation_date } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE animals SET name=?, species=?, age=?, status=?, intake_date=?, photo_url=?, sex=?, note=?, notes=?, donation_date=? WHERE id_animal=?',
      [name, species, age, status, intake_date, photo_url, sex, note, notes, donation_date, req.params.id]
    );
    res.json({ message: 'Animal updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Remove an animal (will require auth later)
router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM animals WHERE id_animal = ?', [req.params.id]);
    res.json({ message: 'Animal deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 
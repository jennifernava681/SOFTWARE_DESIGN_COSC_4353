const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Validation helper for animals
const validateAnimalData = (data) => {
  const errors = [];
  
  if (!data.name || data.name.length > 100) {
    errors.push('Animal name is required and must be under 100 characters');
  }
  
  if (!data.species || data.species.length > 100) {
    errors.push('Species is required and must be under 100 characters');
  }
  
  if (data.age !== undefined && (isNaN(data.age) || data.age < 0 || data.age > 50)) {
    errors.push('Age must be a valid number between 0 and 50');
  }
  
  if (!data.status || !['available', 'adopted', 'surrendered'].includes(data.status)) {
    errors.push('Status must be available, adopted, or surrendered');
  }
  
  if (data.intake_date && !Date.parse(data.intake_date)) {
    errors.push('Intake date must be a valid date');
  }
  
  if (data.sex && !['male', 'female', 'unknown'].includes(data.sex.toLowerCase())) {
    errors.push('Sex must be male, female, or unknown');
  }
  
  if (data.note && data.note.length > 1000) {
    errors.push('Note must be under 1000 characters');
  }
  
  if (data.notes && data.notes.length > 45) {
    errors.push('Notes must be under 45 characters');
  }
  
  if (data.donation_date && !Date.parse(data.donation_date)) {
    errors.push('Donation date must be a valid date');
  }
  
  return errors;
};

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
  
  // Validate the data
  const errors = validateAnimalData({ name, species, age, status, intake_date, sex, note, notes, donation_date });
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  
  try {
    const [result] = await pool.query(
      'INSERT INTO animals (name, species, age, status, intake_date, photo_url, sex, note, notes, donation_date, surrender_requests_USERS_id_user, surrender_requests_USERS_adrees_idadrees_id, surrender_requests_USERS_adrees_state_state_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
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
  
  // Validate the data
  const errors = validateAnimalData({ name, species, age, status, intake_date, sex, note, notes, donation_date });
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  
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
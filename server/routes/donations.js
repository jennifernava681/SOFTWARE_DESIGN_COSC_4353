const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Add donation
router.post('/', auth, async (req, res) => {
  const { donation_type, amount, donation_date } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO donations (donation_type, amount, donation_date) VALUES (?, ?, ?)',
      [donation_type, amount, donation_date]
    );
    // Link donation to user
    await pool.query('INSERT INTO users_has_donations (USERS_id, donations_id) VALUES (?, ?)', [req.user.id_user, result.insertId]);
    res.status(201).json({ message: 'Donation made', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// My donation history 
router.get('/my', auth, async (req, res) => {
  try {
    const [donations] = await pool.query(
      'SELECT d.* FROM donations d JOIN users_has_donations uhd ON d.id = uhd.donations_id WHERE uhd.USERS_id = ?',
      [req.user.id_user]
    );
    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// All donations (probably should require auth later)
router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'manager') return res.status(403).json({ message: 'Forbidden' });
  try {
    const [donations] = await pool.query('SELECT * FROM donations');
    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 
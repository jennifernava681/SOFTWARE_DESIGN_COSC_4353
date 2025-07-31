const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Validation helper for donations
const validateDonationData = (data) => {
  const errors = [];
  
  if (!data.donation_type || data.donation_type.length > 50) {
    errors.push('Donation type is required and must be under 50 characters');
  }
  
  if (!data.amount || data.amount.length > 20) {
    errors.push('Amount is required and must be under 20 characters');
  }
  
  if (data.donation_date && !Date.parse(data.donation_date)) {
    errors.push('Donation date must be a valid date');
  }
  
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Email must be a valid email format');
  }
  
  if (data.items && data.items.length > 500) {
    errors.push('Items description must be under 500 characters');
  }
  
  // Validate donation type values
  const validDonationTypes = ['monetary', 'food', 'toys', 'supplies', 'other'];
  if (data.donation_type && !validDonationTypes.includes(data.donation_type.toLowerCase())) {
    errors.push('Donation type must be monetary, food, toys, supplies, or other');
  }
  
  return errors;
};

// Add donation
router.post('/', async (req, res) => {
  const { donation_type, amount, donation_date = new Date(), email, items } = req.body;
  
  // Validate the data
  const errors = validateDonationData({ donation_type, amount, donation_date, email, items });
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  
  let userId = null;

  try {
    // Checks if user is logged in via a token
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id_user;
    }

    // If not logged in, check if email matches a registered user
    if (!userId && email) {
      const [rows] = await pool.query('SELECT id_user FROM users WHERE email = ?', [email]);
      if (rows.length > 0) userId = rows[0].id_user;
    }

    // Creates donation
    const [result] = await pool.query(
      'INSERT INTO donations (donation_type, amount, donation_date, items_description) VALUES (?, ?, ?, ?)',
      [donation_type, amount, donation_date, items]
    );

    // Link donation to user if we have a userId
    if (userId) {
      await pool.query(
        'INSERT INTO users_has_donations (USERS_id, donations_id) VALUES (?, ?)',
        [userId, result.insertId]
      );
    }

    res.status(201).json({ message: 'Donation recorded', donationId: result.insertId });
  } catch (err) {
    console.error(err);
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
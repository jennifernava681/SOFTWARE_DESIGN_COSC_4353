const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');

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
      
      // Create notification for user
      const message = `Thank you for your ${donation_type} donation of ${amount}! Your contribution helps animals in need.`;
      await pool.query(
        'INSERT INTO notifications (USERS_id, message, type, created_at, is_read) VALUES (?, ?, ?, NOW(), 0)',
        [userId, message, 'donation_received']
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

// All donations (managers only)
router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'manager') return res.status(403).json({ message: 'Forbidden' });
  try {
    const [donations] = await pool.query(`
      SELECT 
        d.*,
        u.name as donor_name,
        u.email as donor_email
      FROM donations d
      LEFT JOIN users_has_donations uhd ON d.id = uhd.donations_id
      LEFT JOIN users u ON uhd.USERS_id = u.id_user
      ORDER BY d.donation_date DESC
    `);
    res.json(donations);
  } catch (err) {
    console.error('Error fetching donations:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get donation statistics (managers only)
router.get('/stats', auth, async (req, res) => {
  if (req.user.role !== 'manager') return res.status(403).json({ message: 'Forbidden' });
  try {
    const [totalDonations] = await pool.query('SELECT COUNT(*) as count FROM donations');
    const [totalAmount] = await pool.query('SELECT SUM(CAST(amount AS DECIMAL(10,2))) as total FROM donations WHERE donation_type = "monetary"');
    const [typeStats] = await pool.query(`
      SELECT donation_type, COUNT(*) as count, SUM(CAST(amount AS DECIMAL(10,2))) as total
      FROM donations 
      GROUP BY donation_type
    `);
    const [monthlyStats] = await pool.query(`
      SELECT 
        DATE_FORMAT(donation_date, '%Y-%m') as month,
        COUNT(*) as count,
        SUM(CAST(amount AS DECIMAL(10,2))) as total
      FROM donations 
      WHERE donation_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(donation_date, '%Y-%m')
      ORDER BY month DESC
    `);
    
    res.json({
      totalDonations: totalDonations[0].count,
      totalAmount: totalAmount[0].total || 0,
      typeStats,
      monthlyStats
    });
  } catch (err) {
    console.error('Error fetching donation stats:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 
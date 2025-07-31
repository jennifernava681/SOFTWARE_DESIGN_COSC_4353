const express = require('express');
const router = express.Router();
const pool = require('../db');

// PATCH /api/deactivate/:id
router.patch('/:id', async (req, res) => {
  const volunteerId = req.params.id;

  try {
    const [rows] = await pool.query(
      `SELECT * FROM users WHERE id_user = ? AND LOWER(TRIM(role)) = 'volunteer' AND active = 1`,
      [volunteerId]
    );

    if (rows.length === 0) {
      console.log(`❌ Volunteer ${volunteerId} not found or already inactive.`);
      return res.status(404).json({ message: 'Volunteer not found or already deactivated' });
    }

    await pool.query(`UPDATE users SET active = 0 WHERE id_user = ?`, [volunteerId]);

    console.log(`✅ Volunteer ${volunteerId} deactivated.`);
    res.json({ message: 'Volunteer deactivated successfully' });
  } catch (err) {
    console.error("❌ Deactivation error:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;

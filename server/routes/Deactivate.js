const express = require('express');
const router = express.Router();
const pool = require('../db');

// PATCH /api/deactivate/:id
router.patch('/:id', async (req, res) => {
  const volunteerId = req.params.id;

  try {
    console.log(`🛠️ Attempting to deactivate user ID: ${volunteerId}`);

    // Check if the user is an active volunteer
    const [rows] = await pool.query(
      `SELECT * FROM users 
       WHERE id_user = ? AND LOWER(TRIM(role)) = 'volunteer' AND active = 1`,
      [volunteerId]
    );

    if (rows.length === 0) {
      console.log(`❌ No active volunteer found for ID: ${volunteerId}`);
      return res.status(404).json({ message: 'Volunteer not found or already deactivated' });
    }

    // Perform the UPDATE
    const [updateResult] = await pool.query(
      `UPDATE users SET active = 0 WHERE id_user = ?`,
      [volunteerId]
    );

    if (updateResult.affectedRows === 1) {
      console.log(`✅ Volunteer ${volunteerId} deactivated successfully.`);
      return res.json({ message: 'Volunteer deactivated successfully' });
    } else {
      console.log(`⚠️ Update failed for ID: ${volunteerId}`);
      return res.status(500).json({ message: 'Failed to deactivate volunteer' });
    }
  } catch (err) {
    console.error("❌ Server error during deactivation:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;

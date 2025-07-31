const express = require("express")
const router = express.Router()
const pool = require("../db")
const auth = require("../middleware/auth")

// Get all active volunteers
router.get("/volunteers/active", auth, async (req, res) => {
  try {
    // Query to get only active volunteers (active = 1) with volunteer role
    const [volunteers] = await pool.query(
      'SELECT id_user, name, email, role, created_at FROM users WHERE active = 1 AND role = "volunteer"',
    )
    res.json(volunteers)
  } catch (err) {
    console.error("Error fetching active volunteers:", err)
    res.status(500).json({ message: "Server error", error: err.message })
  }
})

// Get all active volunteers (all roles except 'public')
router.get("/volunteers/active/all", auth, async (req, res) => {
  try {
    // Query to get all active users except public role
    const [volunteers] = await pool.query(
      'SELECT id_user, name, email, role, created_at FROM users WHERE active = 1 AND role != "public"',
    )
    res.json(volunteers)
  } catch (err) {
    console.error("Error fetching all active volunteers:", err)
    res.status(500).json({ message: "Server error", error: err.message })
  }
})

// Deactivate a volunteer (PUT request)
router.put("/volunteers/:id/deactivate", auth, async (req, res) => {
  const volunteerId = req.params.id

  try {
    // First check if the volunteer exists and is currently active
    const [existingVolunteer] = await pool.query("SELECT id_user, name, active FROM users WHERE id_user = ?", [
      volunteerId,
    ])

    if (existingVolunteer.length === 0) {
      return res.status(404).json({ message: "Volunteer not found" })
    }

    if (existingVolunteer[0].active === 0) {
      return res.status(400).json({ message: "Volunteer is already deactivated" })
    }

    // Update the volunteer's active status to 0 (deactivated)
    const [result] = await pool.query("UPDATE users SET active = 0 WHERE id_user = ?", [volunteerId])

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Volunteer not found or already deactivated" })
    }

    res.json({
      message: "Volunteer deactivated successfully",
      volunteerId: volunteerId,
      volunteerName: existingVolunteer[0].name,
    })
  } catch (err) {
    console.error("Error deactivating volunteer:", err)
    res.status(500).json({ message: "Server error", error: err.message })
  }
})

// Reactivate a volunteer (PUT request) - bonus endpoint
router.put("/volunteers/:id/reactivate", auth, async (req, res) => {
  const volunteerId = req.params.id

  try {
    // First check if the volunteer exists and is currently inactive
    const [existingVolunteer] = await pool.query("SELECT id_user, name, active FROM users WHERE id_user = ?", [
      volunteerId,
    ])

    if (existingVolunteer.length === 0) {
      return res.status(404).json({ message: "Volunteer not found" })
    }

    if (existingVolunteer[0].active === 1) {
      return res.status(400).json({ message: "Volunteer is already active" })
    }

    // Update the volunteer's active status to 1 (reactivated)
    const [result] = await pool.query("UPDATE users SET active = 1 WHERE id_user = ?", [volunteerId])

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Volunteer not found" })
    }

    res.json({
      message: "Volunteer reactivated successfully",
      volunteerId: volunteerId,
      volunteerName: existingVolunteer[0].name,
    })
  } catch (err) {
    console.error("Error reactivating volunteer:", err)
    res.status(500).json({ message: "Server error", error: err.message })
  }
})

// Get all inactive volunteers
router.get("/volunteers/inactive", auth, async (req, res) => {
  try {
    const [volunteers] = await pool.query(
      'SELECT id_user, name, email, role, created_at FROM users WHERE active = 0 AND role != "public"',
    )
    res.json(volunteers)
  } catch (err) {
    console.error("Error fetching inactive volunteers:", err)
    res.status(500).json({ message: "Server error", error: err.message })
  }
})

// Get volunteer by ID
router.get("/volunteers/:id", auth, async (req, res) => {
  try {
    const [volunteers] = await pool.query(
      "SELECT id_user, name, email, role, active, created_at FROM users WHERE id_user = ?",
      [req.params.id],
    )

    if (volunteers.length === 0) {
      return res.status(404).json({ message: "Volunteer not found" })
    }

    res.json(volunteers[0])
  } catch (err) {
    console.error("Error fetching volunteer:", err)
    res.status(500).json({ message: "Server error", error: err.message })
  }
})

module.exports = router

const express = require("express");
const router = express.Router();
const pool = require("../db");
const auth = require("../middleware/auth");

// GET: Active volunteers (id, name, email)
router.get("/volunteers/active", auth, async (req, res) => {
  try {
    const [volunteers] = await pool.query(
      "SELECT id_user, name, email FROM users WHERE role = 'volunteer' AND active = 1"
    );
    res.json(volunteers);
  } catch (err) {
    console.error("Error fetching active volunteers:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET: One user by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const [user] = await pool.query(
      "SELECT id_user, name, email, role, active FROM users WHERE id_user = ?",
      [req.params.id]
    );
    if (user.length === 0) return res.status(404).json({ message: "User not found" });
    res.json(user[0]);
  } catch (err) {
    console.error("Error fetching user by ID:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PUT: Deactivate a user (set active = 0)
router.put("/:id/deactivate", auth, async (req, res) => {
  try {
    const [user] = await pool.query("SELECT id_user, name, active FROM users WHERE id_user = ?", [req.params.id]);

    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user[0].active === 0) {
      return res.status(400).json({ message: "User is already deactivated" });
    }

    await pool.query("UPDATE users SET active = 0 WHERE id_user = ?", [req.params.id]);

    res.json({
      message: "User deactivated successfully",
      id: req.params.id,
      name: user[0].name,
    });
  } catch (err) {
    console.error("Error deactivating user:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PUT: Reactivate a user (set active = 1)
router.put("/:id/reactivate", auth, async (req, res) => {
  try {
    const [user] = await pool.query("SELECT id_user, name, active FROM users WHERE id_user = ?", [req.params.id]);

    if (user.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user[0].active === 1) {
      return res.status(400).json({ message: "User is already active" });
    }

    await pool.query("UPDATE users SET active = 1 WHERE id_user = ?", [req.params.id]);

    res.json({
      message: "User reactivated successfully",
      id: req.params.id,
      name: user[0].name,
    });
  } catch (err) {
    console.error("Error reactivating user:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;

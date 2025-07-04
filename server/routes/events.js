const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

//display events
router.get('/', async (req, res) => {
  // sql query here for when we have an events table more set up
  res.json([{ id: 1, name: 'Adoption Fair', date: '2024-06-01' }]);
});

// Add an event (will probably need auth later)
router.post('/', auth, async (req, res) => {
  // sql query here for when we have an events table more set up
  res.status(201).json({ message: 'Event created (stub)' });
});

// Register for an event
router.post('/:id/register', auth, async (req, res) => {
  // sql query here for when we have an events table more set up
  res.json({ message: 'Registered for event (stub)' });
});

module.exports = router; 
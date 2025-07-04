const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Apply to volunteer
router.post('/apply', auth, async (req, res) => {
  const { availability_date, skills, motivation, request_date, availability_time } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO volunteer_requests (availability_date, skills, motivation, request_date, status, availability_time, USERS_id_user) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [availability_date, skills, motivation, request_date, 'pending', availability_time, req.user.id_user]
    );
    res.status(201).json({ message: 'Volunteer application submitted', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Assign a task 
router.post('/tasks', auth, async (req, res) => {
  if (req.user.role !== 'manager') return res.status(403).json({ message: 'Forbidden' });
  const { task_name, description, task_date, status, USERS_id_user } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO volunteer_tasks (task_name, description, task_date, status, USERS_id_user) VALUES (?, ?, ?, ?, ?)',
      [task_name, description, task_date, status, USERS_id_user]
    );
    res.status(201).json({ message: 'Task assigned', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// My tasks 
router.get('/tasks/my', auth, async (req, res) => {
  try {
    const [tasks] = await pool.query('SELECT * FROM volunteer_tasks WHERE USERS_id_user = ?', [req.user.id_user]);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// All volunteer applications
router.get('/applications', auth, async (req, res) => {
  if (req.user.role !== 'manager') return res.status(403).json({ message: 'Forbidden' });
  try {
    const [apps] = await pool.query('SELECT * FROM volunteer_requests');
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 
const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Validation helper for events
const validateEventData = (data) => {
  const errors = [];
  
  if (!data.title || data.title.length > 100) {
    errors.push('Event title is required and must be under 100 characters');
  }
  
  if (!data.description || data.description.length > 500) {
    errors.push('Event description is required and must be under 500 characters');
  }
  
  if (!data.date || !Date.parse(data.date)) {
    errors.push('Valid event date is required');
  }
  
  if (!data.location || data.location.length > 200) {
    errors.push('Event location is required and must be under 200 characters');
  }
  
  if (!data.urgency || !['low', 'medium', 'high', 'critical'].includes(data.urgency)) {
    errors.push('Urgency must be low, medium, high, or critical');
  }
  
  if (data.required_skills && !Array.isArray(data.required_skills)) {
    errors.push('Required skills must be an array');
  }
  
  return errors;
};

// Get all events (show me what's happening)
router.get('/', async (req, res) => {
  try {
    const [events] = await pool.query(`
      SELECT e.*, 
             GROUP_CONCAT(DISTINCT es.skill_name) as required_skills
      FROM events e
      LEFT JOIN event_skills es ON e.id = es.event_id
      GROUP BY e.id
      ORDER BY e.date ASC
    `);
    
    // Parse skills string back to array
    const eventsWithSkills = events.map(event => ({
      ...event,
      required_skills: event.required_skills ? event.required_skills.split(',') : []
    }));
    
    res.json(eventsWithSkills);
  } catch (err) {
    console.error('Events query error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get event by ID (the details)
router.get('/:id', async (req, res) => {
  try {
    const [events] = await pool.query(`
      SELECT e.*, 
             GROUP_CONCAT(es.skill_name) as required_skills
      FROM events e
      LEFT JOIN event_skills es ON e.id = es.event_id
      WHERE e.id = ?
      GROUP BY e.id
    `, [req.params.id]);
    
    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const event = events[0];
    event.required_skills = event.required_skills ? event.required_skills.split(',') : [];
    
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create new event (managers only)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Only managers can create events' });
  }
  
  const { title, description, date, time, location, urgency, required_skills, max_volunteers } = req.body;
  
  // Validate the data
  const errors = validateEventData({ title, description, date, location, urgency, required_skills });
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  
  try {
    // Insert event
    const [result] = await pool.query(
      'INSERT INTO events (title, description, date, time, location, urgency, max_volunteers) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description, date, time, location, urgency, max_volunteers]
    );
    
    const eventId = result.insertId;
    
    // Add required skills
    if (required_skills && Array.isArray(required_skills)) {
      for (const skill of required_skills) {
        await pool.query(
          'INSERT INTO event_skills (event_id, skill_name) VALUES (?, ?)',
          [eventId, skill]
        );
      }
    }
    
    res.status(201).json({ 
      message: 'Event created successfully', 
      event_id: eventId 
    });
  } catch (err) {
    console.error('Event creation error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update event (managers only)
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Only managers can update events' });
  }
  
  const { title, description, date, time, location, urgency, required_skills, max_volunteers } = req.body;
  
  // Validate the data
  const errors = validateEventData({ title, description, date, location, urgency, required_skills });
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  
  try {
    // Update event
    await pool.query(
      'UPDATE events SET title = ?, description = ?, date = ?, time = ?, location = ?, urgency = ?, max_volunteers = ? WHERE id = ?',
      [title, description, date, time, location, urgency, max_volunteers, req.params.id]
    );
    
    // Update required skills
    if (required_skills && Array.isArray(required_skills)) {
      await pool.query('DELETE FROM event_skills WHERE event_id = ?', [req.params.id]);
      for (const skill of required_skills) {
        await pool.query(
          'INSERT INTO event_skills (event_id, skill_name) VALUES (?, ?)',
          [req.params.id, skill]
        );
      }
    }
    
    res.json({ message: 'Event updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete event (managers only)
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Only managers can delete events' });
  }
  
  try {
    await pool.query('DELETE FROM event_skills WHERE event_id = ?', [req.params.id]);
    await pool.query('DELETE FROM events WHERE id = ?', [req.params.id]);
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Register for event (volunteers)
router.post('/:id/register', auth, async (req, res) => {
  try {
    const eventId = req.params.id;
    
    // Check if event exists
    const [events] = await pool.query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const event = events[0];
    
    // Check if user is already registered (by checking if they have a task for this event)
    const [existingTasks] = await pool.query(
      'SELECT vt.task_id FROM volunteer_tasks vt JOIN volunteer_history vh ON vt.task_id = vh.task_id WHERE vt.task_name = ? AND vh.user_id = ?',
      [event.title, req.user.id_user]
    );
    
    if (existingTasks.length > 0) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }
    
    // Create volunteer task for this event
    const [taskResult] = await pool.query(
      'INSERT INTO volunteer_tasks (task_name, description, task_date, status, USERS_id_user) VALUES (?, ?, ?, ?, ?)',
      [event.title, event.description, event.date, 'pending', req.user.id_user]
    );
    
    // Create volunteer history record (registration)
    await pool.query(
      'INSERT INTO volunteer_history (user_id, task_id, participation_date, status) VALUES (?, ?, ?, ?)',
      [req.user.id_user, taskResult.insertId, new Date(), 'registered']
    );
    
    // Create notification for user
    await pool.query(
      'INSERT INTO notifications (USERS_id, message, type, created_at, is_read) VALUES (?, ?, ?, NOW(), 0)',
      [req.user.id_user, `You have successfully registered for "${event.title}" on ${event.date}. We'll send you a reminder closer to the event date.`, 'event_registration']
    );
    
    res.status(201).json({ 
      message: 'Successfully registered for event',
      task_id: taskResult.insertId
    });
  } catch (err) {
    console.error('Event registration error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get my registered events
router.get('/my/registered', auth, async (req, res) => {
  try {
    const [events] = await pool.query(`
      SELECT e.*, vh.status as registration_status, vh.participation_date
      FROM events e
      JOIN volunteer_tasks vt ON e.title = vt.task_name
      JOIN volunteer_history vh ON vt.task_id = vh.task_id
      WHERE vh.user_id = ? AND vh.status IN ('registered', 'attended')
      ORDER BY e.date ASC
    `, [req.user.id_user]);
    
    res.json(events);
  } catch (err) {
    console.error('My events error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 
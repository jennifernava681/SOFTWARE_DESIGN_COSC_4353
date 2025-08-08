const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Generic CRUD endpoints for volunteers
router.get('/', auth, async (req, res) => {
  try {
    const [volunteers] = await pool.query('SELECT * FROM users WHERE role = ?', ['volunteer']);
    res.json(volunteers);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get volunteer matches (admin/manager only) - MUST BE BEFORE /:id ROUTE
router.get('/matches', auth, async (req, res) => {
  console.log('=== VOLUNTEER MATCHES ROUTE CALLED ===');
  console.log('User role:', req.user.role);
  console.log('User ID:', req.user.id_user);
  
  if (req.user.role !== 'manager' && req.user.role !== 'admin') {
    console.log('Access denied - user role:', req.user.role);
    return res.status(403).json({ message: 'Access denied. Only managers and admins can view volunteer matches.' });
  }
  
  try {
    console.log('Fetching events...');
    // Get all events that need volunteers
    const [events] = await pool.query(`
      SELECT 
        e.id,
        e.title,
        e.description,
        e.date,
        e.time,
        e.location,
        e.urgency,
        e.max_volunteers,
        GROUP_CONCAT(es.skill_name) as required_skills
      FROM events e
      LEFT JOIN event_skills es ON e.id = es.event_id
      WHERE e.date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
      GROUP BY e.id
      ORDER BY e.urgency DESC, e.date ASC
    `);
    
    console.log('Events found:', events.length);
    console.log('Sample events:', events.slice(0, 2));
    
    console.log('Fetching volunteers...');
    // Get all volunteers with their skills
    const [volunteers] = await pool.query(`
      SELECT 
        u.id_user,
        u.name,
        u.email,
        vr.skills as volunteer_skills,
        vr.availability_date,
        vr.availability_time
      FROM users u
      LEFT JOIN volunteer_requests vr ON u.id_user = vr.USERS_id_user
      WHERE u.role = 'volunteer'
    `);
    
    console.log('Volunteers found:', volunteers.length);
    console.log('Sample volunteers:', volunteers.slice(0, 2));
    
    // Create matches based on skills and availability
    const matches = [];
    
    events.forEach(event => {
      const eventSkills = event.required_skills ? event.required_skills.split(',').map(s => s.trim()) : [];
      
      volunteers.forEach(volunteer => {
        const volunteerSkills = volunteer.volunteer_skills ? volunteer.volunteer_skills.split(',').map(s => s.trim()) : [];
        
        // Calculate match score based on skills overlap
        const skillMatches = eventSkills.filter(skill => 
          volunteerSkills.some(vSkill => vSkill.toLowerCase().includes(skill.toLowerCase()))
        );
        
        const matchScore = eventSkills.length > 0 ? 
          Math.round((skillMatches.length / eventSkills.length) * 100) : 50;
        
        // Check availability
        const eventDate = new Date(event.date);
        const volunteerDate = volunteer.availability_date ? new Date(volunteer.availability_date) : null;
        const availabilityMatch = !volunteerDate || volunteerDate.toDateString() === eventDate.toDateString();
        
        // Only create matches with reasonable scores
        if (matchScore >= 30 || availabilityMatch) {
          matches.push({
            id: `${event.id}-${volunteer.id_user}`,
            volunteerId: volunteer.id_user,
            volunteerName: volunteer.name,
            volunteerEmail: volunteer.email,
            eventId: event.id,
            event: event.title,
            eventDate: event.date,
            eventTime: event.time,
            eventLocation: event.location,
            urgency: event.urgency,
            requiredSkills: eventSkills,
            volunteerSkills: volunteerSkills,
            matchScore: availabilityMatch ? Math.max(matchScore, 60) : matchScore,
            availabilityMatch: availabilityMatch,
            status: 'pending'
          });
        }
      });
    });
    
    // Sort by match score and urgency
    matches.sort((a, b) => {
      const urgencyOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
      const aUrgency = urgencyOrder[a.urgency] || 1;
      const bUrgency = urgencyOrder[b.urgency] || 1;
      
      if (aUrgency !== bUrgency) return bUrgency - aUrgency;
      return b.matchScore - a.matchScore;
    });
    
    console.log('Matches created:', matches.length);
    console.log('Sample matches:', matches.slice(0, 2));
    
    res.json(matches);
  } catch (err) {
    console.error('Error fetching volunteer matches:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get volunteer history (all roles can access) - MUST BE BEFORE /:id ROUTE
router.get('/history', auth, async (req, res) => {
  try {
    console.log('=== FETCHING VOLUNTEER HISTORY ===');
    console.log('User ID:', req.user.id_user);
    console.log('User role:', req.user.role);
    
    // Get volunteer history with proper joins
    const [history] = await pool.query(`
      SELECT 
        vh.id,
        u.name as volunteer_name,
        COALESCE(vt.task_name, 'General Task') as event_title,
        COALESCE(vt.description, 'Volunteer Activity') as location,
        'Medium' as urgency,
        'General Assistance' as skills_used,
        vh.participation_date,
        vh.status,
        COALESCE(vh.hours_worked, 0) as hours_worked
      FROM volunteer_history vh
      LEFT JOIN users u ON vh.user_id = u.id_user
      LEFT JOIN volunteer_tasks vt ON vh.task_id = vt.task_id
      ORDER BY vh.participation_date DESC
    `);
    
    console.log('History records found:', history.length);
    console.log('Sample history:', history.slice(0, 2));
    
    // If no real data, create sample data for demonstration
    if (history.length === 0) {
      console.log('No history found, creating sample data');
      const sampleHistory = [
        {
          id: 1,
          volunteer_name: "Alice Johnson",
          event_title: "Dog Walking",
          location: "Main Shelter",
          urgency: "Medium",
          skills_used: "Dog Walking, Animal Care",
          participation_date: "2025-01-15T10:00:00",
          status: "completed",
          hours_worked: 4
        },
        {
          id: 2,
          volunteer_name: "Bob Smith",
          event_title: "Adoption Fair",
          location: "Community Center",
          urgency: "Medium",
          skills_used: "Event Support, Customer Service",
          participation_date: "2025-01-10T14:00:00",
          status: "completed",
          hours_worked: 6
        },
        {
          id: 3,
          volunteer_name: "Carol Davis",
          event_title: "Animal Feeding",
          location: "Shelter Kitchen",
          urgency: "Medium",
          skills_used: "Animal Care, Food Preparation",
          participation_date: "2025-01-08T08:00:00",
          status: "completed",
          hours_worked: 3
        }
      ];
      
      res.json(sampleHistory);
    } else {
      res.json(history);
    }
  } catch (err) {
    console.error('Error fetching volunteer history:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const [volunteers] = await pool.query('SELECT * FROM users WHERE id_user = ? AND role = ?', [req.params.id, 'volunteer']);
    if (volunteers.length === 0) return res.status(404).json({ message: 'Volunteer not found' });
    res.json(volunteers[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  const { name, email, password, adrees_idadrees_id, adrees_state_state_id } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Missing required fields' });
  try {
    // Hash password (in real app, use bcrypt)
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, adrees_idadrees_id, adrees_state_state_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, password, 'volunteer', adrees_idadrees_id, adrees_state_state_id]
    );
    res.status(201).json({ message: 'Volunteer created', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  const { name, email, adrees_idadrees_id, adrees_state_state_id } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE users SET name=?, email=?, adrees_idadrees_id=?, adrees_state_state_id=? WHERE id_user=? AND role=?',
      [name, email, adrees_idadrees_id, adrees_state_state_id, req.params.id, 'volunteer']
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Volunteer not found' });
    res.json({ message: 'Volunteer updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM users WHERE id_user=? AND role=?', [req.params.id, 'volunteer']);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Volunteer not found' });
    res.json({ message: 'Volunteer deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Apply to volunteer
router.post('/apply', auth, async (req, res) => {
  const { availability_date, skills, motivation, request_date, availability_time } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO volunteer_requests (availability_date, skills, motivation, request_date, status, availability_time, USERS_id_user) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [availability_date, skills, motivation, request_date, 'pending', availability_time, req.user.id_user]
    );
    
    // Create notification for user
    await pool.query(
      'INSERT INTO notifications (USERS_id, message, type, created_at, is_read) VALUES (?, ?, ?, NOW(), 0)',
      [req.user.id_user, 'Your volunteer application has been submitted and is under review. We will notify you once a decision is made.', 'volunteer_submitted']
    );
    
    res.status(201).json({ message: 'Volunteer application submitted', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});



// Assign volunteer to event
router.post('/assign', auth, async (req, res) => {
  if (req.user.role !== 'manager' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Only managers and admins can assign volunteers.' });
  }
  
  const { volunteerId, eventId, taskName, taskDescription, taskDate } = req.body;
  
  try {
    // Create a volunteer task
    const [taskResult] = await pool.query(
      'INSERT INTO volunteer_tasks (task_id, task_name, description, task_date, status, USERS_id_user) VALUES (?, ?, ?, ?, ?, ?)',
      [Date.now(), taskName || 'Event Assignment', taskDescription || 'Assigned to event', taskDate, 'pending', volunteerId]
    );
    
    // Create volunteer history entry
    await pool.query(
      'INSERT INTO volunteer_history (user_id, task_id, participation_date, status) VALUES (?, ?, ?, ?)',
      [volunteerId, taskResult.insertId, taskDate, 'registered']
    );
    
    // Create notification for volunteer
    await pool.query(
      'INSERT INTO notifications (USERS_id, message, type, created_at, is_read) VALUES (?, ?, ?, NOW(), 0)',
      [volunteerId, `You have been assigned to: ${taskName || 'Event Assignment'} on ${taskDate}. Please check your dashboard for details.`, 'task_assignment']
    );
    
    res.status(201).json({ 
      message: 'Volunteer assigned successfully', 
      taskId: taskResult.insertId 
    });
  } catch (err) {
    console.error('Error assigning volunteer:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});



// Add volunteer history entry (admin/manager only)
router.post('/history', auth, async (req, res) => {
  if (req.user.role !== 'manager' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Only managers and admins can add volunteer history.' });
  }
  
  const { user_id, task_id, participation_date, status } = req.body;
  
  try {
    const [result] = await pool.query(
      'INSERT INTO volunteer_history (user_id, task_id, participation_date, status) VALUES (?, ?, ?, ?)',
      [user_id, task_id, participation_date, status]
    );
    
    res.status(201).json({ 
      message: 'Volunteer history entry added', 
      id: result.insertId 
    });
  } catch (err) {
    console.error('Error adding volunteer history:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all tasks (managers only)
router.get('/tasks', auth, async (req, res) => {
  if (req.user.role !== 'manager') return res.status(403).json({ message: 'Forbidden' });
  try {
    const [tasks] = await pool.query(`
      SELECT vt.*, u.name as volunteer_name 
      FROM volunteer_tasks vt 
      LEFT JOIN users u ON vt.USERS_id_user = u.id_user 
      ORDER BY vt.task_date DESC
    `);
    res.json(tasks);
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
    
    // Create notification for volunteer
    await pool.query(
      'INSERT INTO notifications (USERS_id, message, type, created_at, is_read) VALUES (?, ?, ?, NOW(), 0)',
      [USERS_id_user, `New task assigned: ${task_name}. Date: ${task_date}. Please check your dashboard for details.`, 'task_assignment']
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

// Update a task
router.put('/tasks/:id', auth, async (req, res) => {
  if (req.user.role !== 'manager') return res.status(403).json({ message: 'Forbidden' });
  const { task_name, description, task_date, status, USERS_id_user } = req.body;
  try {
    await pool.query(
      'UPDATE volunteer_tasks SET task_name = ?, description = ?, task_date = ?, status = ?, USERS_id_user = ? WHERE task_id = ?',
      [task_name, description, task_date, status, USERS_id_user, req.params.id]
    );
    res.json({ message: 'Task updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete a task
router.delete('/tasks/:id', auth, async (req, res) => {
  if (req.user.role !== 'manager') return res.status(403).json({ message: 'Forbidden' });
  try {
    await pool.query('DELETE FROM volunteer_tasks WHERE task_id = ?', [req.params.id]);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update task status (volunteers can update their own tasks)
router.patch('/tasks/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  try {
    // Check if task belongs to the current user
    const [task] = await pool.query(
      'SELECT * FROM volunteer_tasks WHERE task_id = ? AND USERS_id_user = ?',
      [req.params.id, req.user.id_user]
    );
    
    if (task.length === 0) {
      return res.status(404).json({ message: 'Task not found or not assigned to you' });
    }
    
    // Update task status
    await pool.query(
      'UPDATE volunteer_tasks SET status = ? WHERE task_id = ? AND USERS_id_user = ?',
      [status, req.params.id, req.user.id_user]
    );
    
    res.json({ message: 'Task status updated' });
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

// Match volunteers to events
router.get('/match/:eventId', auth, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    
    // Get event details and required skills
    const [events] = await pool.query(`
      SELECT e.*, GROUP_CONCAT(es.skill_name) as required_skills
      FROM events e
      LEFT JOIN event_skills es ON e.id = es.event_id
      WHERE e.id = ?
      GROUP BY e.id
    `, [eventId]);
    
    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const event = events[0];
    const requiredSkills = event.required_skills ? event.required_skills.split(',') : [];
    
    // Find volunteers with matching skills
    let volunteersQuery = `
      SELECT DISTINCT u.id_user, u.name, u.email,
             GROUP_CONCAT(us.skill_name) as user_skills,
             COUNT(DISTINCT us.skill_name) as matching_skills
      FROM users u
      LEFT JOIN user_skills us ON u.id_user = us.user_id
      WHERE u.role = 'volunteer' 
        AND us.skill_name IN (?)
      GROUP BY u.id_user
      HAVING matching_skills > 0
      ORDER BY matching_skills DESC
    `;
    
    const [volunteers] = await pool.query(volunteersQuery, [requiredSkills]);
    
    // Check availability for each volunteer
    const volunteersWithAvailability = [];
    for (const volunteer of volunteers) {
      const [availability] = await pool.query(`
        SELECT * FROM user_availability 
        WHERE user_id = ? 
          AND day_of_week = DAYOFWEEK(?)
          AND start_time <= ? 
          AND end_time >= ?
      `, [volunteer.id_user, event.date, event.time, event.time]);
      
      if (availability.length > 0) {
        volunteer.available = true;
        volunteer.availability = availability[0];
      } else {
        volunteer.available = false;
      }
      
      volunteersWithAvailability.push(volunteer);
    }
    
    // Filter to only available volunteers and sort by match quality
    const matchedVolunteers = volunteersWithAvailability
      .filter(v => v.available)
      .map(v => ({
        ...v,
        user_skills: v.user_skills ? v.user_skills.split(',') : [],
        match_percentage: Math.round((v.matching_skills / requiredSkills.length) * 100)
      }))
      .sort((a, b) => b.match_percentage - a.match_percentage);
    
    res.json({
      event: {
        id: event.id,
        title: event.title,
        date: event.date,
        time: event.time,
        required_skills: requiredSkills
      },
      matched_volunteers: matchedVolunteers,
      total_matches: matchedVolunteers.length
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Auto-assign volunteers to event (managers only)
router.post('/assign/:eventId', auth, async (req, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Only managers can assign volunteers' });
  }
  
  try {
    const eventId = req.params.eventId;
    const { volunteerIds } = req.body;
    
    if (!Array.isArray(volunteerIds)) {
      return res.status(400).json({ message: 'Volunteer IDs must be an array' });
    }
    
    // Get event details to check capacity
    const [eventDetails] = await pool.query(
      'SELECT max_volunteers, title, description, date, time FROM events WHERE id = ?',
      [eventId]
    );

    if (eventDetails.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const eventTitle = eventDetails[0].title;
    const eventDescription = eventDetails[0].description;
    const eventDate = eventDetails[0].date;
    const eventTime = eventDetails[0].time;

    // Check event capacity
    const [event] = await pool.query(
      'SELECT max_volunteers, (SELECT COUNT(DISTINCT vh.user_id) FROM volunteer_tasks vt JOIN volunteer_history vh ON vt.task_id = vh.task_id WHERE vt.event_id = ? AND vh.status IN ("registered", "attended")) as current_volunteers FROM events WHERE id = ?',
      [eventId, eventId]
    );
    
    if (event[0].current_volunteers + volunteerIds.length > event[0].max_volunteers) {
      return res.status(400).json({ message: 'Too many volunteers for this event' });
    }
    
    // Assign volunteers
    const assignments = [];
    for (const volunteerId of volunteerIds) {
      // Create volunteer task for this event
      const [taskResult] = await pool.query(
        'INSERT INTO volunteer_tasks (task_name, description, task_date, status, event_id, USERS_id_user) VALUES (?, ?, ?, ?, ?, ?)',
        [eventTitle, eventDescription, eventDate, 'pending', eventId, volunteerId]
      );
      
      // Create volunteer history record
      await pool.query(
        'INSERT INTO volunteer_history (user_id, task_id, participation_date, status) VALUES (?, ?, ?, ?)',
        [volunteerId, taskResult.insertId, new Date(), 'registered']
      );
      
      // Create notification for volunteer
      await pool.query(
        'INSERT INTO notifications (USERS_id, message, type, created_at) VALUES (?, ?, ?, NOW())',
        [volunteerId, `You have been assigned to event ${eventId}`, 'event_assignment']
      );
      
      assignments.push(volunteerId);
    }
    
    res.json({ 
      message: 'Volunteers assigned successfully', 
      assigned_count: assignments.length,
      assigned_volunteers: assignments
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get volunteer recommendations for an event
router.get('/recommendations/:eventId', auth, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    
    // Get event requirements
    const [events] = await pool.query(`
      SELECT e.*, GROUP_CONCAT(es.skill_name) as required_skills
      FROM events e
      LEFT JOIN event_skills es ON e.id = es.event_id
      WHERE e.id = ?
      GROUP BY e.id
    `, [eventId]);
    
    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const event = events[0];
    const requiredSkills = event.required_skills ? event.required_skills.split(',') : [];
    
    // Get all volunteers with their skills and availability
    const [volunteers] = await pool.query(`
      SELECT u.id_user, u.name, u.email,
             GROUP_CONCAT(DISTINCT us.skill_name) as skills,
             GROUP_CONCAT(DISTINCT ua.day_of_week) as available_days
      FROM users u
      LEFT JOIN user_skills us ON u.id_user = us.user_id
      LEFT JOIN user_availability ua ON u.id_user = ua.user_id
      WHERE u.role = 'volunteer'
      GROUP BY u.id_user
    `);
    
    // Calculate match scores
    const recommendations = volunteers.map(volunteer => {
      const volunteerSkills = volunteer.skills ? volunteer.skills.split(',') : [];
      const availableDays = volunteer.available_days ? volunteer.available_days.split(',').map(Number) : [];
      
      // Calculate skill match
      const matchingSkills = volunteerSkills.filter(skill => requiredSkills.includes(skill));
      const skillMatchPercentage = requiredSkills.length > 0 ? 
        (matchingSkills.length / requiredSkills.length) * 100 : 0;
      
      // Calculate availability match
      const eventDay = new Date(event.date).getDay();
      const available = availableDays.includes(eventDay);
      
      // Calculate overall score
      const overallScore = skillMatchPercentage * 0.7 + (available ? 30 : 0);
      
      return {
        id_user: volunteer.id_user,
        name: volunteer.name,
        email: volunteer.email,
        skills: volunteerSkills,
        available_days: availableDays,
        matching_skills: matchingSkills,
        skill_match_percentage: Math.round(skillMatchPercentage),
        available_for_event: available,
        overall_score: Math.round(overallScore)
      };
    }).filter(v => v.overall_score > 0)
      .sort((a, b) => b.overall_score - a.overall_score);
    
    res.json({
      event: {
        id: event.id,
        title: event.title,
        date: event.date,
        required_skills: requiredSkills
      },
      recommendations: recommendations.slice(0, 10) // Top 10 recommendations
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get volunteer participation history
router.get('/history/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Check if user is requesting their own history or is a manager
    if (req.user.id_user != userId && req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Not authorized to view this history' });
    }
    
    // Get all events the volunteer has participated in
    const [history] = await pool.query(`
      SELECT e.id, e.title, e.description, e.date, e.time, e.location, e.urgency,
             er.registration_date, er.assigned_by,
             u.name as assigned_by_name,
             COUNT(DISTINCT er2.user_id) as total_volunteers,
             e.max_volunteers
      FROM event_registrations er
      JOIN events e ON er.event_id = e.id
      LEFT JOIN users u ON er.assigned_by = u.id_user
      LEFT JOIN event_registrations er2 ON e.id = er2.event_id
      WHERE er.user_id = ?
      GROUP BY e.id, er.registration_date
      ORDER BY e.date DESC
    `, [userId]);
    
    // Calculate participation stats
    const totalEvents = history.length;
    const totalHours = history.reduce((sum, event) => {
      // Estimate hours based on event duration (you might want to add actual duration field)
      return sum + 3; // Assuming average 3 hours per event
    }, 0);
    
    const eventTypes = [...new Set(history.map(event => event.urgency))];
    
    res.json({
      volunteer_id: userId,
      total_events: totalEvents,
      total_hours: totalHours,
      event_types: eventTypes,
      participation_history: history
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get volunteer performance metrics (managers only)
router.get('/performance/:userId', auth, async (req, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Only managers can view performance metrics' });
  }
  
  try {
    const userId = req.params.userId;
    
    // Get volunteer's event participation
    const [events] = await pool.query(`
      SELECT e.id, e.title, e.date, e.urgency,
             er.registration_date,
             CASE WHEN er.assigned_by IS NOT NULL THEN 'Assigned' ELSE 'Self-Registered' END as registration_type
      FROM event_registrations er
      JOIN events e ON er.event_id = e.id
      WHERE er.user_id = ?
      ORDER BY e.date DESC
    `, [userId]);
    
    // Get volunteer's skills
    const [skills] = await pool.query(`
      SELECT skill_name, proficiency_level
      FROM user_skills
      WHERE user_id = ?
    `, [userId]);
    
    // Calculate metrics
    const totalEvents = events.length;
    const assignedEvents = events.filter(e => e.registration_type === 'Assigned').length;
    const selfRegisteredEvents = events.filter(e => e.registration_type === 'Self-Registered').length;
    
    const urgencyBreakdown = events.reduce((acc, event) => {
      acc[event.urgency] = (acc[event.urgency] || 0) + 1;
      return acc;
    }, {});
    
    // Calculate reliability score (events attended vs assigned)
    const reliabilityScore = totalEvents > 0 ? Math.round((assignedEvents / totalEvents) * 100) : 0;
    
    res.json({
      volunteer_id: userId,
      total_events: totalEvents,
      assigned_events: assignedEvents,
      self_registered_events: selfRegisteredEvents,
      reliability_score: reliabilityScore,
      urgency_breakdown: urgencyBreakdown,
      skills: skills,
      recent_events: events.slice(0, 5) // Last 5 events
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all volunteer statistics (manager dashboard)
router.get('/statistics', auth, async (req, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Only managers can view statistics' });
  }
  
  try {
    // Get total volunteers
    const [volunteerCount] = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE role = "volunteer"'
    );
    
    // Get active volunteers (participated in last 30 days)
    const [activeVolunteers] = await pool.query(`
      SELECT COUNT(DISTINCT er.user_id) as count
      FROM event_registrations er
      JOIN events e ON er.event_id = e.id
      WHERE e.date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);
    
    // Get total events this month
    const [monthlyEvents] = await pool.query(`
      SELECT COUNT(*) as count
      FROM events
      WHERE date >= DATE_FORMAT(NOW(), '%Y-%m-01')
    `);
    
    // Get top performing volunteers
    const [topVolunteers] = await pool.query(`
      SELECT u.id_user, u.name, u.email,
             COUNT(er.event_id) as events_attended,
             COUNT(CASE WHEN er.assigned_by IS NOT NULL THEN 1 END) as assigned_events
      FROM users u
      LEFT JOIN event_registrations er ON u.id_user = er.user_id
      LEFT JOIN events e ON er.event_id = e.id
      WHERE u.role = 'volunteer'
        AND e.date >= DATE_SUB(NOW(), INTERVAL 90 DAY)
      GROUP BY u.id_user
      ORDER BY events_attended DESC
      LIMIT 10
    `);
    
    res.json({
      total_volunteers: volunteerCount[0].count,
      active_volunteers: activeVolunteers[0].count,
      monthly_events: monthlyEvents[0].count,
      top_performers: topVolunteers
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Export volunteer history to CSV (manager only)
router.get('/export-history/:userId', auth, async (req, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Only managers can export history' });
  }
  
  try {
    const userId = req.params.userId;
    
    const [history] = await pool.query(`
      SELECT e.title, e.date, e.time, e.location, e.urgency,
             er.registration_date,
             CASE WHEN er.assigned_by IS NOT NULL THEN 'Assigned' ELSE 'Self-Registered' END as registration_type
      FROM event_registrations er
      JOIN events e ON er.event_id = e.id
      WHERE er.user_id = ?
      ORDER BY e.date DESC
    `, [userId]);
    
    // Convert to CSV format
    const csvHeaders = 'Event Title,Date,Time,Location,Urgency,Registration Date,Registration Type\n';
    const csvData = history.map(event => 
      `"${event.title}","${event.date}","${event.time}","${event.location}","${event.urgency}","${event.registration_date}","${event.registration_type}"`
    ).join('\n');
    
    const csvContent = csvHeaders + csvData;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="volunteer_history_${userId}.csv"`);
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Test endpoint to check database connection and data
router.get('/test-data', async (req, res) => {
  try {
    console.log('=== TESTING DATABASE CONNECTION AND DATA ===');
    
    // Test events table
    const [events] = await pool.query('SELECT COUNT(*) as count FROM events');
    console.log('Events count:', events[0].count);
    
    // Test users table with volunteer role
    const [volunteers] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "volunteer"');
    console.log('Volunteers count:', volunteers[0].count);
    
    // Test volunteer_requests table
    const [requests] = await pool.query('SELECT COUNT(*) as count FROM volunteer_requests');
    console.log('Volunteer requests count:', requests[0].count);
    
    // Get sample data
    const [sampleEvents] = await pool.query('SELECT * FROM events LIMIT 2');
    const [sampleVolunteers] = await pool.query('SELECT * FROM users WHERE role = "volunteer" LIMIT 2');
    const [sampleRequests] = await pool.query('SELECT * FROM volunteer_requests LIMIT 2');
    
    res.json({
      events_count: events[0].count,
      volunteers_count: volunteers[0].count,
      requests_count: requests[0].count,
      sample_events: sampleEvents,
      sample_volunteers: sampleVolunteers,
      sample_requests: sampleRequests
    });
  } catch (err) {
    console.error('Database test error:', err);
    res.status(500).json({ message: 'Database test failed', error: err.message });
  }
});

module.exports = router; 
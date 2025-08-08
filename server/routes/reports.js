const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const restrictTo = require('../middleware/role');

// Get volunteer participation history
router.get('/volunteers/participation', auth, restrictTo(['manager', 'admin']), async (req, res) => {
  try {
    console.log('=== VOLUNTEER PARTICIPATION REPORT CALLED ===');
    console.log('User role:', req.user.role);
    console.log('User ID:', req.user.id_user);
    
    // First, let's get all volunteers
    const [volunteers] = await pool.query(`
      SELECT 
        u.id_user,
        u.name,
        u.email,
        u.role
      FROM users u
      WHERE u.role = 'volunteer'
    `);
    
    console.log('Found volunteers:', volunteers.length);
    
    // Then get their participation data
    const [participationData] = await pool.query(`
      SELECT 
        vh.user_id,
        COUNT(DISTINCT vh.task_id) as total_tasks,
        COUNT(CASE WHEN vh.status = 'completed' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN vh.status = 'attended' THEN 1 END) as attended_events,
        COUNT(CASE WHEN vh.status = 'registered' THEN 1 END) as registered_events,
        AVG(CASE WHEN vh.hours_worked IS NOT NULL THEN vh.hours_worked END) as avg_hours_per_task,
        SUM(CASE WHEN vh.hours_worked IS NOT NULL THEN vh.hours_worked END) as total_hours,
        MIN(vh.participation_date) as first_participation,
        MAX(vh.participation_date) as last_participation
      FROM volunteer_history vh
      GROUP BY vh.user_id
    `);
    
    console.log('Found participation data:', participationData.length);
    
    // Combine the data
    const result = volunteers.map(volunteer => {
      const participation = participationData.find(p => p.user_id === volunteer.id_user);
      return {
        id_user: volunteer.id_user,
        name: volunteer.name,
        email: volunteer.email,
        role: volunteer.role,
        total_tasks: participation ? participation.total_tasks : 0,
        completed_tasks: participation ? participation.completed_tasks : 0,
        attended_events: participation ? participation.attended_events : 0,
        registered_events: participation ? participation.registered_events : 0,
        avg_hours_per_task: participation ? participation.avg_hours_per_task : 0,
        total_hours: participation ? participation.total_hours : 0,
        first_participation: participation ? participation.first_participation : null,
        last_participation: participation ? participation.last_participation : null
      };
    });
    
    console.log('Returning result with', result.length, 'volunteers');
    res.json(result);
  } catch (err) {
    console.error('Volunteer participation report error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get detailed volunteer activity report
router.get('/volunteers/:id/activity', auth, restrictTo(['manager', 'admin']), async (req, res) => {
  try {
    const [volunteer] = await pool.query(`
      SELECT 
        u.id_user,
        u.name,
        u.email,
        u.role,
        u.date_of_birth,
        u.address,
        u.city,
        u.state
      FROM users u
      WHERE u.id_user = ? AND u.role = 'volunteer'
    `, [req.params.id]);
    
    if (volunteer.length === 0) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }
    
    const [activities] = await pool.query(`
      SELECT 
        vh.*,
        vt.task_name,
        vt.description as task_description,
        vt.task_date,
        e.title as event_title,
        e.location as event_location,
        e.date as event_date
      FROM volunteer_history vh
      LEFT JOIN volunteer_tasks vt ON vh.task_id = vt.task_id
      LEFT JOIN events e ON vt.event_id = e.id
      WHERE vh.user_id = ?
      ORDER BY vh.participation_date DESC
    `, [req.params.id]);
    
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_activities,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN status = 'attended' THEN 1 END) as attended_events,
        COUNT(CASE WHEN status = 'registered' THEN 1 END) as registered_events,
        SUM(hours_worked) as total_hours,
        AVG(hours_worked) as avg_hours_per_activity
      FROM volunteer_history
      WHERE user_id = ?
    `, [req.params.id]);
    
    res.json({
      volunteer: volunteer[0],
      activities,
      stats: stats[0]
    });
  } catch (err) {
    console.error('Volunteer activity report error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get event management report
router.get('/events/management', auth, restrictTo(['manager', 'admin']), async (req, res) => {
  try {
    console.log('=== EVENT MANAGEMENT REPORT CALLED ===');
    console.log('User role:', req.user.role);
    console.log('User ID:', req.user.id_user);
    
    // First, let's get all events
    const [events] = await pool.query(`
      SELECT 
        e.id,
        e.title,
        e.description,
        e.date,
        e.time,
        e.location,
        e.urgency,
        e.max_volunteers
      FROM events e
      ORDER BY e.date DESC
    `);
    
    console.log('Found events:', events.length);
    
    // Then get their volunteer data
    const [volunteerData] = await pool.query(`
      SELECT 
        vt.task_name,
        COUNT(DISTINCT vh.user_id) as total_volunteers,
        COUNT(CASE WHEN vh.status = 'attended' THEN 1 END) as attended_volunteers,
        COUNT(CASE WHEN vh.status = 'registered' THEN 1 END) as registered_volunteers,
        COUNT(CASE WHEN vh.status = 'completed' THEN 1 END) as completed_tasks,
        AVG(CASE WHEN vh.hours_worked IS NOT NULL THEN vh.hours_worked END) as avg_hours_per_volunteer,
        SUM(CASE WHEN vh.hours_worked IS NOT NULL THEN vh.hours_worked END) as total_hours_worked
      FROM volunteer_tasks vt
      LEFT JOIN volunteer_history vh ON vt.task_id = vh.task_id
      GROUP BY vt.task_name
    `);
    
    console.log('Found volunteer data:', volunteerData.length);
    
    // Combine the data
    const result = events.map(event => {
      const volunteer = volunteerData.find(v => v.task_name === event.title);
      return {
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        urgency: event.urgency,
        max_volunteers: event.max_volunteers,
        total_volunteers: volunteer ? volunteer.total_volunteers : 0,
        attended_volunteers: volunteer ? volunteer.attended_volunteers : 0,
        registered_volunteers: volunteer ? volunteer.registered_volunteers : 0,
        completed_tasks: volunteer ? volunteer.completed_tasks : 0,
        avg_hours_per_volunteer: volunteer ? volunteer.avg_hours_per_volunteer : 0,
        total_hours_worked: volunteer ? volunteer.total_hours_worked : 0
      };
    });
    
    console.log('Returning result with', result.length, 'events');
    res.json(result);
  } catch (err) {
    console.error('Event management report error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get detailed event report
router.get('/events/:id/detailed', auth, restrictTo(['manager', 'admin']), async (req, res) => {
  try {
    const [event] = await pool.query(`
      SELECT 
        e.*,
        GROUP_CONCAT(DISTINCT es.skill_name) as required_skills
      FROM events e
      LEFT JOIN event_skills es ON e.id = es.event_id
      WHERE e.id = ?
      GROUP BY e.id
    `, [req.params.id]);
    
    if (event.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const [volunteers] = await pool.query(`
      SELECT 
        u.id_user,
        u.name,
        u.email,
        vh.status,
        vh.participation_date,
        vh.hours_worked,
        vh.notes
      FROM volunteer_history vh
      JOIN users u ON vh.user_id = u.id_user
      JOIN volunteer_tasks vt ON vh.task_id = vt.task_id
      JOIN events e ON vt.event_id = e.id
      WHERE e.id = ?
      ORDER BY vh.participation_date DESC
    `, [req.params.id]);
    
    const [stats] = await pool.query(`
      SELECT 
        COUNT(DISTINCT vh.user_id) as total_volunteers,
        COUNT(CASE WHEN vh.status = 'attended' THEN 1 END) as attended_volunteers,
        COUNT(CASE WHEN vh.status = 'registered' THEN 1 END) as registered_volunteers,
        COUNT(CASE WHEN vh.status = 'completed' THEN 1 END) as completed_tasks,
        SUM(vh.hours_worked) as total_hours_worked,
        AVG(vh.hours_worked) as avg_hours_per_volunteer
      FROM volunteer_history vh
      JOIN volunteer_tasks vt ON vh.task_id = vt.task_id
      JOIN events e ON vt.event_id = e.id
      WHERE e.id = ?
    `, [req.params.id]);
    
    res.json({
      event: {
        ...event[0],
        required_skills: event[0].required_skills ? event[0].required_skills.split(',') : []
      },
      volunteers,
      stats: stats[0]
    });
  } catch (err) {
    console.error('Detailed event report error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get volunteer performance metrics
router.get('/volunteers/performance', auth, restrictTo(['manager', 'admin']), async (req, res) => {
  try {
    console.log('=== VOLUNTEER PERFORMANCE REPORT CALLED ===');
    console.log('User role:', req.user.role);
    console.log('User ID:', req.user.id_user);
    
    // First, let's get all volunteers
    const [volunteers] = await pool.query(`
      SELECT 
        u.id_user,
        u.name,
        u.email
      FROM users u
      WHERE u.role = 'volunteer'
    `);
    
    console.log('Found volunteers:', volunteers.length);
    
    // Then get their performance data
    const [performanceData] = await pool.query(`
      SELECT 
        vh.user_id,
        COUNT(DISTINCT vh.task_id) as total_activities,
        COUNT(CASE WHEN vh.status = 'completed' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN vh.status = 'attended' THEN 1 END) as attended_events,
        SUM(vh.hours_worked) as total_hours,
        AVG(vh.hours_worked) as avg_hours_per_activity,
        COUNT(CASE WHEN vh.status = 'no_show' THEN 1 END) as no_shows,
        ROUND(
          (COUNT(CASE WHEN vh.status IN ('completed', 'attended') THEN 1 END) * 100.0 / 
           NULLIF(COUNT(*), 0)
        ), 2
        ) as reliability_percentage
      FROM volunteer_history vh
      GROUP BY vh.user_id
    `);
    
    console.log('Found performance data:', performanceData.length);
    
    // Combine the data
    const result = volunteers.map(volunteer => {
      const performance = performanceData.find(p => p.user_id === volunteer.id_user);
      return {
        id_user: volunteer.id_user,
        name: volunteer.name,
        email: volunteer.email,
        total_activities: performance ? performance.total_activities : 0,
        completed_tasks: performance ? performance.completed_tasks : 0,
        attended_events: performance ? performance.attended_events : 0,
        total_hours: performance ? performance.total_hours : 0,
        avg_hours_per_activity: performance ? performance.avg_hours_per_activity : 0,
        no_shows: performance ? performance.no_shows : 0,
        reliability_percentage: performance ? performance.reliability_percentage : 0
      };
    });
    
    console.log('Returning result with', result.length, 'volunteers');
    res.json(result);
  } catch (err) {
    console.error('Volunteer performance report error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get monthly activity summary
router.get('/monthly/summary', auth, restrictTo(['manager', 'admin']), async (req, res) => {
  try {
    console.log('=== MONTHLY SUMMARY REPORT CALLED ===');
    console.log('User role:', req.user.role);
    console.log('User ID:', req.user.id_user);
    
    const { year, month } = req.query;
    const targetYear = year || new Date().getFullYear();
    const targetMonth = month || new Date().getMonth() + 1;
    
    console.log('Target year:', targetYear, 'Target month:', targetMonth);
    
    // Get summary data
    const [summary] = await pool.query(`
      SELECT 
        COUNT(DISTINCT e.id) as total_events,
        COUNT(DISTINCT vh.user_id) as active_volunteers,
        COUNT(DISTINCT vh.task_id) as total_activities,
        SUM(vh.hours_worked) as total_hours_worked,
        AVG(vh.hours_worked) as avg_hours_per_activity,
        COUNT(CASE WHEN vh.status = 'completed' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN vh.status = 'attended' THEN 1 END) as attended_events
      FROM volunteer_history vh
      LEFT JOIN volunteer_tasks vt ON vh.task_id = vt.task_id
      LEFT JOIN events e ON vt.event_id = e.id
      WHERE YEAR(vh.participation_date) = ? AND MONTH(vh.participation_date) = ?
    `, [targetYear, targetMonth]);
    
    console.log('Summary data:', summary[0]);
    
    // Get daily breakdown
    const [monthlyBreakdown] = await pool.query(`
      SELECT 
        DATE(vh.participation_date) as date,
        COUNT(DISTINCT vh.user_id) as volunteers,
        COUNT(DISTINCT vh.task_id) as activities,
        SUM(vh.hours_worked) as hours_worked
      FROM volunteer_history vh
      WHERE YEAR(vh.participation_date) = ? AND MONTH(vh.participation_date) = ?
      GROUP BY DATE(vh.participation_date)
      ORDER BY date
    `, [targetYear, targetMonth]);
    
    console.log('Monthly breakdown data:', monthlyBreakdown.length, 'days');
    
    const result = {
      summary: summary[0],
      monthlyBreakdown,
      period: { year: targetYear, month: targetMonth }
    };
    
    console.log('Returning monthly summary result');
    res.json(result);
  } catch (err) {
    console.error('Monthly summary report error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 
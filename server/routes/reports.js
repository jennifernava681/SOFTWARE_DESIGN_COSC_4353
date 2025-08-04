const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const restrictTo = require('../middleware/role');

// Get volunteer participation history
router.get('/volunteers/participation', auth, restrictTo(['manager', 'admin']), async (req, res) => {
  try {
    const [volunteers] = await pool.query(`
      SELECT 
        u.id_user,
        u.name,
        u.email,
        u.role,
        COUNT(DISTINCT vh.task_id) as total_tasks,
        COUNT(CASE WHEN vh.status = 'completed' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN vh.status = 'attended' THEN 1 END) as attended_events,
        COUNT(CASE WHEN vh.status = 'registered' THEN 1 END) as registered_events,
        AVG(CASE WHEN vh.hours_worked IS NOT NULL THEN vh.hours_worked END) as avg_hours_per_task,
        SUM(CASE WHEN vh.hours_worked IS NOT NULL THEN vh.hours_worked END) as total_hours,
        MIN(vh.participation_date) as first_participation,
        MAX(vh.participation_date) as last_participation
      FROM users u
      LEFT JOIN volunteer_history vh ON u.id_user = vh.user_id
      WHERE u.role = 'volunteer'
      GROUP BY u.id_user, u.name, u.email, u.role
      ORDER BY total_hours DESC, total_tasks DESC
    `);
    
    res.json(volunteers);
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
    const [events] = await pool.query(`
      SELECT 
        e.*,
        COUNT(DISTINCT vh.user_id) as total_volunteers,
        COUNT(CASE WHEN vh.status = 'attended' THEN 1 END) as attended_volunteers,
        COUNT(CASE WHEN vh.status = 'registered' THEN 1 END) as registered_volunteers,
        COUNT(CASE WHEN vh.status = 'completed' THEN 1 END) as completed_tasks,
        AVG(CASE WHEN vh.hours_worked IS NOT NULL THEN vh.hours_worked END) as avg_hours_per_volunteer,
        SUM(CASE WHEN vh.hours_worked IS NOT NULL THEN vh.hours_worked END) as total_hours_worked
      FROM events e
      LEFT JOIN volunteer_tasks vt ON e.title = vt.task_name
      LEFT JOIN volunteer_history vh ON vt.task_id = vh.task_id
      GROUP BY e.id, e.title, e.date, e.location, e.urgency
      ORDER BY e.date DESC
    `);
    
    res.json(events);
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
    const [performance] = await pool.query(`
      SELECT 
        u.id_user,
        u.name,
        u.email,
        COUNT(DISTINCT vh.task_id) as total_activities,
        COUNT(CASE WHEN vh.status = 'completed' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN vh.status = 'attended' THEN 1 END) as attended_events,
        SUM(vh.hours_worked) as total_hours,
        AVG(vh.hours_worked) as avg_hours_per_activity,
        COUNT(CASE WHEN vh.status = 'no_show' THEN 1 END) as no_shows,
        ROUND(
          (COUNT(CASE WHEN vh.status IN ('completed', 'attended') THEN 1 END) * 100.0 / 
           COUNT(*)
        ), 2
        ) as reliability_percentage
      FROM users u
      LEFT JOIN volunteer_history vh ON u.id_user = vh.user_id
      WHERE u.role = 'volunteer'
      GROUP BY u.id_user, u.name, u.email
      ORDER BY reliability_percentage DESC, total_hours DESC
    `);
    
    res.json(performance);
  } catch (err) {
    console.error('Volunteer performance report error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get monthly activity summary
router.get('/monthly/summary', auth, restrictTo(['manager', 'admin']), async (req, res) => {
  try {
    const { year, month } = req.query;
    const targetYear = year || new Date().getFullYear();
    const targetMonth = month || new Date().getMonth() + 1;
    
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
    
    res.json({
      summary: summary[0],
      monthlyBreakdown,
      period: { year: targetYear, month: targetMonth }
    });
  } catch (err) {
    console.error('Monthly summary report error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register
router.post('/register', async (req, res) => {
  console.log('=== REGISTRATION REQUEST DEBUG ===');
  console.log('Request headers:', req.headers);
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('Content-Type:', req.get('Content-Type'));
  console.log('Body type:', typeof req.body);
  console.log('Body keys:', Object.keys(req.body || {}));

  const { 
    name, 
    email, 
    password, 
    role = 'public',
    address,
    address2,
    city,
    state,
    zip,
    sex,
    dateOfBirth,
    securityQuestion,
    securityAnswer,
    skills,
    preferences,
    availability
  } = req.body;

  console.log('=== EXTRACTED FIELDS ===');
  console.log('name:', name, 'type:', typeof name, 'length:', name ? name.length : 0);
  console.log('email:', email, 'type:', typeof email, 'length:', email ? email.length : 0);
  console.log('password:', password ? '[HIDDEN]' : 'null', 'type:', typeof password, 'length:', password ? password.length : 0);
  console.log('address:', address, 'type:', typeof address, 'length:', address ? address.length : 0);
  console.log('city:', city, 'type:', typeof city, 'length:', city ? city.length : 0);
  console.log('state:', state, 'type:', typeof state, 'length:', state ? state.length : 0);

  // Validate required fields
  const missingFields = [];
  if (!name || name.trim() === '') missingFields.push('name');
  if (!email || email.trim() === '') missingFields.push('email');
  if (!password || password.trim() === '') missingFields.push('password');
  if (!address || address.trim() === '') missingFields.push('address');
  if (!city || city.trim() === '') missingFields.push('city');
  if (!state || state.trim() === '') missingFields.push('state');

  if (missingFields.length > 0) {
    console.log('=== VALIDATION FAILED ===');
    console.log('Missing fields:', missingFields);
    console.log('Field values:', {
      name: name || 'null',
      email: email || 'null', 
      password: password ? '[HIDDEN]' : 'null',
      address: address || 'null',
      city: city || 'null',
      state: state || 'null'
    });
    return res.status(400).json({ 
      message: 'Missing required fields',
      missingFields: missingFields,
      receivedFields: Object.keys(req.body || {})
    });
  }

  console.log('=== VALIDATION PASSED ===');
  console.log('All required fields present');

  try {
    // Check if email already exists
    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Create user record with correct column names
    const [userResult] = await pool.query(
      `INSERT INTO users (
        name, email, password_hash, role, sex, date_of_birth, 
        Security_question, address_1, address_2, city, state
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, hash, role, sex || null, dateOfBirth || null, 
       securityQuestion || null, address, address2 || null, city, state]
    );

    const userId = userResult.insertId;

    // Store skills if provided
    if (skills && Array.isArray(skills) && skills.length > 0) {
      for (const skill of skills) {
        await pool.query(
          'INSERT INTO user_skills (user_id, skill_name) VALUES (?, ?)',
          [userId, skill]
        );
      }
    }

    // Store preferences if provided
    if (preferences) {
      await pool.query(
        'INSERT INTO user_preferences (user_id, preferences) VALUES (?, ?)',
        [userId, preferences]
      );
    }

    // Store availability if provided
    if (availability && Array.isArray(availability) && availability.length > 0) {
      for (const date of availability) {
        await pool.query(
          'INSERT INTO user_availability (user_id, available_date) VALUES (?, ?)',
          [userId, date]
        );
      }
    }

    res.status(201).json({ 
      message: 'User registered successfully',
      userId: userId
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing email or password' });
  }
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const user = users[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id_user: user.id_user, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id_user: user.id_user, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Debug endpoint to check environment variables
router.get('/debug-env', (req, res) => {
  res.json({
    hasDBHost: !!process.env.DB_HOST,
    hasDBUser: !!process.env.DB_USER,
    hasDBPass: !!process.env.DB_PASS,
    hasDBName: !!process.env.DB_NAME,
    hasJWTSecret: !!process.env.JWT_SECRET,
    dbHost: process.env.DB_HOST ? 'Set' : 'Not Set',
    dbName: process.env.DB_NAME || 'Not Set'
  });
});

// Validation helper
const validateUserData = (data) => {
  const errors = [];
  
  if (!data.name || data.name.length > 50) {
    errors.push('Name is required and must be under 50 characters');
  }
  
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Valid email is required');
  }
  
  if (data.phone && !/^\d{10}$/.test(data.phone.replace(/\D/g, ''))) {
    errors.push('Phone must be 10 digits');
  }
  
  if (data.skills && !Array.isArray(data.skills)) {
    errors.push('Skills must be an array');
  }
  
  return errors;
};

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT u.id_user, u.name, u.email, u.role, u.sex, u.date_of_birth, 
             u.Security_question, u.adrees_idadrees_id, u.adrees_state_state_id,
             a.line_1, a.line_2, a.city, s.state
      FROM users u 
      LEFT JOIN adrees a ON u.adrees_idadrees_id = a.idadrees_id 
      LEFT JOIN state s ON a.state_state_id = s.state_id 
      WHERE u.id_user = ?
    `, [req.user.id_user]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user skills (if we had a skills table)
    const [skills] = await pool.query('SELECT * FROM user_skills WHERE user_id = ?', [req.user.id_user]);
    
    const user = users[0];
    user.skills = skills.map(s => s.skill_name);
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update user profile (make it better)
router.put('/profile', auth, async (req, res) => {
  const { name, email, phone, skills, preferences, availability } = req.body;
  
  // Validate the data (because we care)
  const errors = validateUserData({ name, email, phone, skills });
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  
  try {
    // Update basic info
    await pool.query(
      'UPDATE users SET name = ?, email = ? WHERE id_user = ?',
      [name, email, req.user.id_user]
    );
    
    // Update skills (if we had a skills table)
    if (skills && Array.isArray(skills)) {
      await pool.query('DELETE FROM user_skills WHERE user_id = ?', [req.user.id_user]);
      for (const skill of skills) {
        await pool.query('INSERT INTO user_skills (user_id, skill_name) VALUES (?, ?)', 
          [req.user.id_user, skill]);
      }
    }
    
    // Update preferences (if we had a preferences table)
    if (preferences) {
      await pool.query(
        'INSERT INTO user_preferences (user_id, preferences) VALUES (?, ?) ON DUPLICATE KEY UPDATE preferences = ?',
        [req.user.id_user, JSON.stringify(preferences), JSON.stringify(preferences)]
      );
    }
    
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get user availability (when can they help?)
router.get('/availability', auth, async (req, res) => {
  try {
    const [availability] = await pool.query(
      'SELECT * FROM user_availability WHERE user_id = ?',
      [req.user.id_user]
    );
    res.json(availability);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update user availability (set your schedule)
router.put('/availability', auth, async (req, res) => {
  const { availability } = req.body;
  
  if (!Array.isArray(availability)) {
    return res.status(400).json({ message: 'Availability must be an array' });
  }
  
  try {
    // Clear existing availability
    await pool.query('DELETE FROM user_availability WHERE user_id = ?', [req.user.id_user]);
    
    // Add new availability
    for (const slot of availability) {
      await pool.query(
        'INSERT INTO user_availability (user_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)',
        [req.user.id_user, slot.day, slot.start, slot.end]
      );
    }
    
    res.json({ message: 'Availability updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 
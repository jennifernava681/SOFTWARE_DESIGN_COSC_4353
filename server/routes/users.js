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
  console.log('Body values:', Object.values(req.body || {}));
  console.log('Body entries:', Object.entries(req.body || {}));

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
  console.log('name:', name, 'type:', typeof name, 'length:', name ? name.length : 0, 'truthy:', !!name);
  console.log('email:', email, 'type:', typeof email, 'length:', email ? email.length : 0, 'truthy:', !!email);
  console.log('password:', password ? '[HIDDEN]' : 'null', 'type:', typeof password, 'length:', password ? password.length : 0, 'truthy:', !!password);
  console.log('address:', address, 'type:', typeof address, 'length:', address ? address.length : 0, 'truthy:', !!address);
  console.log('city:', city, 'type:', typeof city, 'length:', city ? city.length : 0, 'truthy:', !!city);
  console.log('state:', state, 'type:', typeof state, 'length:', state ? state.length : 0, 'truthy:', !!state);
  console.log('dateOfBirth:', dateOfBirth, 'type:', typeof dateOfBirth, 'truthy:', !!dateOfBirth);
  console.log('securityQuestion:', securityQuestion, 'type:', typeof securityQuestion, 'truthy:', !!securityQuestion);
  console.log('sex:', sex, 'type:', typeof sex, 'truthy:', !!sex);
  console.log('role:', role, 'type:', typeof role, 'truthy:', !!role);

  // Validate required fields
  const missingFields = [];
  if (!name || name.trim() === '') missingFields.push('name');
  if (!email || email.trim() === '') missingFields.push('email');
  if (!password || password.trim() === '') missingFields.push('password');
  if (!address || address.trim() === '') missingFields.push('address');
  if (!city || city.trim() === '') missingFields.push('city');
  if (!state || state.trim() === '') missingFields.push('state');

  console.log('=== VALIDATION CHECK ===');
  console.log('Missing fields array:', missingFields);
  console.log('Individual field checks:');
  console.log('- name check:', !name || name.trim() === '', 'value:', name);
  console.log('- email check:', !email || email.trim() === '', 'value:', email);
  console.log('- password check:', !password || password.trim() === '', 'value:', password ? '[HIDDEN]' : password);
  console.log('- address check:', !address || address.trim() === '', 'value:', address);
  console.log('- city check:', !city || city.trim() === '', 'value:', city);
  console.log('- state check:', !state || state.trim() === '', 'value:', state);

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
    const insertQuery = `INSERT INTO users (
      name, email, password_hash, role, sex, date_of_birth, 
      Security_question, address_1, address_2, city, state
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const insertParams = [name, email, hash, role, sex || null, dateOfBirth || null, 
       securityQuestion || null, address, address2 || null, city, state];
    
    console.log('=== SQL QUERY DEBUG ===');
    console.log('Query:', insertQuery);
    console.log('Parameters:', insertParams);
    
    const [userResult] = await pool.query(insertQuery, insertParams);

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
    console.log("Password match result:", match);
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
    // Get user information with address fields
    const [users] = await pool.query(`
      SELECT id_user, name, email, role, sex, date_of_birth, Security_question,
             address_1, address_2, city, state, zip
      FROM users 
      WHERE id_user = ?
    `, [req.user.id_user]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const user = users[0];
    
    // Get user skills from user_skills table
    const [userSkills] = await pool.query(`
      SELECT skill_name 
      FROM user_skills 
      WHERE user_id = ?
    `, [req.user.id_user]);
    
    // Get user preferences from user_preferences table
    const [userPreferences] = await pool.query(`
      SELECT preferences 
      FROM user_preferences 
      WHERE user_id = ?
    `, [req.user.id_user]);
    
    // Get user availability from user_availability table
    const [userAvailability] = await pool.query(`
      SELECT available_date, day_of_week, start_time, end_time
      FROM user_availability 
      WHERE user_id = ?
    `, [req.user.id_user]);
    
    // Format skills array
    const skills = userSkills.map(skill => skill.skill_name);
    
    // Format preferences
    const preferences = userPreferences.length > 0 ? userPreferences[0].preferences : '';
    
    // Format availability array
    const availability = userAvailability.map(avail => ({
      date: avail.available_date,
      time: avail.start_time && avail.end_time ? 
        `${avail.start_time} - ${avail.end_time}` : 
        'Any time'
    }));
    
    // Format the response to match frontend expectations
    const profileData = {
      id_user: user.id_user,
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'public',
      sex: user.sex || '',
      date_of_birth: user.date_of_birth,
      phone: '', // Not stored in current schema
      address: user.address_1 || '',
      apartment: user.address_2 || '',
      city: user.city || '',
      state: user.state || '',
      zip: user.zip || '',
      skills: skills,
      preferences: preferences,
      availability: availability
    };
    
    res.json(profileData);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  const { name, email, address, apartment, city, state, zip, skills, preferences, availability } = req.body;
  
  // Validate the data
  const errors = validateUserData({ name, email });
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  
  try {
    // Update user information including address fields
    await pool.query(
      'UPDATE users SET name = ?, email = ?, address_1 = ?, address_2 = ?, city = ?, state = ?, zip = ? WHERE id_user = ?',
      [name, email, address || '', apartment || '', city || '', state || '', zip || '', req.user.id_user]
    );
    
    // Update skills in user_skills table
    if (skills && Array.isArray(skills)) {
      // Delete existing skills
      await pool.query('DELETE FROM user_skills WHERE user_id = ?', [req.user.id_user]);
      
      // Insert new skills
      for (const skill of skills) {
        if (skill.trim()) {
          await pool.query(
            'INSERT INTO user_skills (user_id, skill_name) VALUES (?, ?)',
            [req.user.id_user, skill.trim()]
          );
        }
      }
    }
    
    // Update preferences in user_preferences table
    if (preferences !== undefined) {
      await pool.query(
        'INSERT INTO user_preferences (user_id, preferences) VALUES (?, ?) ON DUPLICATE KEY UPDATE preferences = ?',
        [req.user.id_user, preferences, preferences]
      );
    }
    
    // Update availability in user_availability table
    if (availability && Array.isArray(availability)) {
      // Delete existing availability
      await pool.query('DELETE FROM user_availability WHERE user_id = ?', [req.user.id_user]);
      
      // Insert new availability
      for (const avail of availability) {
        if (avail.date) {
          await pool.query(
            'INSERT INTO user_availability (user_id, available_date) VALUES (?, ?)',
            [req.user.id_user, avail.date]
          );
        }
      }
    }
    
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Error updating profile:', err);
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
// ✅ Deactivate a volunteer (sets active = 0)
router.put('/deactivate/volunteers/:id/deactivate', auth, async (req, res) => {
  const volunteerId = req.params.id;

  try {
    const [result] = await pool.query(
      'UPDATE users SET active = 0 WHERE id_user = ? AND role = "volunteer"',
      [volunteerId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Volunteer not found or already deactivated' });
    }

    res.json({ message: 'Volunteer deactivated successfully' });
  } catch (err) {
    console.error('Error deactivating volunteer:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get all active volunteers
router.get('/deactivate/volunteers/active/all', auth, async (req, res) => {
  try {
    const [volunteers] = await pool.query(
      'SELECT id_user, name, email, role FROM users WHERE role = "volunteer" AND active = 1'
    );
    res.json(volunteers);
  } catch (err) {
    console.error('Error fetching active volunteers:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 
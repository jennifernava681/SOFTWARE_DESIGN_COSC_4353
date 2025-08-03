const express = require('express');
const cors = require('cors');
const pool = require('./db');
const bodyParser = require('body-parser');
require('dotenv').config();

const userRoutes = require('./routes/users');
const animalRoutes = require('./routes/animals');
const adoptionRoutes = require('./routes/adoption');
const eventRoutes = require('./routes/events');
const donationRoutes = require('./routes/donations');
const volunteerRoutes = require('./routes/volunteers');
const notificationRoutes = require('./routes/notifications');
const vetRoutes = require('./routes/vets');
const surrenderRoutes = require('./routes/surrender');

console.log(">>> Starting backend app...");

const app = express();

app.use(cors({
  origin: 'https://hopepaws.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Add debugging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

app.use('/api/vets', vetRoutes);
app.use('/api/users', userRoutes);
app.use('/api/animals', animalRoutes);
app.use('/api/adoptions', adoptionRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/surrender', surrenderRoutes);

app.get('/', (req, res) => res.send('API Running'));
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Test route working!' });
});

app.get('/api/db-test', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    res.json({ success: true, result: rows[0].result });
  } catch (error) {
    console.error('DB connection error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/check-tables', async (req, res) => {
  try {
    const tables = ['state', 'adrees', 'users', 'user_skills', 'user_preferences', 'user_availability'];
    const results = {};
    
    for (const table of tables) {
      try {
        const [rows] = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
        results[table] = { exists: true, count: rows[0].count };
      } catch (error) {
        results[table] = { exists: false, error: error.message };
      }
    }
    
    res.json({ success: true, tables: results });
  } catch (error) {
    console.error('Table check error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/test', (req, res) => {
  res.json({ success: true, message: 'Test route working (POST)!' });
});

// Add a simple test POST endpoint
app.post('/api/test-post', (req, res) => {
  console.log('Test POST endpoint hit');
  console.log('Request body:', req.body);
  res.json({ 
    success: true, 
    message: 'POST request received!',
    receivedBody: req.body,
    method: req.method,
    path: req.path
  });
});

// Add a test endpoint for registration debugging
app.post('/api/test-registration', (req, res) => {
  console.log('=== TEST REGISTRATION ENDPOINT ===');
  console.log('Headers:', req.headers);
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('Content-Type:', req.get('Content-Type'));
  
  res.json({ 
    success: true, 
    message: 'Test registration endpoint working!',
    receivedBody: req.body,
    bodyKeys: Object.keys(req.body || {}),
    contentType: req.get('Content-Type')
  });
});

app.options('*', cors());

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`)); 
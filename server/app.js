const express = require('express');
const cors = require('cors');
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

console.log(">>> Starting backend app...");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/vets', vetRoutes);
app.use('/api/users', userRoutes);
app.use('/api/animals', animalRoutes);
app.use('/api/adoptions', adoptionRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => res.send('API Running'));
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Test route working!' });
});

app.post('/api/test', (req, res) => {
  res.json({ success: true, message: 'Test route working (POST)!' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`)); 
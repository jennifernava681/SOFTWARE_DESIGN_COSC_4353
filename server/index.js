const express = require('express');
const pool = require('./db');
const app = express();
const PORT = process.env.port || 5000;
/* const apiRouter = require() */
require("dotenv").config();


/* Test database connection */
pool.query('SELECT DATABASE() AS db, NOW() AS time')
  .then(([rows]) => {
    console.log(`Connected to DB: ${rows[0].db} at ${rows[0].time}`);
  })
  .catch(err => {
    console.error('Connection failed:', err.message);
  });

/*module.exports = conn;*/

app.use(express.json());
/* app.use("/api", apiRouter)*/

app.get('/', (req, res) => {
    res.send('Welcome to the Animal Shelter backend!');
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`)); 
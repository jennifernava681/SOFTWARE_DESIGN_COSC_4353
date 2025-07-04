const express = require('express');
const mysql = require("mysql");
const app = express();
const PORT = 5000;
/* const apiRouter = require() */

require("dotenv").config();

const conn = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

conn.connect(err => {
    if(err) {
        console.error("Connection error:", err);
        return;
    }
    console.log("Connected to MySQL database!");
});

/*module.exports = conn;*/

app.use(express.json());
/* app.use("/api", apiRouter)*/

app.get('/', (req, res) => {
    res.send('Welcome to the Animal Shelter backend!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})

app.post('/api/adoption-request', (req, res) => {
  const data = req.body;
  console.log('Received adoption request:', data);
  // Save to database, send email, etc.
  res.status(200).json({ message: 'Success' });
});
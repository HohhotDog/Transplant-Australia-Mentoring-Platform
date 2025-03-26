// ./server/index.js
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 4000;



app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Transplant Australia backend server!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.get('/mentors', (req, res) => {
  db.query('SELECT * FROM mentors', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});
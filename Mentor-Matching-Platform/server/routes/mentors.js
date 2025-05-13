// server/routes/mentors.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // adjust this path to your DB instance

/**
 * GET /api/mentors?search=term
 * Search mentors by name, pulling name and avatar from the profiles table.
 * Returns an array of { id, name, avatar }.
 */
router.get('/', (req, res) => {
  const term = `%${req.query.search || ''}%`;
  const sql = `
    SELECT 
      u.id,
      p.first_name || ' ' || p.last_name AS name,
      p.profile_picture_url AS avatar
    FROM users u
    JOIN profiles p ON p.user_id = u.id
    WHERE u.account_type = 'mentor'
      AND (p.first_name || ' ' || p.last_name) LIKE ?
    LIMIT 20
  `;
  db.all(sql, [term], (err, rows) => {
    if (err) {
      console.error('Search mentors failed:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

module.exports = router;
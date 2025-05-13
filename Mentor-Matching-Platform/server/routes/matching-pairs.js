// server/routes/matching-pairs.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // adjust this path to your DB instance

/**
 * POST /api/matching-pairs
 * Request body: { sessionId, applicationId, mentorId }
 * 1. Look up the application’s user_id as menteeId.
 * 2. Insert a new record into matching_pairs.
 * 3. Return the created pair.
 */
router.post('/', (req, res) => {
  const { sessionId, applicationId, mentorId } = req.body;

  // 1. Retrieve the user_id (mentee) from applications
  const lookupSql = `SELECT user_id AS menteeId FROM applications WHERE id = ?`;
  db.get(lookupSql, [applicationId], (err, row) => {
    if (err || !row) {
      console.error('Error fetching application:', err);
      return res.status(500).json({ error: 'Unable to retrieve application' });
    }
    const menteeId = row.menteeId;

    // 2. Insert pairing record
    const insertSql = `
      INSERT INTO matching_pairs (session_id, mentor_id, mentee_id)
      VALUES (?, ?, ?)
    `;
    db.run(insertSql, [sessionId, mentorId, menteeId], function(err) {
      if (err) {
        console.error('Error inserting matching pair:', err);
        return res.status(500).json({ error: err.message });
      }

      // 3. Respond with new record details
      res.json({
        id: this.lastID,
        sessionId,
        mentorId,
        menteeId,
        createdAt: new Date().toISOString()
      });
    });
  });
});

module.exports = router;
// server/routes/matching-pairs.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // adjust this path to your DB instance


router.post('/matching-pairs', (req, res) => {
  const { sessionId, mentorId, menteeId } = req.body;
  

  if (!sessionId || !mentorId || !menteeId) {
    return res.status(400).json({
      success: false,
      message: 'Missing sessionId, mentorId or menteeId',
    });
  }
  

    const insertSql = `
      INSERT INTO matching_pairs (session_id, mentor_id, mentee_id)
      VALUES (?, ?, ?)
    `;
    db.run(insertSql, [sessionId, mentorId, menteeId], function(err) {
      if (err) {
        console.error('Error inserting matching pair:', err);
        return res.status(500).json({ error: err.message });
      }

      console.log('Inserted matching pair:', {
        sessionId,
        mentorId,
        menteeId,
      });
      // this.lastID is the new row id, or undefined if skipped
      res.json({
        success: true,
        pairId: this.lastID || null,
        body: req.body,
        message: this.lastID
          ? 'Matching pair created'
          : 'Matching pair already exists',
      });
    });
  }
);


module.exports = router;
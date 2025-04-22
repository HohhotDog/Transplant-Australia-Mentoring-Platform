// routes/sessions.js
const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middlewares/auth');
const db = require('../db'); // sqlite3.Database instance

// Create applications table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'approved')),
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
  );
`);

/**
 * GET /api/my-sessions
 * Returns all sessions the current user has applied to, with status
 */
router.get('/my-sessions', ensureAuthenticated, (req, res) => {
  const userId = req.user.id;
  const sql = `
    SELECT s.id,
           s.name        AS title,
           s.picture_url AS image,
           s.description,
           s.start_date  AS startDate,
           s.end_date    AS endDate,
           a.status      
    FROM applications a
    JOIN sessions s ON s.id = a.session_id
    WHERE a.user_id = ?
  `;
  db.all(sql, [userId], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(rows);
  });
});
/**
 * GET /api/sessions
 * Returns all available sessions
 */
router.get('/sessions', (req, res) => {
    const sql = `
        SELECT id,
             name        AS title,
             picture_url AS image,
             description,
             start_date  AS startDate,
             end_date    AS endDate
        FROM sessions
        WHERE status = 'available'
    `;
    db.all(sql, [], (err, rows) => {
        if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json(rows);
    });
});


/**
 * GET /api/sessions/:id
 * Returns details for a single session
 */
router.get('/sessions/:id', ensureAuthenticated, (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT id,
           name        AS title,
           picture_url AS image,
           description,
           start_date  AS startDate,
           end_date    AS endDate
    FROM sessions
    WHERE id = ?
  `;
  db.get(sql, [id], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json(row);
  });
});

/**
 * POST /api/sessions/:id/apply
 * Create a new application for the session
 */
router.post('/sessions/:id/apply', ensureAuthenticated, (req, res) => {
  const userId = req.user.id;
  const sessionId = req.params.id;

  // Check if already applied
  const checkSql = `
    SELECT id FROM applications
    WHERE user_id = ? AND session_id = ?
  `;
  db.get(checkSql, [userId, sessionId], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (row) {
      return res.status(409).json({ error: 'Already applied' });
    }
    // Insert new application
    const insertSql = `
      INSERT INTO applications (user_id, session_id, status)
      VALUES (?, ?, 'in_progress')
    `;
    db.run(insertSql, [userId, sessionId], function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.status(201).json({ message: 'Applied successfully', sessionId, status: 'in_progress' });
    });
  });
});

/**
 * DELETE /api/sessions/:id/apply
 * Cancel the user's application
 */
router.delete('/sessions/:id/apply', ensureAuthenticated, (req, res) => {
  const userId = req.user.id;
  const sessionId = req.params.id;

  const deleteSql = `
    DELETE FROM applications
    WHERE user_id = ? AND session_id = ?
  `;
  db.run(deleteSql, [userId, sessionId], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Not applied or not found' });
    }
    res.sendStatus(204);
  });
});

module.exports = router;

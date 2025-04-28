// routes/admin.js
const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * GET /api/admin/sessions
 * Return all sessions with:
 *  - start/end dates
 *  - approved mentors & mentees count
 *  - pending application count
 *  - hardcoded creator name
 */
router.get('/sessions', (req, res) => {
  const sql = `
    SELECT
      s.id,
      s.name                                                 AS title,
      s.start_date                                           AS startDate,
      s.end_date                                             AS endDate,
      s.status                                               AS status,
      'Default Admin'                                        AS creator,
      SUM(CASE WHEN a.role = 'mentor' AND a.status = 'approved' THEN 1 ELSE 0 END) AS mentorsCount,
      SUM(CASE WHEN a.role = 'mentee' AND a.status = 'approved' THEN 1 ELSE 0 END) AS menteesCount,
      SUM(CASE WHEN a.status = 'pending' THEN 1 ELSE 0 END)                         AS pendingCount
    FROM sessions s
    LEFT JOIN applications a ON a.session_id = s.id
    GROUP BY s.id, s.name, s.start_date, s.end_date, s.status
    ORDER BY s.start_date DESC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const result = rows.map(r => ({
      id:                 r.id,
      title:              r.title,
      timeFrame:          `${r.startDate} – ${r.endDate}`,
      participants:       `${r.mentorsCount} mentors, ${r.menteesCount} mentees`,
      pendingApplications: r.pendingCount,
      status:             r.status,
      creator:            r.creator
    }));

    res.json(result);
  });
});



/**
 * GET /api/admin/sessions/:id/applications
 * Return all applications (role, email, date, status) for a given session
 */
router.get('/sessions/:id/applications', (req, res) => {
    const sessionId = req.params.id;
    const sql = `
      SELECT
        a.id,
        u.email                         AS email,
        a.role                          AS role,
        a.application_date              AS applicationDate,
        a.status
      FROM applications a
      JOIN users u    ON u.id = a.user_id
      WHERE a.session_id = ?
      ORDER BY a.application_date DESC
    `;
    db.all(sql, [sessionId], (err, rows) => {
      if (err) {
        console.error('Failed to load applications:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.json(rows);
    });
  });

  
module.exports = router;

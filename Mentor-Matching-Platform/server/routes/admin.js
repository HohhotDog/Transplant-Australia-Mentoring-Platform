const express = require('express');
const router = express.Router();
const db = require('../db');
const { ensureAdmin } = require('../middlewares/auth'); // Middleware to restrict access to admins only

/**
 * GET /api/admin/sessions
 * Returns all sessions with:
 *  - start and end dates
 *  - number of approved mentors and mentees
 *  - number of pending applications
 *  - hardcoded creator name
 */
router.get('/sessions', ensureAdmin, (req, res) => {
    const sql = `
        SELECT
            s.id,
            s.name AS title,
            s.start_date AS startDate,
            s.end_date AS endDate,
            s.status AS status,
            'Default Admin' AS creator,
            SUM(CASE WHEN a.role = 'mentor' AND a.status = 'approved' THEN 1 ELSE 0 END) AS mentorsCount,
            SUM(CASE WHEN a.role = 'mentee' AND a.status = 'approved' THEN 1 ELSE 0 END) AS menteesCount,
            SUM(CASE WHEN a.status = 'pending' THEN 1 ELSE 0 END) AS pendingCount
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
            id: r.id,
            title: r.title,
            timeFrame: `${r.startDate} – ${r.endDate}`,
            participants: `${r.mentorsCount} mentors, ${r.menteesCount} mentees`,
            pendingApplications: r.pendingCount,
            status: r.status,
            creator: r.creator
        }));

        res.json(result);
    });
});

/**
 * GET /api/admin/sessions/:id/applications
 * Returns all applications for a given session:
 *  - role (mentor/mentee)
 *  - email
 *  - application date
 *  - application status
 */
router.get('/sessions/:id/applications', ensureAdmin, (req, res) => {
    const sessionId = req.params.id;
    const sql = `
        SELECT
            a.id,
            u.email AS email,
            a.role AS role,
            a.application_date AS applicationDate,
            a.status
        FROM applications a
                 JOIN users u ON u.id = a.user_id
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

/**
 * GET /api/admin/sessions/:sessionId/applications/:id
 * Returns a single application based on session and application ID
 */
router.get('/sessions/:sessionId/applications/:id', ensureAdmin, (req, res) => {
    const { sessionId, id } = req.params;
    const sql = `
        SELECT
            a.id,
            u.email AS email,
            a.role,
            a.application_date AS applicationDate,
            a.status
        FROM applications a
                 JOIN users u ON u.id = a.user_id
        WHERE a.session_id = ? AND a.id = ?
    `;
    db.get(sql, [sessionId, id], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (!row) return res.status(404).json({ error: 'Application not found' });
        res.json(row);
    });
});

/**
 * PATCH /api/admin/sessions/:sessionId/applications/:id
 * Updates the application status (to 'approved', 'onhold', or 'pending')
 */
router.patch('/sessions/:sessionId/applications/:id', ensureAdmin, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['approved', 'onhold', 'pending'];

    if (!allowed.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    const sql = `
        UPDATE applications
        SET status = ?
        WHERE id = ?
    `;
    db.run(sql, [status, id], function (err) {
        if (err) {
            console.error('Failed to update status:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }
        res.json({ message: 'Status updated', status });
    });
});

module.exports = router;

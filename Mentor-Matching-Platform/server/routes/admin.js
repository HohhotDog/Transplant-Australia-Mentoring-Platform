// routes/admin.js
const express = require("express");
const router = express.Router();
const db = require("../db");

/**
 * GET /api/admin/sessions
 * Return all sessions with:
 *  - start/end dates
 *  - approved mentors & mentees count
 *  - pending application count
 *  - hardcoded creator name
 */
router.get("/sessions", (req, res) => {
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
      return res.status(500).json({ error: "Internal Server Error" });
    }

    const result = rows.map((r) => ({
      id: r.id,
      title: r.title,
      timeFrame: `${r.startDate} – ${r.endDate}`,
      participants: `${r.mentorsCount} mentors, ${r.menteesCount} mentees`,
      pendingApplications: r.pendingCount,
      status: r.status,
      creator: r.creator,
    }));

    res.json(result);
  });
});

/**
 * GET /api/admin/sessions/:id/applications
 * Return all applications (role, email, date, status) for a given session
 */
router.get("/sessions/:id/applications", (req, res) => {
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
      console.error("Failed to load applications:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(rows);
  });
});

/**
 * GET /api/admin/sessions/:sessionId/applications/:id
 * Fetch single application by ID and session
 */
router.get("/sessions/:sessionId/applications/:id", (req, res) => {
  const { sessionId, id } = req.params;
  const sql = `
      SELECT
        a.id,
        u.email                         AS email,
        a.role,
        a.application_date              AS applicationDate,
        a.status
      FROM applications a
      JOIN users u ON u.id = a.user_id
      WHERE a.session_id = ? AND a.id = ?
    `;
  db.get(sql, [sessionId, id], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (!row) return res.status(404).json({ error: "Application not found" });
    res.json(row);
  });
});

/**
 * PATCH /api/admin/applications/:id
 * Update application status to 'approved' or 'onhold'
 */
router.patch("/sessions/:sessionId/applications/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const allowed = ["approved", "onhold", "pending"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const sql = `
      UPDATE applications
      SET status = ?
      WHERE id = ?
    `;
  db.run(sql, [status, id], function (err) {
    if (err) {
      console.error("Failed to update status:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Application not found" });
    }
    res.json({ message: "Status updated", status });
  });
});


/**
 * GET /api/admin/sessions/:sessionId/participants/mentors
 * get approved mentor list and the number of assigned mentees
 */
router.get("/sessions/:sessionId/participants/mentors", (req, res) => {
  const { sessionId } = req.params;
  const sql = `
    SELECT
      p.user_id AS id,
      u.email,
      pr.first_name || ' ' || pr.last_name AS name,
      COUNT(mp.mentee_id) AS assigned_mentees,
      a.application_date AS join_date
    FROM participants p
    JOIN applications a ON p.application_id = a.id
    JOIN users u ON p.user_id = u.id
    LEFT JOIN profiles pr ON u.id = pr.user_id
    LEFT JOIN matching_pairs mp ON p.user_id = mp.mentor_id AND p.session_id = mp.session_id
    WHERE p.session_id = ? AND a.role = 'mentor' AND a.status = 'approved'
    GROUP BY p.user_id
    ORDER BY a.application_date DESC
  `;

  db.all(sql, [sessionId], (err, rows) => {
    if (err) return handleError(res, err);
    res.json(
      rows.map((r) => ({
        ...r,
        assigned_mentees: r.assigned_mentees || 0,
      }))
    );
  });
});

/**
 * GET /api/admin/sessions/:sessionId/participants/mentees
 * get mentees list and matching info
 */
router.get("/sessions/:sessionId/participants/mentees", (req, res) => {
  const { sessionId } = req.params;
  const sql = `
    SELECT
      p.user_id AS id,
      u.email,
      pr.first_name || ' ' || pr.last_name AS name,
      mp.created_at AS matched_date,
      mentor_pr.first_name || ' ' || mentor_pr.last_name AS assigned_mentor,
      a.application_date
    FROM participants p
    JOIN applications a ON p.application_id = a.id
    JOIN users u ON p.user_id = u.id
    LEFT JOIN profiles pr ON u.id = pr.user_id
    LEFT JOIN matching_pairs mp ON p.user_id = mp.mentee_id AND p.session_id = mp.session_id
    LEFT JOIN users mentor_u ON mp.mentor_id = mentor_u.id
    LEFT JOIN profiles mentor_pr ON mentor_u.id = mentor_pr.user_id
    WHERE p.session_id = ? AND a.role = 'mentee' AND a.status = 'approved'
    GROUP BY p.user_id
    ORDER BY a.application_date DESC
  `;

  db.all(sql, [sessionId], (err, rows) => {
    if (err) return handleError(res, err);
    res.json(
      rows.map((r) => ({
        ...r,
        assigned_mentor: r.assigned_mentor || "Not assigned",
      }))
    );
  });
});

module.exports = router;

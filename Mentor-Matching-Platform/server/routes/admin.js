const express = require("express");
const router = express.Router();
const db = require("../db");
const { ensureAdmin } = require("../middlewares/auth"); // Middleware to restrict access to admins only

/**
 * GET /api/admin/sessions
 * Returns all sessions with:
 *  - start and end dates
 *  - number of approved mentors and mentees
 *  - number of pending applications
 *  - hardcoded creator name
 */
router.get("/sessions", ensureAdmin, (req, res) => {
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
 * Returns all applications for a given session:
 *  - role (mentor/mentee)
 *  - email
 *  - application date
 *  - application status
 */
router.get("/sessions/:id/applications", ensureAdmin, (req, res) => {
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
      console.error("Failed to load applications:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(rows);
  });
});

/**
 * GET /api/admin/sessions/:sessionId/applications/:id
 * Returns a single application based on session and application ID
 */
router.get("/sessions/:sessionId/applications/:id", ensureAdmin, (req, res) => {
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
      return res.status(500).json({ error: "Internal Server Error" });
    }
    if (!row) return res.status(404).json({ error: "Application not found" });
    res.json(row);
  });
});

/**
 * PATCH /api/admin/sessions/:sessionId/applications/:id
 * Updates the application status (to 'approved', 'onhold', or 'pending')
 */
router.patch(
  "/sessions/:sessionId/applications/:id",
  ensureAdmin,
  (req, res) => {
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
  }
);


/**
 * GET /api/admin/sessions/:sessionId/participants
 * Returns both mentors and mentees for a session
 */
router.get("/sessions/:sessionId/participants", (req, res) => {
  const { sessionId } = req.params;

  // SQL query for mentors
  const mentorsSql = `
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

  // SQL query for mentees
  const menteesSql = `
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

  // Execute both queries
  db.all(mentorsSql, [sessionId], (err, mentors) => {
    if (err) return res.status(500).json({ error: "Failed to fetch mentors" });

    db.all(menteesSql, [sessionId], (err, mentees) => {
      if (err) return res.status(500).json({ error: "Failed to fetch mentees" });

      // Combine results and send response
      res.json({
        mentors: mentors.map((r) => ({
          ...r,
          assigned_mentees: r.assigned_mentees || 0,
        })),
        mentees: mentees.map((r) => ({
          ...r,
          assigned_mentor: r.assigned_mentor || "Not assigned",
        })),
      });
    });
  });
});

/**
 * GET /api/admin/participants/:userId/profile
 * Fetch the profile of a specific user by their userId
 */
router.get("/participants/:userId/profile", ensureAdmin, (req, res) => {
    const { userId } = req.params;

    const query = `
        SELECT
            u.email,
            p.*
        FROM users u
        LEFT JOIN profiles p ON u.id = p.user_id
        WHERE u.id = ?
    `;

    db.get(query, [userId], (err, row) => {
        if (err) {
            console.error("DB error:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }
        if (!row) {
            return res.status(404).json({
                success: false,
                message: "Profile not found."
            });
        }
        return res.json({ success: true, profile: row });
    });
});

/**
 * GET /api/admin/participants/:userId/preferences
 * Fetch mentorship preferences for a specific user by their userId
 */
router.get("/participants/:userId/preferences", ensureAdmin, async (req, res) => {
    const { userId } = req.params;

    try {
        const preferences = await db.getAsync(`
            SELECT * FROM mentorship_preferences WHERE user_id = ?
        `, [userId]);

        if (!preferences) {
            return res.status(404).json({ success: false, message: "Preferences not found" });
        }

        res.json({ success: true, preferences });
    } catch (err) {
        console.error("Error fetching preferences:", err.message);
        res.status(500).json({ success: false, error: "Failed to fetch preferences" });
    }
});

/**
 * GET /api/admin/participants/:userId/match
 * Fetch assigned mentor or mentee for a specific user by their userId
 */
router.get("/participants/:userId/match", ensureAdmin, async (req, res) => {
    const { userId } = req.params;

    try {
        // Check if the user is a mentor
        const mentorMatch = await db.allAsync(`
            SELECT 
                mp.mentee_id AS user_id,
                mentee_pr.first_name || ' ' || mentee_pr.last_name AS name
            FROM matching_pairs mp
            LEFT JOIN profiles mentee_pr ON mp.mentee_id = mentee_pr.user_id
            WHERE mp.mentor_id = ?
        `, [userId]);

        // Check if the user is a mentee
        const menteeMatch = await db.getAsync(`
            SELECT 
                mp.mentor_id AS user_id,
                mentor_pr.first_name || ' ' || mentor_pr.last_name AS name
            FROM matching_pairs mp
            LEFT JOIN profiles mentor_pr ON mp.mentor_id = mentor_pr.user_id
            WHERE mp.mentee_id = ?
        `, [userId]);

        if (mentorMatch.length > 0) {
            // User is a mentor, return their mentees
            return res.json({ success: true, role: "mentor", mentees: mentorMatch });
        } else if (menteeMatch) {
            // User is a mentee, return their mentor
            return res.json({ success: true, role: "mentee", mentor: menteeMatch });
        } else {
            return res.status(404).json({ success: false, message: "No match found" });
        }
    } catch (err) {
        console.error("Error fetching match:", err.message);
        res.status(500).json({ success: false, error: "Failed to fetch match" });
    }
});

module.exports = router;


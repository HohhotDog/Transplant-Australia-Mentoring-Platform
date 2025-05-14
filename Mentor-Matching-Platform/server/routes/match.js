const express = require("express");
const router = express.Router();

const getTopMentorMatchesForMentee = require("../utils/matchAlgorithm");

router.get("", async (req, res) => {
  const menteeId  = req.query.menteeId;
  const sessionId = req.query.sessionId; 

  // print the menteeId and sessionId/match-mentee for debugging
  console.log("Mentee ID:", menteeId);
  console.log("Session ID:", sessionId);
  // Check if menteeId and sessionId are provided



  if (!userId || !sessionId) {
    return res.status(400).json({ success: false, message: "Missing user or sessionId" });
  }

  try {
    const matches = await getTopMentorMatchesForMentee(menteeId, sessionId);
    res.json({ success: true, matches });
  } catch (error) {
    console.error("Matching error:", error);
    res.status(500).json({ success: false, error: "Matching failed." });
  }
});







// get match pairing for the current user in a session

const db = require('../db');               // SQLite database connection
const { ensureAuthenticated } = require('../middlewares/auth');

/**
 * GET /api/sessions/:sessionId/matches
 * Returns the match pairing for the currently logged-in user in a given session.
 * Response: []
 *   – empty array if no pairing exists
 *   – otherwise an array with one object:
 *     {
 *       pairId: number,
 *       sessionId: number,
 *       role: 'mentor' | 'mentee',
 *       other: { id: number, email: string },
 *       createdAt: timestamp
 *     }
 */
router.get(
  '/sessions/:sessionId/matches',
  ensureAuthenticated,
  (req, res) => {
    const userId = req.user.id;
    const sessionId = Number(req.params.sessionId);

    // Find the matching record where the current user is mentor or mentee
    const findPairsSql = `
      SELECT *
      FROM matching_pairs
      WHERE session_id = ?
        AND (mentor_id = ? OR mentee_id = ?)
        AND mentor_id IS NOT NULL
        AND mentee_id IS NOT NULL
    `;

    db.all(findPairsSql, [sessionId, userId, userId], (err, pairs) => {
      if (err) {
        console.error("Database error fetching pairs:", err);
        return res.status(500).json({ error: "Database error" });
      }
      console.log("Pairs found:", pairs);
      if (!pairs || pairs.length === 0) {
        return res.json([]);
      }

      // For each pair, fetch the "other" user's info
      const otherFetches = pairs.map(pair => {
        const otherId = pair.mentor_id === userId
          ? pair.mentee_id
          : pair.mentor_id;
        return new Promise((resolve, reject) => {
          db.get(
            `SELECT id, email FROM users WHERE id = ?`,
            [otherId],
            (err, other) => {
              if (err) return reject(err);
              if (!other) return resolve(null);
              resolve({
                pairId: pair.id,
                sessionId: pair.session_id,
                role: pair.mentor_id === userId ? "mentor" : "mentee",
                other,
                createdAt: pair.created_at
              });
            }
          );
        });
      });

      Promise.all(otherFetches)
        .then(results => {
          const filtered = results.filter(Boolean);
          res.json(filtered);
        })
        .catch(err => {
          console.error("Error fetching paired users:", err);
          res.status(500).json({ error: "Database error" });
        });
    });
  }
);

module.exports = router;
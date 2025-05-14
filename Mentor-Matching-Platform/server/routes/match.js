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
    const findPairSql = `
      SELECT *
      FROM matching_pairs
      WHERE session_id = ?
        AND (mentor_id = ? OR mentee_id = ?)
      LIMIT 1
    `;

    db.get(findPairSql, [sessionId, userId, userId], (err, pair) => {
      if (err) {
        console.error('Database error fetching pair:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (!pair) {
        // No match found
        return res.json([]);
      }

      // Identify the “other” user in the pair
      const otherId = pair.mentor_id === userId
        ? pair.mentee_id
        : pair.mentor_id;

      // Fetch the other user’s basic info
      const findUserSql = `
        SELECT id, email
        FROM users
        WHERE id = ?
      `;
      db.get(findUserSql, [otherId], (err, other) => {
        if (err) {
          console.error('Database error fetching matched user:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        if (!other) {
          return res.status(404).json({ error: 'Matched user not found' });
        }

        // Return the pairing and other user’s info
        res.json([{
          pairId: pair.id,
          sessionId: pair.session_id,
          role: pair.mentor_id === userId ? 'mentor' : 'mentee',
          other: {
            id: other.id,
            email: other.email
          },
          createdAt: pair.created_at
        }]);
      });
    });
  }
);




module.exports = router;

const express = require("express");
const router = express.Router();
const db = require("../db");

// Save mentorship preferences
router.post("/save-preferences", (req, res) => {
  const { userId, role, transplantType, transplantYear, goals, meetingPref, sportsInterest } = req.body;
  db.run(`
    INSERT OR REPLACE INTO mentorship_preferences 
    (user_id, role, transplant_type, transplant_year, goals, meeting_preference, sports_activities)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, role, transplantType, transplantYear, JSON.stringify(goals), meetingPref, JSON.stringify(sportsInterest)],
    function (err) {
      if (err) return res.status(500).json({ success: false, error: err.message });
      res.json({ success: true });
    }
  );
});

// Save lifestyle answers
router.post("/save-lifestyle", (req, res) => {
  const { userId, answers } = req.body;
  const values = [userId, ...Array.from({ length: 8 }, (_, i) => answers[`q${i + 1}`])];
  db.run(`
    INSERT OR REPLACE INTO lifestyle_answers 
    (user_id, q1, q2, q3, q4, q5, q6, q7, q8) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    values,
    function (err) {
      if (err) return res.status(500).json({ success: false, error: err.message });
      res.json({ success: true });
    }
  );
});

// Save Enneagram
router.post("/save-enneagram", (req, res) => {
  const { userId, topTypes, allScores } = req.body;
  db.run(`
    INSERT OR REPLACE INTO enneagram_answers (user_id, top_type, scores)
    VALUES (?, ?, ?)`,
    [userId, JSON.stringify(topTypes), JSON.stringify(allScores)],
    function (err) {
      if (err) return res.status(500).json({ success: false, error: err.message });
      res.json({ success: true });
    }
  );
});

module.exports = router;
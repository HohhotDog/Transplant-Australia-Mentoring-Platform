// routes/match.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const { isAuthenticated } = require("../middleware/auth");

const compatibilityMap = {
  1: [9, 7],
  2: [4, 8],
  3: [2, 4],
  4: [1, 2],
  5: [9, 7],
  6: [1, 2],
  7: [1, 5],
  8: [2, 9],
  9: [3, 6],
};

router.get("/by-enneagram", isAuthenticated, (req, res) => {
  const userId = req.session.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  db.get(`SELECT enneagramType, role FROM users WHERE id = ?`, [userId], (err, user) => {
    if (err || !user) {
      return res.status(500).json({ success: false, message: "DB error or user not found" });
    }

    if (user.role !== "mentee") {
      return res.status(403).json({ success: false, message: "Only mentees can find matches" });
    }

    const compatibleTypes = compatibilityMap[user.enneagramType] || [];

    db.all(
      `SELECT id, username, enneagramType FROM users 
       WHERE role = 'mentor' AND enneagramType IN (${compatibleTypes.join(",")})`,
      [],
      (err, mentors) => {
        if (err) return res.status(500).json({ success: false, message: "DB error" });

        res.json({
          success: true,
          yourType: user.enneagramType,
          matches: mentors.slice(0, 3), // top 3
        });
      }
    );
  });
});

module.exports = router;

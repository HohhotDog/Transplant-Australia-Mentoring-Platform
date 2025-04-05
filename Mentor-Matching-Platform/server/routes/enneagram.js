const express = require("express");
const router = express.Router();
const db = require("../db");
const { isAuthenticated } = require("../middleware/auth");


router.post("/submit", isAuthenticated, (req, res) => {
  const userId = req.session.user?.id;
  const { answers } = req.body;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized: user not logged in" });
  }

  if (!Array.isArray(answers) || answers.length !== 9) {
    return res.status(400).json({ success: false, message: "Invalid answers submitted" });
  }

  // Create scores per type
  const scores = {};
  const typeMap = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  typeMap.forEach((type, i) => {
    const answer = parseInt(answers[i]);
    if (!scores[type]) scores[type] = 0;
    scores[type] += answer;
  });

  // Get top scoring type
  const topType = Object.entries(scores).reduce(
    (max, curr) => (curr[1] > max[1] ? curr : max),
    [null, -Infinity]
  )[0];

  db.run(
    `UPDATE users SET enneagramType = ? WHERE id = ?`,
    [topType, userId],
    function (err) {
      if (err) {
        console.error("❌ DB error:", err.message);
        return res.status(500).json({ success: false, message: "Failed to save Enneagram type" });
      }

      console.log(`✅ Enneagram type ${topType} saved for user ${userId}`);
      res.json({ success: true, enneagramType: topType });
    }
  );
});

module.exports = router;

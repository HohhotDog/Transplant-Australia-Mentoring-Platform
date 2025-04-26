const express = require("express");
const router = express.Router();
const db = require("../db");
const matchMentorsForMentee = require("../utils/matchAlgorithm");

// Middleware: Check if user is logged in
function isAuthenticated(req, res, next) {
  if (req.session?.user?.id) return next();
  return res.status(401).json({ success: false, message: "Unauthorized" });
}

// Save mentorship preferences
router.post("/save-preferences", isAuthenticated, (req, res) => {
  const userId = req.session.user.id;
  const { role, transplantType, transplantYear, goals, meetingPref, sportsInterest } = req.body;

  console.log("🔸 /save-preferences hit", { userId, role, transplantType, transplantYear });

  db.run(`
    INSERT OR REPLACE INTO mentorship_preferences 
    (user_id, role, transplant_type, transplant_year, goals, meeting_preference, sports_activities)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      role,
      JSON.stringify(transplantType), 
      transplantYear,
      JSON.stringify(goals),
      meetingPref,
      JSON.stringify(sportsInterest)
    ],
    function (err) {
      if (err) {
        console.error("❌ Error saving preferences:", err.message);
        return res.status(500).json({ success: false, error: err.message });
      }
      console.log("✅ Preferences saved for user:", userId);
      res.json({ success: true });
    }
  );
});

// Save lifestyle answers
router.post("/save-lifestyle", isAuthenticated, (req, res) => {
  const userId = req.session.user.id;
  const { answers } = req.body;

  console.log("🔸 /save-lifestyle hit", { userId, answers });

  const values = [
    userId,
    answers.physicalExerciseFrequency,
    answers.likeAnimals,
    answers.likeCooking,
    answers.travelImportance,
    answers.freeTimePreference,
    answers.feelOverwhelmed,
    answers.activityBarriers,
    answers.longTermGoals,
    answers.stressHandling,
    answers.motivationLevel,
    answers.hadMentor
  ];

  db.run(`
    INSERT OR REPLACE INTO lifestyle_answers (
      user_id,
      physicalExerciseFrequency,
      likeAnimals,
      likeCooking,
      travelImportance,
      freeTimePreference,
      feelOverwhelmed,
      activityBarriers,
      longTermGoals,
      stressHandling,
      motivationLevel,
      hadMentor
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    values,
    function (err) {
      if (err) {
        console.error("❌ Error saving lifestyle answers:", err.message);
        return res.status(500).json({ success: false, error: err.message });
      }
      console.log("✅ Lifestyle answers saved for user:", userId);
      res.json({ success: true });
    }
  );
});

// Save Enneagram
router.post("/save-enneagram", isAuthenticated, (req, res) => {
  const userId = req.session.user.id;
  const { topTypes, allScores } = req.body;

  console.log("🔸 /save-enneagram hit", { userId, topTypes });

  db.run(`
    INSERT OR REPLACE INTO enneagram_answers (user_id, top_type, scores)
    VALUES (?, ?, ?)`,
    [userId, JSON.stringify(topTypes), JSON.stringify(allScores)],
    function (err) {
      if (err) {
        console.error("❌ Error saving enneagram:", err.message);
        return res.status(500).json({ success: false, error: err.message });
      }
      console.log("✅ Enneagram saved for user:", userId);
      res.json({ success: true });
    }
  );
});

// Get top mentor matches for current mentee (combined name format)
router.get("/match-mentee", isAuthenticated, async (req, res) => {
  try {
    const menteeId = req.session.user.id;
    const matches = await matchMentorsForMentee(menteeId);

    const formatted = matches.map(m => ({
      mentor_id: m.mentor_id,
      name: `${m.first_name} ${m.last_name}`,
      email: m.email,
      finalScore: m.finalScore
    }));

    res.json({ success: true, recommendations: formatted });
  } catch (err) {
    console.error("❌ Match error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/mark-submitted
router.post("/mark-submitted", isAuthenticated, (req, res) => {
  const userId = req.session.user.id;

  db.run(`UPDATE mentorship_preferences SET submitted = 1 WHERE user_id = ?`, [userId], function (err) {
    if (err) {
      console.error("❌ Failed to mark as submitted:", err.message);
      return res.status(500).json({ success: false });
    }
    console.log(`✅ Form marked as submitted for user ${userId}`);
    res.json({ success: true });
  });
});

// Check if form is submitted
router.get("/form-status", isAuthenticated, (req, res) => {
  const userId = req.session.user.id;

  db.get(`SELECT submitted FROM mentorship_preferences WHERE user_id = ?`, [userId], (err, row) => {
    if (err) {
      console.error("❌ Failed to check form status:", err.message);
      return res.status(500).json({ success: false });
    }
    if (!row) {
      return res.json({ success: true, submitted: false });
    }
    res.json({ success: true, submitted: row.submitted === 1 });
  });
});





module.exports = router;

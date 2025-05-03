const express = require("express");
const router = express.Router();
const db = require("../db");
const matchMentorsForMentee = require("../utils/matchAlgorithm");

// Middleware: Check if user is logged in
function isAuthenticated(req, res, next) {
  if (req.session?.user?.id) return next();
  return res.status(401).json({ success: false, message: "Unauthorized" });
}

/// Save mentorship preferences 
router.post("/save-preferences", isAuthenticated, async (req, res) => {
  const userId = req.session.user.id;
  const { sessionId, role, transplantType, transplantYear, goals, meetingPref, sportsInterest } = req.body;

  if (!sessionId || !role) {
    return res.status(400).json({ success: false, error: 'Missing sessionId or role' });
  }

  // 🔄 Ensure application exists
  await db.ensureApplicationExists(userId, sessionId, role);
  const applicationId = await db.getApplicationIdForUser(userId);

  console.log("🔸 /save-preferences hit", { userId, applicationId, role, transplantType, transplantYear });

  db.run(
    `
    INSERT OR REPLACE INTO mentorship_preferences 
    (application_id, user_id, role, transplant_type, transplant_year, goals, meeting_preference, sports_activities)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      applicationId,
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
      console.log("✅ Preferences saved for application:", applicationId);
      res.json({ success: true });
    }
  );
});

// Save lifestyle answers
router.post("/save-lifestyle", isAuthenticated, async (req, res) => {
  const userId = req.session.user.id;
  const { sessionId, answers } = req.body;

  if (!sessionId || !answers) {
    return res.status(400).json({ success: false, error: 'Missing sessionId or answers' });
  }

  await db.ensureApplicationExists(userId, sessionId);
  const applicationId = await db.getApplicationIdForUser(userId);

  console.log("🔸 /save-lifestyle hit", { userId, applicationId, answers });

  const values = [
    applicationId,
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
      application_id,
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
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, values,
    function (err) {
      if (err) {
        console.error("❌ Error saving lifestyle answers:", err.message);
        return res.status(500).json({ success: false, error: err.message });
      }
      console.log("✅ Lifestyle answers saved for application:", applicationId);
      res.json({ success: true });
    }
  );
});

// Save Enneagram answers
router.post("/save-enneagram", isAuthenticated, async (req, res) => {
  const userId = req.session.user.id;
  const applicationId = await db.getApplicationIdForUser(userId);
  const { topTypes, allScores } = req.body;

  console.log("🔸 /save-enneagram hit", { userId, applicationId, topTypes });

  db.run(`
    INSERT OR REPLACE INTO enneagram_answers (
      application_id, user_id, top_type, scores
    ) VALUES (?, ?, ?, ?)`,
    [applicationId, userId, JSON.stringify(topTypes), JSON.stringify(allScores)],
    function (err) {
      if (err) {
        console.error("❌ Error saving enneagram:", err.message);
        return res.status(500).json({ success: false, error: err.message });
      }
      console.log("✅ Enneagram saved for application:", applicationId);
      res.json({ success: true });
    }
  );
});

// Get top mentor matches for current mentee
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

// Mark form as submitted
router.post("/mark-submitted", isAuthenticated, async (req, res) => {
  const userId = req.session.user.id;
  const applicationId = await db.getApplicationIdForUser(userId);

  db.run(`UPDATE mentorship_preferences SET submitted = 1 WHERE application_id = ?`, [applicationId], function (err) {
    if (err) {
      console.error("❌ Failed to mark as submitted:", err.message);
      return res.status(500).json({ success: false });
    }
    console.log(`✅ Form marked as submitted for application ${applicationId}`);
    res.json({ success: true });
  });
});

// Check if form is submitted
router.get("/form-status", isAuthenticated, async (req, res) => {
  const userId = req.session.user.id;
  const applicationId = await db.getApplicationIdForUser(userId);

  db.get(`SELECT submitted FROM mentorship_preferences WHERE application_id = ?`, [applicationId], (err, row) => {
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

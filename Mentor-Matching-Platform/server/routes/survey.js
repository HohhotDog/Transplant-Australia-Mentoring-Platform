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
router.post("/save-preferences", isAuthenticated, async (req, res) => {
  const userId = req.session.user.id;
  const { sessionId, role, session_role, transplantType, transplantYear, goals, meetingPref, sportsInterest } = req.body;

  if (!sessionId || !role) {
    return res.status(400).json({ success: false, error: 'Missing sessionId or role' });
  }
  console.log("🟡 Incoming /save-preferences payload:", req.body);
  // 🔄 Ensure application exists
  await db.ensureApplicationExists(userId, sessionId, role);
  const applicationId = await db.getApplicationIdForUser(userId, sessionId);

  console.log("🔸 /save-preferences hit", { userId, applicationId, role, transplantType, transplantYear });

  db.run(
    `
    INSERT OR REPLACE INTO mentorship_preferences 
    (application_id, user_id, role, session_role, transplant_type, transplant_year, goals, meeting_preference, sports_activities)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      applicationId,
      userId,
      role,
      session_role,
      JSON.stringify(transplantType),
      transplantYear,
      JSON.stringify(goals),
      meetingPref,
      JSON.stringify(sportsInterest),
      
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
  const { sessionId, answers, role } = req.body;

  // 🔍 Basic input validation
  if (!sessionId || !answers || !role) {
    return res.status(400).json({ success: false, error: 'Missing sessionId, role, or answers' });
  }

  // ✅ Ensure application exists with session and role
  await db.ensureApplicationExists(userId, sessionId, role);
  const applicationId = await db.getApplicationIdForUser(userId, sessionId);

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
  const { sessionId, role, topTypes, allScores, answers } = req.body;  


  if (!sessionId || !role || !topTypes || !allScores) {
    return res.status(400).json({ success: false, error: 'Missing sessionId, role, or Enneagram data' });
  }

  await db.ensureApplicationExists(userId, sessionId, role);
  const applicationId = await db.getApplicationIdForUser(userId, sessionId);

  console.log("🔸 /save-enneagram hit", { userId, applicationId, topTypes, answers });

  db.run(`
    INSERT OR REPLACE INTO enneagram_answers (
      application_id, user_id, top_type, scores, answers
    ) VALUES (?, ?, ?, ?, ?)
  `,
    [
      applicationId,
      userId,
      JSON.stringify(topTypes),
      JSON.stringify(allScores),
      JSON.stringify(answers),  
    ],
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

router.get("/match-mentee", isAuthenticated, async (req, res) => {
  try {
    const menteeId = req.query.menteeId;
    const sessionId = req.query.sessionId; 
    // print the menteeId and sessionId for debugging
    console.log("Mentee ID:", menteeId);
    console.log("Session ID:", sessionId);

    if (!sessionId) {
      return res.status(400).json({ success: false, message: "Missing sessionId" });
    }

    console.log("✅ Incoming match request:", { menteeId, sessionId });
    const matches = await matchMentorsForMentee(menteeId, sessionId); 

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



router.post("/mark-submitted", isAuthenticated, async (req, res) => {
  const userId = req.session.user.id;
  const { sessionId } = req.body;
if (!sessionId) {
  return res.status(400).json({ success: false, message: "Missing sessionId" });
}


  try {
    const row = await db.get(
      `SELECT id FROM applications WHERE user_id = ? AND session_id = ?`,
      [userId, sessionId]
    );

    if (!row) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    await db.run(
      `UPDATE mentorship_preferences SET submitted = 1 WHERE application_id = ?`,
      [row.id]
    );

    return res.json({ success: true });
  } catch (err) {
    console.error("❌ Error marking submission:", err.message);
    return res.status(500).json({ success: false });
  }
});


router.get("/latest-survey", isAuthenticated, async (req, res) => {
  const userId = req.session.user.id;

  try {
    const latestApp = await db.getAsync(
      `SELECT id, session_id 
FROM applications 
WHERE user_id = ? 
AND id IN (
  SELECT application_id FROM mentorship_preferences
  INTERSECT
  SELECT application_id FROM lifestyle_answers
  INTERSECT
  SELECT application_id FROM enneagram_answers
)
ORDER BY application_date DESC 
LIMIT 1
`,
      [userId]
    );

    if (!latestApp) {
      return res.json({ success: true, data: null });
    }

    const [prefs, lifestyle, enneagram] = await Promise.all([
      db.getAsync(`SELECT * FROM mentorship_preferences WHERE application_id = ?`, [latestApp.id]),
      db.getAsync(`SELECT * FROM lifestyle_answers WHERE application_id = ?`, [latestApp.id]),
      db.getAsync(`SELECT * FROM enneagram_answers WHERE application_id = ?`, [latestApp.id]),
    ]);

    console.log("✅ PREFS:", prefs);
    console.log("✅ LIFESTYLE:", lifestyle);
    console.log("✅ ENNEAGRAM:", enneagram);

    res.json({
      success: true,
      data: {
        applicationId: latestApp.id,
        sessionId: latestApp.session_id,
        preferences: prefs,
        lifestyle,
        enneagram,
      },
    });
  } catch (err) {
    console.error("❌ Error fetching latest survey:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/form-status", isAuthenticated, async (req, res) => {
  const userId = req.session.user.id;
  const sessionId = req.query.sessionId; 
if (!sessionId) {
    return res.status(400).json({ success: false, error: 'Missing sessionId' });
}

  const applicationId = await db.getApplicationIdForUser(userId, sessionId);

  if (!applicationId) {
    return res.json({ success: true, submitted: false });
  }

  db.get(`SELECT submitted FROM mentorship_preferences WHERE application_id = ?`, [applicationId], (err, row) => {
    if (err) {
      console.error("❌ Failed to check form status:", err.message);
      return res.status(500).json({ success: false });
    }
    res.json({ success: true, submitted: row?.submitted === 1 });
  });
});

// Save Account Mentorship Preferences (no session tie)
router.post("/account-save-preferences", isAuthenticated, async (req, res) => {
  const userId = req.session.user.id;
  const { session_role, transplantType, transplantYear, goals, meetingPref, sportsInterest } = req.body;

  try {
      // Check if user already has a saved mentorship_preferences row (account-level)
      const existing = await db.get(
          `SELECT * FROM mentorship_preferences WHERE user_id = ? AND session_id IS NULL`,
          [userId]
      );

      if (existing) {
          // Update existing
          await db.run(
              `UPDATE mentorship_preferences
               SET session_role = ?, transplant_type = ?, transplant_year = ?, goals = ?, meeting_preference = ?, sports_activities = ?, updated_at = CURRENT_TIMESTAMP
               WHERE user_id = ? AND session_id IS NULL`,
              [
                  session_role,
                  JSON.stringify(transplantType),
                  transplantYear,
                  JSON.stringify(goals),
                  meetingPref,
                  JSON.stringify(sportsInterest),
                  userId
              ]
          );
          console.log(`✅ Updated account-level mentorship preferences for user ${userId}`);
      } else {
          // Insert new
          await db.run(
              `INSERT INTO mentorship_preferences 
              (user_id, session_id, role, session_role, transplant_type, transplant_year, goals, meeting_preference, sports_activities, submitted, updated_at)
              VALUES (?, NULL, NULL, ?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
              [
                  userId,
                  session_role,
                  JSON.stringify(transplantType),
                  transplantYear,
                  JSON.stringify(goals),
                  meetingPref,
                  JSON.stringify(sportsInterest),
              ]
          );
          console.log(`✅ Inserted new account-level mentorship preferences for user ${userId}`);
      }

      return res.json({ success: true });
  } catch (err) {
      console.error("❌ Error saving account-level preferences:", err.message);
      res.status(500).json({ success: false, error: err.message });
  }
});


module.exports = router;

const express = require("express");
const router = express.Router();
const { getTopMentorMatchesForMentee } = require("../utils/matchAlgorithm");

router.get("/match-mentee", async (req, res) => {
  const userId = req.session?.user?.id;
  const sessionId = req.query.sessionId; 

  if (!userId || !sessionId) {
    return res.status(400).json({ success: false, message: "Missing user or sessionId" });
  }

  try {
    const matches = await getTopMentorMatchesForMentee(userId, sessionId);
    res.json({ success: true, matches });
  } catch (error) {
    console.error("Matching error:", error);
    res.status(500).json({ success: false, error: "Matching failed." });
  }
});


module.exports = router;

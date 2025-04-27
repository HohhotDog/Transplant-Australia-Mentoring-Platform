const express = require("express");
const router = express.Router();
const { getTopMentorMatchesForMentee } = require("../utils/matchAlgorithm");

router.get("/match-mentee", async (req, res) => {
  const userId = req.session?.user?.id;
  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    const matches = await getTopMentorMatchesForMentee(userId);
    res.json({ success: true, matches });
  } catch (error) {
    console.error("Matching error:", error);
    res.status(500).json({ success: false, error: "Matching failed." });
  }
});

module.exports = router;

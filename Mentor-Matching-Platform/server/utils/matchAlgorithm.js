const db = require("../db");

const enneagramCompatibilityMap = {
  1: [7, 2, 9],
  2: [4, 3, 8],
  3: [2, 4, 9],
  4: [5, 9, 1],
  5: [1, 9, 6],
  6: [3, 9, 1],
  7: [1, 9, 4],
  8: [2, 9, 3],
  9: [3, 5, 7],
};

function calculateScore(mentee, mentor) {
  let score = 0;

  // 1. Enneagram Match (50%)
  const menteeType = Number(mentee.enneagram.top_type);
  const mentorType = Number(mentor.enneagram.top_type);
  const isCompatible = enneagramCompatibilityMap[menteeType]?.includes(mentorType);
  if (menteeType === mentorType) score += 50;
  else if (isCompatible) score += 40;

  // 2. Lifestyle Match (20%)
  let lifestyleScore = 0;
  const lifestyleQuestions = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8"];
  for (const q of lifestyleQuestions) {
    const diff = Math.abs(mentee.lifestyle[q] - mentor.lifestyle[q]);
    lifestyleScore += (4 - diff) / 4 * 100; // Normalize to 100
  }
  lifestyleScore /= lifestyleQuestions.length;
  score += 0.2 * lifestyleScore;

  // 3. Sports/Activities Match (15%)
  const menteeSports = JSON.parse(mentee.preferences.sports_activities || "[]");
  const mentorSports = JSON.parse(mentor.preferences.sports_activities || "[]");
  const sportsMatched = menteeSports.filter(item => mentorSports.includes(item)).length;
  const sportsScore = menteeSports.length > 0 ? (sportsMatched / menteeSports.length) * 100 : 0;
  score += 0.15 * sportsScore;

  // 4. Support Goals Match (10%)
  const menteeGoals = JSON.parse(mentee.preferences.goals || "[]");
  const mentorGoals = JSON.parse(mentor.preferences.goals || "[]");
  const goalsMatched = menteeGoals.filter(item => mentorGoals.includes(item)).length;
  const goalsScore = menteeGoals.length > 0 ? (goalsMatched / menteeGoals.length) * 100 : 0;
  score += 0.1 * goalsScore;

  // 5. Transplant Type Match (5%)
  const menteeTypeTx = mentee.preferences.transplant_type;
  const mentorTypeTx = mentor.preferences.transplant_type;
  let transplantScore = 0;
  if (menteeTypeTx === mentorTypeTx) transplantScore = 100;
  else if (mentorTypeTx && menteeTypeTx) transplantScore = 50;
  score += 0.05 * transplantScore;

  return score.toFixed(2);
}

async function getTopMentorMatchesForMentee(userId) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT u.id, u.email, e.top_type, e.scores, l.*, p.*
       FROM users u
       JOIN enneagram_answers e ON u.id = e.user_id
       JOIN lifestyle_answers l ON u.id = l.user_id
       JOIN mentorship_preferences p ON u.id = p.user_id
       WHERE p.role = 'mentor'`,
      [],
      (err, mentors) => {
        if (err) return reject(err);

        db.get(
          `SELECT u.id, u.email, e.top_type, e.scores, l.*, p.*
           FROM users u
           JOIN enneagram_answers e ON u.id = e.user_id
           JOIN lifestyle_answers l ON u.id = l.user_id
           JOIN mentorship_preferences p ON u.id = p.user_id
           WHERE u.id = ? AND p.role = 'mentee'`,
          [userId],
          (err2, mentee) => {
            if (err2 || !mentee) return reject(err2 || new Error("Mentee not found"));

            const scoredMentors = mentors.map((mentor) => {
              const matchScore = calculateScore(mentee, mentor);
              return { mentorId: mentor.id, email: mentor.email, score: Number(matchScore) };
            });

            scoredMentors.sort((a, b) => b.score - a.score);
            resolve(scoredMentors.slice(0, 3));
          }
        );
      }
    );
  });
}

module.exports = { getTopMentorMatchesForMentee };

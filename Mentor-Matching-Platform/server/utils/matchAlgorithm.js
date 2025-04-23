// matchAlgorithm.js
const db = require("../db");

const enneagramCompatibility = {
  "1": ["2", "4", "7"],
  "2": ["1", "4", "8"],
  "3": ["6", "7", "9"],
  "4": ["1", "2", "5"],
  "5": ["4", "8", "9"],
  "6": ["3", "8", "9"],
  "7": ["1", "3", "9"],
  "8": ["2", "5", "6"],
  "9": ["3", "5", "7"]
};

function calculateSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  const sum = a.reduce((acc, val, i) => acc + Math.pow(val - b[i], 2), 0);
  return 1 / (1 + Math.sqrt(sum));
}

function compareArrays(arr1, arr2) {
  if (!arr1 || !arr2 || arr1.length === 0) return 0;
  const common = arr1.filter(value => arr2.includes(value));
  return common.length / arr1.length;
}

function transplantScore(mentee, mentor) {
  if (!mentee || !mentor) return 0;
  if (mentee === mentor) return 100;
  if (mentor !== "Not Applicable") return 50;
  return 0;
}

function safeParseArray(val) {
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function lifestyleVector(user) {
  return [
    user.physicalExerciseFrequency,
    user.likeAnimals,
    user.likeCooking,
    user.travelImportance,
    user.freeTimePreference,
    user.feelOverwhelmed,
    user.activityBarriers,
    user.longTermGoals,
    user.stressHandling,
    user.motivationLevel,
    user.hadMentor
  ];
}

async function matchMentorsForMentee(menteeId) {
  const mentee = await db.getAsync(`
    SELECT u.id, mp.transplant_type, mp.goals, mp.sports_activities, e.top_type, l.*
    FROM users u
    JOIN mentorship_preferences mp ON u.id = mp.user_id
    JOIN enneagram_answers e ON u.id = e.user_id
    JOIN lifestyle_answers l ON u.id = l.user_id
    WHERE u.id = ? AND mp.role = 'mentee'
  `, [menteeId]);

  if (!mentee) throw new Error("Mentee not found or missing data");

  const mentors = await db.allAsync(`
    SELECT u.id, p.first_name, p.last_name, u.email,
           mp.transplant_type, mp.goals, mp.sports_activities, e.top_type, l.*
    FROM users u
    JOIN profiles p ON u.id = p.user_id
    JOIN mentorship_preferences mp ON u.id = mp.user_id
    JOIN enneagram_answers e ON u.id = e.user_id
    JOIN lifestyle_answers l ON u.id = l.user_id
    WHERE mp.role = 'mentor'
  `);

  const menteeLifestyle = lifestyleVector(mentee);
  const menteeEnneagram = mentee.top_type;
  const menteeGoals = safeParseArray(mentee.goals);
  const menteeSports = safeParseArray(mentee.sports_activities);
  const menteeTransplant = safeParseArray(mentee.transplant_type)[0] || "Not Applicable";

  const results = mentors.map((mentor) => {
    try {
      const mentorLifestyle = lifestyleVector(mentor);
      const lifestyleScore = calculateSimilarity(menteeLifestyle, mentorLifestyle);

      const menteeTypes = Array.isArray(menteeEnneagram) ? menteeEnneagram : [menteeEnneagram];
      let enneagramScore = 20;
      if (menteeTypes.includes(mentor.top_type)) {
        enneagramScore = 80;
      } else if (menteeTypes.some(type => enneagramCompatibility[type]?.includes(mentor.top_type))) {
        enneagramScore = 100;
      }
      const normalizedEnneagramScore = enneagramScore / 100;

      const sportsMatch = compareArrays(menteeSports, safeParseArray(mentor.sports_activities));
      const goalsMatch = compareArrays(menteeGoals, safeParseArray(mentor.goals));
      const mentorTransplant = safeParseArray(mentor.transplant_type)[0] || "Not Applicable";
      const transplantMatch = transplantScore(menteeTransplant, mentorTransplant) / 100;

      const finalScore = (
        0.5 * normalizedEnneagramScore +
        0.2 * lifestyleScore +
        0.15 * sportsMatch +
        0.1 * goalsMatch +
        0.05 * transplantMatch
      );

      return {
        mentor_id: mentor.id,
        name: `${mentor.first_name} ${mentor.last_name}`,
        email: mentor.email,
        finalScore: parseFloat(finalScore.toFixed(3))
      };
    } catch (err) {
      console.error(`❌ Error processing mentor ID ${mentor.id}:`, err.message);
      return null;
    }
  });

  return results.filter(Boolean).sort((a, b) => b.finalScore - a.finalScore).slice(0, 3);
}

module.exports = matchMentorsForMentee;

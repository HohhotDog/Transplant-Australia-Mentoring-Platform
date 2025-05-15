const { Faker, en } = require('@faker-js/faker');
const faker = new Faker({ locale: [en] }); // Ensures all data is English
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const db = new sqlite3.Database("../data/survey.db"); // Adjust path if needed
const SALT_ROUNDS = 10;

// Configuration
const USER_COUNT = 100;
const SESSION_COUNT = 10;

// Helper function to promisify db methods
function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID); // For INSERT queries, return the last inserted ID
      }
    });
  });
}

function getQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

function allQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Generate valid date ranges
function generateValidDateRange() {
  const startDate = faker.date.future(); // Generate a future start date
  const endDate = faker.date.future({ refDate: startDate }); // Ensure end date is after start date
  return { startDate, endDate };
}

// Seed users
async function seedUsers() {
  const users = [];
  for (let i = 0; i < USER_COUNT; i++) {
    const email = faker.internet.email().toLowerCase();
    const passwordHash = await bcrypt.hash("Password123!", SALT_ROUNDS);

    const userId = await runQuery(
      `INSERT INTO users (email, password_hash, security_question, security_answer_hash, account_type)
       VALUES (?, ?, ?, ?, ?)`,
      [
        email,
        passwordHash,
        "What is your favorite color?",
        await bcrypt.hash("blue", SALT_ROUNDS),
        i === 0 ? 1 : 0, // Set the first user as admin
      ]
    );

    await runQuery(
      `INSERT INTO profiles (user_id, first_name, last_name, date_of_birth, gender, phone_number, address, city_suburb, state, postal_code, bio)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        faker.person.firstName(),
        faker.person.lastName(),
        faker.date
          .birthdate({ min: 18, max: 80, mode: "age" })
          .toISOString()
          .split("T")[0],
        faker.helpers.arrayElement(["male", "female", "other"]),
        faker.phone.number("04## ### ###"),
        faker.location.streetAddress(),
        faker.location.city(),
        faker.location.state(),
        faker.number.int({ min: 1000, max: 9999 }), // Ensure postal code is 4 digits
        faker.lorem.paragraph(),
      ]
    );

    users.push(userId);
  }
  console.log(`✅ Seeded ${users.length} users`);
  return users;
}

// Seed sessions
async function seedSessions() {
  const sessions = [];
  for (let i = 0; i < SESSION_COUNT; i++) {
    const { startDate, endDate } = generateValidDateRange();
    const sessionId = await runQuery(
      `INSERT INTO sessions (name, start_date, end_date, description, picture_url, creator_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        faker.lorem.words(3),
        startDate.toISOString(),
        endDate.toISOString(),
        faker.lorem.paragraph(),
        faker.image.urlLoremFlickr({ category: "nature" }),
        null, // No creator for fake data
        faker.helpers.arrayElement(["available", "active", "finished"]),
      ]
    );
    sessions.push(sessionId);
  }
  console.log(`✅ Seeded ${sessions.length} sessions`);
  return sessions;
}

// Seed applications
async function seedApplications(users, sessions) {
  const applications = [];
  for (const user of users) {
    const session = faker.helpers.arrayElement(sessions);
    const role = faker.helpers.arrayElement(["mentor", "mentee"]);

    const existingApplication = await getQuery(
      `SELECT id FROM applications WHERE user_id = ? AND session_id = ?`,
      [user, session]
    );

    if (!existingApplication) {
      const applicationId = await runQuery(
        `INSERT INTO applications (user_id, session_id, role, status)
         VALUES (?, ?, ?, ?)`,
        [user, session, role, "approved"]
      );
      applications.push(applicationId);
    }
  }
  console.log(`✅ Seeded ${applications.length} applications`);
  return applications;
}

// Seed participants
async function seedParticipants() {
  const approvedApps = await allQuery(
    `SELECT id, session_id, user_id FROM applications WHERE status = 'approved'`
  );

  for (const app of approvedApps) {
    const existingParticipant = await getQuery(
      `SELECT id FROM participants WHERE session_id = ? AND user_id = ?`,
      [app.session_id, app.user_id]
    );

    if (!existingParticipant) {
      await runQuery(
        `INSERT INTO participants (session_id, user_id, application_id)
         VALUES (?, ?, ?)`,
        [app.session_id, app.user_id, app.id]
      );
      console.log(`✅ Inserted participant for user ${app.user_id} in session ${app.session_id}`);
    } else {
      console.log(`⚠️ Participant already exists for user ${app.user_id} in session ${app.session_id}`);
    }
  }
  console.log("✅ Seeded participants");
}

// Seed matching pairs
async function seedMatchingPairs() {
  const mentees = await allQuery(
    `SELECT p.user_id AS mentee_id, p.session_id, a.id AS application_id
     FROM participants p
     JOIN applications a ON p.application_id = a.id
     WHERE a.role = 'mentee' AND a.status = 'approved'`
  );

  for (const mentee of mentees) {
    const mentors = await allQuery(
      `SELECT p.user_id AS mentor_id, a.id AS application_id
       FROM participants p
       JOIN applications a ON p.application_id = a.id
       WHERE a.role = 'mentor' AND a.status = 'approved' AND p.session_id = ?`,
      [mentee.session_id]
    );

    if (mentors.length > 0) {
      const mentor = faker.helpers.arrayElement(mentors);

      // Check if the pair already exists
      const existingPair = await getQuery(
        `SELECT id FROM matching_pairs WHERE session_id = ? AND mentor_id = ? AND mentee_id = ?`,
        [mentee.session_id, mentor.mentor_id, mentee.mentee_id]
      );

      if (!existingPair) {
        // Insert the mentor-mentee pair into the matching_pairs table
        await runQuery(
          `INSERT INTO matching_pairs (session_id, mentor_id, mentee_id)
           VALUES (?, ?, ?)`,
          [mentee.session_id, mentor.mentor_id, mentee.mentee_id]
        );

        // Update the assigned_mentor_id column in the applications table for the mentee
        await runQuery(
          `UPDATE applications SET assigned_mentor_id = ? WHERE id = ?`,
          [mentor.mentor_id, mentee.application_id]
        );

        console.log(
          `✅ Inserted matching pair: Mentor ${mentor.mentor_id}, Mentee ${mentee.mentee_id} in Session ${mentee.session_id}`
        );
      }
    } else {
      console.log(`⚠️ No mentors available for mentee ${mentee.mentee_id} in session ${mentee.session_id}`);
    }
  }
  console.log("✅ Seeded matching pairs and updated assigned_mentor_id");
}

// Seed mentorship preferences
async function seedMentorshipPreferences() {
  const applications = await allQuery(`SELECT id, user_id, role FROM applications`);
  for (const app of applications) {
    // Check if mentorship preferences already exist for this application_id
    const existingPreference = await getQuery(
      `SELECT application_id FROM mentorship_preferences WHERE application_id = ?`,
      [app.id]
    );

    if (!existingPreference) {
      await runQuery(
        `INSERT INTO mentorship_preferences (application_id, user_id, role, transplant_type, session_role, transplant_year, goals, meeting_preference, sports_activities, submitted)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          app.id,
          app.user_id,
          app.role,
          faker.helpers.arrayElement(["kidney", "liver", "heart", "lung"]),
          faker.helpers.arrayElement(["mentor", "mentee"]),
          faker.date.past(10).getFullYear().toString(),
          faker.lorem.sentence(), // Goals
          faker.helpers.arrayElement(["online", "in-person"]), // Meeting preference
          faker.helpers.arrayElement(["soccer", "basketball", "swimming"]), // Sports activities
          true, // Submitted
        ]
      );
      console.log(`✅ Inserted mentorship preferences for application ${app.id}`);
    } else {
      console.log(`⚠️ Mentorship preferences already exist for application ${app.id}`);
    }
  }
  console.log("✅ Seeded mentorship preferences");
}

// Seed lifestyle answers
async function seedLifestyleAnswers() {
  const applications = await allQuery(`SELECT id, user_id FROM applications`);
  for (const app of applications) {
    const existingAnswer = await getQuery(
      `SELECT application_id FROM lifestyle_answers WHERE application_id = ?`,
      [app.id]
    );

    if (!existingAnswer) {
      await runQuery(
        `INSERT INTO lifestyle_answers (application_id, user_id, physicalExerciseFrequency, likeAnimals, likeCooking, travelImportance, freeTimePreference, feelOverwhelmed, activityBarriers, longTermGoals, stressHandling, motivationLevel, hadMentor)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          app.id,
          app.user_id,
          faker.number.int({ min: 1, max: 5 }),
          faker.number.int({ min: 1, max: 5 }),
          faker.number.int({ min: 1, max: 5 }),
          faker.number.int({ min: 1, max: 5 }),
          faker.number.int({ min: 1, max: 5 }),
          faker.number.int({ min: 1, max: 5 }),
          faker.number.int({ min: 1, max: 5 }),
          faker.number.int({ min: 1, max: 5 }),
          faker.number.int({ min: 1, max: 5 }),
          faker.number.int({ min: 1, max: 5 }),
          faker.datatype.boolean(),
        ]
      );
      console.log(`✅ Inserted lifestyle answers for application ${app.id}`);
    } else {
      console.log(`⚠️ Lifestyle answers already exist for application ${app.id}`);
    }
  }
  console.log("✅ Seeded lifestyle answers");
}

// Seed enneagram answers
async function seedEnneagramAnswers() {
  const applications = await allQuery(`SELECT id, user_id FROM applications`);
  for (const app of applications) {
    const existingAnswer = await getQuery(
      `SELECT application_id FROM enneagram_answers WHERE application_id = ?`,
      [app.id]
    );

    if (!existingAnswer) {
      await runQuery(
        `INSERT INTO enneagram_answers (application_id, user_id, top_type, scores, answers)
         VALUES (?, ?, ?, ?, ?)`,
        [
          app.id,
          app.user_id,
          faker.helpers.arrayElement(["Type 1", "Type 2", "Type 3", "Type 4", "Type 5", "Type 6", "Type 7", "Type 8", "Type 9"]),
          JSON.stringify({
            "Type 1": faker.number.int({ min: 0, max: 100 }),
            "Type 2": faker.number.int({ min: 0, max: 100 }),
            "Type 3": faker.number.int({ min: 0, max: 100 }),
            "Type 4": faker.number.int({ min: 0, max: 100 }),
            "Type 5": faker.number.int({ min: 0, max: 100 }),
            "Type 6": faker.number.int({ min: 0, max: 100 }),
            "Type 7": faker.number.int({ min: 0, max: 100 }),
            "Type 8": faker.number.int({ min: 0, max: 100 }),
            "Type 9": faker.number.int({ min: 0, max: 100 }),
          }),
          JSON.stringify(faker.lorem.words(10).split(" ")),
        ]
      );
      console.log(`✅ Inserted enneagram answers for application ${app.id}`);
    } else {
      console.log(`⚠️ Enneagram answers already exist for application ${app.id}`);
    }
  }
  console.log("✅ Seeded enneagram answers");
}

// Seed mentor recommendations
async function seedMentorRecommendations() {
  const applications = await allQuery(`SELECT id FROM applications WHERE role = 'mentee'`);
  for (const app of applications) {
    const mentors = await allQuery(
      `SELECT id FROM applications WHERE role = 'mentor' AND session_id = (SELECT session_id FROM applications WHERE id = ?)`,
      [app.id]
    );

    if (mentors.length > 0) {
      const recommendedMentor = faker.helpers.arrayElement(mentors);

      // Check if the recommendation already exists
      const existingRecommendation = await getQuery(
        `SELECT application_id FROM mentor_recommendations WHERE application_id = ? AND recommended_mentor_id = ?`,
        [app.id, recommendedMentor.id]
      );

      if (!existingRecommendation) {
        await runQuery(
          `INSERT INTO mentor_recommendations (application_id, recommended_mentor_id)
           VALUES (?, ?)`,
          [app.id, recommendedMentor.id]
        );
        console.log(`✅ Inserted mentor recommendation for application ${app.id}, mentor ${recommendedMentor.id}`);
      } else {
        console.log(`⚠️ Mentor recommendation already exists for application ${app.id}, mentor ${recommendedMentor.id}`);
      }
    }
  }
  console.log("✅ Seeded mentor recommendations");
}

// Seed comments
async function seedComments() {
  const participants = await allQuery(`SELECT user_id, session_id FROM participants`);
  for (const participant of participants) {
    await runQuery(
      `INSERT INTO comments (session_id, target_user_id, content, commenter_id)
       VALUES (?, ?, ?, ?)`,
      [
        participant.session_id,
        participant.user_id,
        faker.lorem.sentence(),
        faker.number.int({ min: 1, max: USER_COUNT }),
      ]
    );
  }
  console.log("✅ Seeded comments");
}

// Main function
async function main() {
  try {
    console.log("🌱 Starting to seed all fake data...");
    const users = await seedUsers();
    const sessions = await seedSessions();
    await seedApplications(users, sessions);
    await seedParticipants();
    await seedMatchingPairs();
    await seedMentorshipPreferences();
    await seedLifestyleAnswers();
    await seedEnneagramAnswers();
    await seedMentorRecommendations();
    await seedComments();
    console.log("🎉 All fake data seeding complete!");
  } catch (err) {
    console.error("❌ Error seeding fake data:", err);
  } finally {
    db.close();
  }
}

// If run directly, execute the main function
if (require.main === module) {
  main();
}

module.exports = main;
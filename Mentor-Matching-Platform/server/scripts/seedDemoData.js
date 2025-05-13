// scripts/seedDemoData.js
const { faker } = require("@faker-js/faker");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("../data/survey.db"); // modify to your database path

// Configuration parameters
const USER_COUNT = 100;
const SESSION_COUNT = 10;
const APPLICATIONS_PER_SESSION = 30;

// ===== Utility function =====
const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      err ? reject(err) : resolve(this.lastID);
    });
  });
};

// ===== Generate base data =====
async function seedUsers() {
  const users = [];
  for (let i = 0; i < USER_COUNT; i++) {
    const email = faker.internet.email().toLowerCase();
    const userId = await runQuery(
      `INSERT INTO users 
       (email, password_hash, security_question, security_answer_hash, account_type)
       VALUES (?, ?, ?, ?, ?)`,
      [
        email,
        "$2a$10$fakehash", // example bcrypt hash
        "Your security question?",
        "$2a$10$fakeanswerhash",
        i === 0 ? 1 : 0, // set first user as admin
      ]
    );

    await runQuery(
      `INSERT INTO profiles 
       (user_id, first_name, last_name, date_of_birth, gender)
       VALUES (?, ?, ?, ?, ?)`,
      [
        userId,
        faker.person.firstName(),
        faker.person.lastName(),
        faker.date
          .birthdate({ min: 18, max: 80, mode: "age" })
          .toISOString()
          .split("T")[0],
        faker.helpers.arrayElement(["male", "female", "other"]),
      ]
    );

    users.push(userId);
  }
  return users;
}

async function seedSessions(userIds) {
  const sessions = [];
  for (let i = 0; i < SESSION_COUNT; i++) {
    const sessionId = await runQuery(
      `INSERT INTO sessions 
       (name, start_date, end_date, description, picture_url, creator_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        faker.lorem.words(3),
        faker.date.future({ years: 0.1 }).toISOString(),
        faker.date.future({ years: 0.2 }).toISOString(),
        faker.lorem.paragraph(),
        faker.image.urlLoremFlickr({ category: "nature" }),
        faker.helpers.arrayElement(userIds),
        faker.helpers.arrayElement(["available", "active", "finished"]),
      ]
    );
    sessions.push(sessionId);
  }
  return sessions;
}

// ===== Generate related data =====
async function seedApplications(userIds, sessionIds) {
  const applications = [];
  for (const sessionId of sessionIds) {
    for (let i = 0; i < APPLICATIONS_PER_SESSION; i++) {
      const appId = await runQuery(
        `INSERT INTO applications 
         (session_id, user_id, role, status)
         VALUES (?, ?, ?, ?)`,
        [
          sessionId,
          faker.helpers.arrayElement(userIds),
          faker.helpers.arrayElement(["mentor", "mentee"]),
          faker.helpers.arrayElement(["pending", "approved", "onhold"]),
        ]
      );
      applications.push(appId);
    }
  }
  return applications;
}

async function seedParticipants() {
  // only approved applications become participants
  const approvedApps = await new Promise((resolve, reject) => {
    db.all(
      `SELECT id FROM applications WHERE status = 'approved'`,
      (err, rows) => (err ? reject(err) : resolve(rows.map((r) => r.id)))
    );
  });

  for (const appId of approvedApps) {
    await runQuery(
      `INSERT INTO participants (session_id, user_id, application_id)
       SELECT a.session_id, a.user_id, a.id
       FROM applications a WHERE a.id = ?`,
      [appId]
    );
  }
}

// ===== Generate matching pairs =====
async function seedMatchingPairs() {
  // get all approved mentees
  const mentees = await new Promise((resolve, reject) => {
    db.all(
      `SELECT p.user_id, p.session_id 
       FROM participants p
       JOIN applications a ON p.application_id = a.id
       WHERE a.role = 'mentee'`,
      (err, rows) => (err ? reject(err) : resolve(rows))
    );
  });

  // randomly assign a mentor to each mentee
  for (const mentee of mentees) {
    const mentors = await new Promise((resolve, reject) => {
      db.all(
        `SELECT p.user_id 
         FROM participants p
         JOIN applications a ON p.application_id = a.id
         WHERE a.role = 'mentor' AND p.session_id = ?`,
        [mentee.session_id],
        (err, rows) => (err ? reject(err) : resolve(rows))
      );
    });

    if (mentors.length > 0) {
      await runQuery(
        `INSERT INTO matching_pairs 
         (session_id, mentor_id, mentee_id)
         VALUES (?, ?, ?)`,
        [
          mentee.session_id,
          faker.helpers.arrayElement(mentors).user_id,
          mentee.user_id,
        ]
      );
    }
  }
}

// ===== Main execution flow =====
async function main() {
  try {
    console.log("Starting to generate fake data...");

    // respect foreign key dependencies
    const userIds = await seedUsers();
    console.log(`✅ Generated ${USER_COUNT} users`);

    const sessionIds = await seedSessions(userIds);
    console.log(`✅ Generated ${SESSION_COUNT} sessions`);

    const applicationIds = await seedApplications(userIds, sessionIds);
    console.log(`✅ Generated ${applicationIds.length} application records`);

    await seedParticipants();
    console.log("✅ Generated participant records");

    await seedMatchingPairs();
    console.log("✅ Generated mentor-mentee matches");

    console.log("🎉 All fake data generation complete!");
  } catch (err) {
    console.error("Error generating data:", err);
  } finally {
    db.close();
  }
}

main();

/*
  seedTestUsers.js
  Script to create two test users (mentor & mentee), apply them to session #1, and pair them.
  Usage:
    - Standalone: node seedTestUsers.js
    - As module: const seedTestUsers = require('./seedTestUsers'); seedTestUsers();
*/

const bcrypt = require('bcrypt');
const db = require('../db');
const SALT_ROUNDS = 10;

// Test user credentials
const users = [
  { email: 'mentor@example.com', password: 'MentorPass1!', role: 'mentor' },
  { email: 'mentee@example.com', password: 'MenteePass1!', role: 'mentee' }
];

/**
 * seedTestUsers: insert two users, applications for session 1, and a matching_pair
 */
async function seedTestUsers() {
  // 1. Hash all passwords
  for (let u of users) {
    u.password_hash = await bcrypt.hash(u.password, SALT_ROUNDS);
  }

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      const now = new Date().toISOString();

      // 2. Insert users (skip if exists)
      const insertUser = db.prepare(
        `INSERT INTO users (
           email,
           password_hash,
           security_question,
           security_answer_hash,
           account_type
         )
         VALUES (?, ?, '', '', 0)
         ON CONFLICT(email) DO NOTHING;`
      );
      for (let u of users) {
        insertUser.run(u.email, u.password_hash);
      }
      insertUser.finalize();

      // 3. Apply both to session_id = 1 (skip if already applied)
      const insertApp = db.prepare(
        `INSERT INTO applications (
           session_id,
           user_id,
           role,
           status,
           application_date
         )
         SELECT
           1,
           id,
           ?,
           'approved',
           ?
         FROM users
         WHERE email = ?
         ON CONFLICT(session_id, user_id) DO NOTHING;`
      );
      for (let u of users) {
        insertApp.run(u.role, now, u.email);
      }
      insertApp.finalize();

      // 4. Create matching pair (skip if exists)
      const insertPair = db.prepare(
        `INSERT INTO matching_pairs (
           session_id,
           mentor_id,
           mentee_id
         )
         SELECT
           1,
           (SELECT id FROM users WHERE email = ?),
           (SELECT id FROM users WHERE email = ?)
         ON CONFLICT(session_id, mentor_id, mentee_id) DO NOTHING;`
      );
      insertPair.run(
        users.find(u => u.role === 'mentor').email,
        users.find(u => u.role === 'mentee').email
      );
      insertPair.finalize(err => {
        if (err) return reject(err);
        console.log('✅ Test users, applications, and matching pair seeded');
        resolve();
      });
    });
  });
}

// If run directly, execute
if (require.main === module) {
  seedTestUsers()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('❌ Seeding test users failed:', err);
      process.exit(1);
    });
}

module.exports = seedTestUsers;
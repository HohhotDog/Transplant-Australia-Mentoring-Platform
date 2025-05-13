/*
  seedAdmin.js
  Script to create or update an admin user in the SQLite users table.
  Usage:
    - Standalone: node seedAdmin.js
    - As module: const seedAdmin = require('./seedAdmin'); seedAdmin();
*/

const bcrypt = require('bcrypt');
const db = require('../db');

const ADMIN_EMAIL       = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD    = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
const SECURITY_QUESTION = process.env.SECURITY_QUESTION || 'What is your favorite color?';
const SECURITY_ANSWER   = process.env.SECURITY_ANSWER || 'blue';
const SALT_ROUNDS       = 10;

/**
 * seedAdmin: hash credentials and insert/update admin account
 */
async function seedAdmin() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);
  const answerHash   = await bcrypt.hash(SECURITY_ANSWER, SALT_ROUNDS);

  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO users (email, password_hash, security_question, security_answer_hash, account_type)
       VALUES (?, ?, ?, ?, 1)
       ON CONFLICT(email) DO UPDATE SET
         password_hash = excluded.password_hash,
         security_question = excluded.security_question,
         security_answer_hash = excluded.security_answer_hash,
         account_type = 1;`,
      [ADMIN_EMAIL, passwordHash, SECURITY_QUESTION, answerHash],
      err => {
        if (err) {
          return reject(err);
        }
        console.log(`✅ Admin user seeded with email: ${ADMIN_EMAIL}`);
        console.log(`✅ Admin password: ${ADMIN_PASSWORD}`);
        resolve();
      }
    );
  });
}

// If run directly, execute seedAdmin
if (require.main === module) {
  seedAdmin()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('❌ Failed to seed admin:', err);
      process.exit(1);
    });
}

module.exports = seedAdmin;

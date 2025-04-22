// scripts/seedSessions.js

const fs = require('fs');
const path = require('path');
const db = require('../db'); 

/**
 * seedSessions reads static JSON and inserts each session into the database.
 * It uses INSERT OR IGNORE to avoid duplicate primary key errors when re-running.
 */
function seedSessions() {
  const filePath = path.join(__dirname, '../data/sessions.json');
  const sessions = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  const insertSQL = `
    INSERT OR IGNORE INTO sessions
      (id, name, start_date, end_date, description, picture_url, creator_id, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'available')
  `;

  sessions.forEach(session => {
    db.run(
      insertSQL,
      [
        session.id,
        session.name,
        session.start_date,
        session.end_date,
        session.description,
        session.picture_url,
        null // creator_id is null for seeding
      ],
      err => {
        if (err) console.error('Seed error:', err);
      }
    );
  });

  console.log(`Seeded ${sessions.length} sessions.`);
}

// Run the seeding function if this script is executed directly
if (require.main === module) {
  seedSessions();
}

module.exports = seedSessions;

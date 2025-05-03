const fs = require('fs');
const path = require('path');
const db = require('../db');

/**
 * seedSessions reads static JSON and inserts each session into the database.
 * It inserts a default session first, then all others from sessions.json.
 */
function seedSessions() {
  // Insert default session with ID = 9999
  const defaultSession = {
    id: 9999,
    name: "Default Survey Session",
    start_date: "2000-01-01",
    end_date: "2099-12-31",
    description: "Default session for first-time users submitting surveys before selecting a session.",
    picture_url: "/images/sessions/default.png",
    creator_id: null,
    status: "hidden"
  };

  db.run(
    `INSERT OR IGNORE INTO sessions 
     (id, name, start_date, end_date, description, picture_url, creator_id, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      defaultSession.id,
      defaultSession.name,
      defaultSession.start_date,
      defaultSession.end_date,
      defaultSession.description,
      defaultSession.picture_url,
      defaultSession.creator_id,
      defaultSession.status
    ],
    err => {
      if (err) console.error("❌ Error inserting default session:", err.message);
    }
  );

  // Insert remaining sessions from JSON
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
        if (err) console.error('❌ Seed error:', err.message);
      }
    );
  });

  console.log(`✅ Seeded ${sessions.length + 1} sessions (including default).`);
}

if (require.main === module) {
  seedSessions();
}

module.exports = seedSessions;

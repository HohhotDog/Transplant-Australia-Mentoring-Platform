const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Full path to the database file
const dbPath = path.join(__dirname, "data", "survey.db");
console.log("🔍 DB path in use:", dbPath);

// Create or open the database file
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Error opening database:", err);
  } else {
    console.log("✅ Connected to SQLite database");
  }
});

// Create "users" table for storing login credentials + Enneagram type
db.run(`
  CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  enneagramType INTEGER,
  role TEXT
  )
`);

// Create "responses" table for mentor/mentee survey submissions
db.run(`
  CREATE TABLE IF NOT EXISTS responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL,
    responses TEXT NOT NULL
  )
`);

module.exports = db;

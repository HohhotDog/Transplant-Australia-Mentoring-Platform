// ./server/db.js
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Create or open the database file in ./data/survey.db
const db = new sqlite3.Database(path.join(__dirname, "data", "survey.db"), (err) => {
  if (err) {
    console.error("Error opening database:", err);
  } else {
    console.log("Connected to SQLite database");
  }
});

// Create "users" table for storing login credentials
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
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

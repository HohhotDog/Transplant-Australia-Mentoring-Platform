// ./server/db.js
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const { promisify } = require("util");


// Create or open the database file in ./data/survey.db
const db = new sqlite3.Database(path.join(__dirname, "data", "survey.db"), (err) => {
  if (err) {
    console.error("❌ Error opening database:", err);
  } else {
    console.log("✅ Connected to SQLite database");
  }
});

db.getAsync = promisify(db.get).bind(db);
db.allAsync = promisify(db.all).bind(db);
db.runAsync = promisify(db.run).bind(db); 


// Users table
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    security_question TEXT NOT NULL,
    security_answer_hash TEXT NOT NULL,
    account_type INTEGER NOT NULL DEFAULT 0 CHECK (account_type IN (0, 1)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);


// Profiles table
db.run(`
  CREATE TABLE IF NOT EXISTS profiles (
    user_id INTEGER PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    date_of_birth TEXT,
    address TEXT,
    city_suburb TEXT,
    state TEXT,
    postal_code TEXT CHECK (LENGTH(postal_code) = 4),
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    aboriginal_or_torres_strait_islander BOOLEAN,
    language_spoken_at_home TEXT,
    living_situation TEXT,
    profile_picture_url TEXT,
    bio TEXT,
    phone_number TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  )
`);




// Mentorship preferences table
db.run(`
  CREATE TABLE IF NOT EXISTS mentorship_preferences (
    application_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    role TEXT CHECK (role IN ('mentor', 'mentee')),
    transplant_type TEXT,
    session_role TEXT,
    transplant_year TEXT,
    goals TEXT,
    meeting_preference TEXT,
    sports_activities TEXT,
    submitted BOOLEAN NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);



db.run(`
  CREATE TABLE IF NOT EXISTS lifestyle_answers (
    application_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    physicalExerciseFrequency INTEGER,
    likeAnimals INTEGER,
    likeCooking INTEGER,
    travelImportance INTEGER,
    freeTimePreference INTEGER,
    feelOverwhelmed INTEGER,
    activityBarriers INTEGER,
    longTermGoals INTEGER,
    stressHandling INTEGER,
    motivationLevel INTEGER,
    hadMentor INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);


db.run(`
  CREATE TABLE IF NOT EXISTS enneagram_answers (
    application_id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    top_type TEXT,
    scores TEXT,
    answers TEXT, 
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);


// Sessions table
db.run(`
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL CHECK (end_date > start_date),
    description TEXT NOT NULL,
    picture_url TEXT NOT NULL,
    creator_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'active', 'finished')),
    FOREIGN KEY (creator_id) REFERENCES users (id) ON DELETE CASCADE
  )
`);

// Applications table
db.run(`
  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    user_id INTEGER,
    role TEXT NOT NULL CHECK (role IN ('mentor', 'mentee')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'onhold')),
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_mentor_id INTEGER,
    UNIQUE (session_id, user_id),
    FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_mentor_id) REFERENCES users (id) ON DELETE CASCADE
  )
`);

// Mentor recommendations table
db.run(`
  CREATE TABLE IF NOT EXISTS mentor_recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id INTEGER NOT NULL,
    recommended_mentor_id INTEGER,
    recommended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (application_id, recommended_mentor_id),
    FOREIGN KEY (application_id) REFERENCES applications (id) ON DELETE CASCADE,
    FOREIGN KEY (recommended_mentor_id) REFERENCES users (id) ON DELETE CASCADE
  )
`);

// Participants table
db.run(`
  CREATE TABLE IF NOT EXISTS participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER,
    user_id INTEGER,
    application_id INTEGER NOT NULL,
    joined_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (session_id, user_id),
    FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (application_id) REFERENCES applications (id) ON DELETE CASCADE
  )
`);

// Matching pairs table
db.run(`
  CREATE TABLE IF NOT EXISTS matching_pairs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER,
    mentor_id INTEGER,
    mentee_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (session_id, mentor_id, mentee_id),
    FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE,
    FOREIGN KEY (mentor_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (mentee_id) REFERENCES users (id) ON DELETE CASCADE,
    CHECK (mentor_id <> mentee_id)
  )
`);

// Comments table
db.run(`
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER,
    target_user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    commenter_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE,
    FOREIGN KEY (target_user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (commenter_id) REFERENCES users (id) ON DELETE CASCADE
  )
`);


async function getApplicationIdForUser(userId, sessionId) {
  if (!sessionId) {
    throw new Error("sessionId is required in getApplicationIdForUser");
  }
  const row = await db.getAsync(
    `SELECT id FROM applications WHERE user_id = ? AND session_id = ? ORDER BY application_date DESC LIMIT 1`,
    [userId, sessionId]
  );
  if (!row) {
    console.warn(`⚠️ No application found for user ${userId} in session ${sessionId}`);
  }
  return row?.id;
}

db.ensureApplicationExists = async (userId, sessionId, role) => {
  if (!sessionId) {
    throw new Error("sessionId is required in ensureApplicationExists");
  }
  if (!role) {
    throw new Error("Role is required in ensureApplicationExists");
  }

  const existing = await db.getAsync(
    `SELECT id FROM applications WHERE user_id = ? AND session_id = ?`,
    [userId, sessionId]
  );

  if (!existing) {
    console.log(`➕ Inserting new application for user ${userId} in session ${sessionId} with role ${role}`);
    await db.runAsync(
      `INSERT INTO applications (user_id, session_id, role) VALUES (?, ?, ?)`,
      [userId, sessionId, role]
    );
  }
};

db.getApplicationIdForUser = getApplicationIdForUser;

module.exports = db;

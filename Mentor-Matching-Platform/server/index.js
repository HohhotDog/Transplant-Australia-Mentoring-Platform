// ./server/index.js
// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const bcrypt = require("bcrypt");
const db = require("./db.js"); // our SQLite db
const app = express();

const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000", // React dev server
  credentials: true
}));
app.use(
  session({
    secret: "someSuperSecretKey",
    resave: false,
    saveUninitialized: false,
  })
);

// An authentication check middleware
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    // if user object is in session, proceed
    return next();
  } else {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
}

// ============= AUTH ENDPOINTS =============

// Register new user
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username and password required" });
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into DB
    const stmt = `INSERT INTO users (username, password) VALUES (?, ?)`;
    db.run(stmt, [username, hashedPassword], function (err) {
      if (err) {
        if (err.message.includes("UNIQUE constraint failed")) {
          return res.status(400).json({ success: false, message: "Username already taken" });
        }
        console.error(err);
        return res.status(500).json({ success: false, message: "Database error" });
      }
      return res.json({ success: true, message: "User registered successfully!" });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Log in existing user
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Missing username or password" });
  }

  // Look up user in DB
  const query = `SELECT * FROM users WHERE username = ?`;
  db.get(query, [username], async (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    if (!row) {
      return res.status(401).json({ success: false, message: "Invalid username or password" });
    }

    // Compare password with stored hash
    const match = await bcrypt.compare(password, row.password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Invalid username or password" });
    }

    // Passwords match, store user in session
    req.session.user = {
      id: row.id,
      username: row.username
    };
    return res.json({ success: true, message: "Login successful" });
  });
});

// Log out user
app.post("/api/logout", (req, res) => {
  req.session.destroy();
  res.clearCookie("connect.sid");
  return res.json({ success: true, message: "Logged out successfully" });
});

// ============= SURVEY QUESTIONS =============
const questions = [
    { id: 1, text: "Do you prefer cooking? 🍳" },
    { id: 2, text: "Do you prefer dogs? 🐶" },
    { id: 3, text: "Do you prefer cats? 🐱" },
    { id: 4, text: "Do you prefer outdoor activities? 🌳" },
    { id: 5, text: "Do you prefer reading books? 📚" }
  ];
  

app.get('/', (req, res) => {
  res.json({ message: 'Transplant Australia backend server!' });
});

app.get("/api/questions", isAuthenticated, (req, res) => {
  res.json(questions);
});

// Submit survey
app.post("/api/submit", isAuthenticated, (req, res) => {
  const { role, responses } = req.body;
  if (!role || !['mentor', 'mentee'].includes(role)) {
    return res.status(400).json({ success: false, message: "Invalid role specified." });
  }

  const responsesStr = JSON.stringify(responses);

  const stmt = `INSERT INTO responses (role, responses) VALUES (?, ?)`;
  db.run(stmt, [role, responsesStr], function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    return res.json({ success: true, message: "Response recorded successfully." });
  });
});

// Match latest mentee
app.get("/api/match-mentee", isAuthenticated, (req, res) => {
  db.all(`SELECT * FROM responses`, [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    const mentors = rows
      .filter((r) => r.role === "mentor")
      .map((row) => ({ role: row.role, responses: JSON.parse(row.responses) }));
    const mentees = rows
      .filter((r) => r.role === "mentee")
      .map((row) => ({ role: row.role, responses: JSON.parse(row.responses) }));

    if (mentees.length === 0) {
      return res.json({ success: false, message: "No mentees available for matching." });
    }
    if (mentors.length === 0) {
      return res.json({ success: false, message: "No mentors available for matching." });
    }

    // We'll just match the LAST mentee
    const latestMentee = mentees[mentees.length - 1].responses;
    const totalQuestions = questions.length;

    const matchScores = mentors.map((mentor) => {
      let score = 0;
      for (let i = 1; i <= totalQuestions; i++) {
        if (latestMentee[`q${i}`] === mentor.responses[`q${i}`]) {
          score++;
        }
      }
      const matchPercentage = ((score / totalQuestions) * 100).toFixed(2);
      return { mentor, score, matchPercentage };
    });

    matchScores.sort((a, b) => b.score - a.score);
    const topMatches = matchScores.slice(0, 3);

    res.json({
      success: true,
      message: "Top 3 mentor matches found.",
      matches: topMatches
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});


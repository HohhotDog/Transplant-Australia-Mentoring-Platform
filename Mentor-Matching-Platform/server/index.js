// ./server/index.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const db = require("./db.js"); // SQLite DB
const authRoutes = require("./routes/auth");
const surveyRoutes = require("./routes/survey");


const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(
    session({
      secret: "someSuperSecretKey",
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 60 * 60 * 1000 } // 60 min Session timeout
    })
);

// Use auth routes
app.use("/api", authRoutes);
app.use("/api/survey", surveyRoutes);


// Auth check middleware
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  } else {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
}

// ============= NON-AUTH ROUTES REMAIN HERE =============

const questions = [
  { id: 1, text: "Do you prefer cooking? 🍳" },
  { id: 2, text: "Do you prefer dogs? 🐶" },
  { id: 3, text: "Do you prefer cats? 🐱" },
  { id: 4, text: "Do you prefer outdoor activities? 🌳" },
  { id: 5, text: "Do you prefer reading books? 📚" }
];

app.get("/", (req, res) => {
  res.json({ message: "Transplant Australia backend server!" });
});

app.get("/api/questions", isAuthenticated, (req, res) => {
  res.json(questions);
});

app.post("/api/submit", isAuthenticated, (req, res) => {
  const { role, responses } = req.body;
  if (!role || !["mentor", "mentee"].includes(role)) {
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
      latestMentee: latestMentee,
      matches: topMatches,
    });
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server listening on http://localhost:${PORT}`);
});

const express = require("express");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const db = require("./db.js");
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const securityRoutes = require("./routes/security");
const surveyRoutes = require("./routes/survey");
const matchRoutes = require("./routes/match");
const avatarRoutes = require("./routes/avatar");

const sessionRoutes = require("./routes/sessions");
const seedSessions = require("./scripts/seedSessions");
const seedAdmin = require("./scripts/seedAdmin");
const commentsRoutes = require("./routes/comments");

const app = express();
const PORT = process.env.PORT || 3001;
app.disable("etag");

// Seed the database with session data
seedSessions();
seedAdmin();
// Middleware
app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(
    session({
        name: "connect.sid", // optional but explicit
        secret: "someSuperSecretKey",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            maxAge: 60 * 60 * 1000
        }
    })
);


// Mount routes
app.use("/api", authRoutes);
app.use("/api", profileRoutes);
app.use("/api", securityRoutes);
app.use("/api", surveyRoutes);
app.use("/api", matchRoutes);
app.use("/api", sessionRoutes);
app.use("/api", avatarRoutes);
app.use("/api/comments", commentsRoutes);

// admin routes
const adminRoutes = require("./routes/admin");
app.use("/api/admin", adminRoutes);

// Auth middleware
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  } else {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
}

// ===== Default root =====
app.get("/", (req, res) => {
  res.json({ message: "Transplant Australia backend server!" });
});

// ===== Sample survey questions =====
// const questions = [
//   { id: 1, text: "Do you prefer cooking? 🍳" },
//   { id: 2, text: "Do you prefer dogs? 🐶" },
//   { id: 3, text: "Do you prefer cats? 🐱" },
//   { id: 4, text: "Do you prefer outdoor activities? 🌳" },
//   { id: 5, text: "Do you prefer reading books? 📚" }
// ];

// Protected: Get survey questions
app.get("/api/questions", isAuthenticated, (req, res) => {
  res.json(questions);
});


app.listen(PORT, () => {
  console.log(`✅ Server listening on http://localhost:${PORT}`);
});

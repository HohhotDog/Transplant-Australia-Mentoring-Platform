// app.js
const express = require("express");
const path = require("path");
const cors = require("cors");
const session = require("express-session");

// Middleware setup
const app = express();
app.disable("etag");
app.use(express.json());
app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    })
);
app.use(
    session({
        name: "connect.sid",
        secret: "someSuperSecretKey",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            maxAge: 60 * 60 * 1000,
        },
    })
);

// Mount public routes
app.use("/api", require("./routes/auth"));
app.use("/api", require("./routes/profile"));
app.use("/api", require("./routes/security"));
app.use("/api", require("./routes/survey"));
app.use("/api", require("./routes/match"));
app.use("/api", require("./routes/sessions"));
app.use("/api", require("./routes/avatar"));
app.use("/api/comments", require("./routes/comments"));
app.use("/api/mentors", require("./routes/mentors"));
app.use("/api", require("./routes/matching-pairs"));

// Admin routes
app.use("/api/admin", require("./routes/admin"));

// Auth helper
function isAuthenticated(req, res, next) {
    if (req.session.user) return next();
    return res.status(401).json({ success: false, message: "Unauthorized" });
}

// Default root
app.get("/", (req, res) => {
    res.json({ message: "Transplant Australia backend server!" });
});

// Protected example
// (Define `questions` array or move into surveyRoutes as you prefer)
app.get("/api/questions", isAuthenticated, (req, res) => {
    res.json(questions);
});

module.exports = app;

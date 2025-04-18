// ./server/routes/auth.js
const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");
const router = express.Router();

// Register new user
router.post("/register", async (req, res) => {
    const { email, password, securityQuestion, securityAnswer } = req.body;

    if (!email || !password || !securityQuestion || !securityAnswer) {
        return res.status(400).json({ success: false, message: "All fields are required." });
    }

    try {
        db.get("SELECT * FROM users WHERE email = ?", [email], async (err, row) => {
            if (err) {
                console.error("DB error:", err);
                return res.status(500).json({ success: false, message: "Database error." });
            }

            if (row) {
                return res.status(400).json({ success: false, message: "Email already registered." });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const hashedAnswer = await bcrypt.hash(securityAnswer, 10);

            const stmt = `
        INSERT INTO users (email, password_hash, security_question, security_answer_hash)
        VALUES (?, ?, ?, ?)
      `;

            db.run(stmt, [email, hashedPassword, securityQuestion, hashedAnswer], function (err) {
                if (err) {
                    console.error("Insert error:", err);
                    return res.status(500).json({ success: false, message: "Failed to register user." });
                }

                return res.json({ success: true, userId: this.lastID });
            });
        });
    } catch (err) {
        console.error("Server error:", err);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
});

// Login
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Missing email or password." });
    }

    const query = `SELECT * FROM users WHERE email = ?`;
    db.get(query, [email], async (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Database error." });
        }
        if (!row) {
            return res.status(401).json({ success: false, message: "Invalid email or password." });
        }

        const match = await bcrypt.compare(password, row.password_hash);
        if (!match) {
            return res.status(401).json({ success: false, message: "Invalid email or password." });
        }

        req.session.user = {
            id: row.id,
            email: row.email
        };
        return res.json({ success: true, message: "Login successful." });
    });
});

// Logout
router.post("/logout", (req, res) => {
    req.session.destroy();
    res.clearCookie("connect.sid");
    return res.json({ success: true, message: "Logged out successfully." });
});

module.exports = router;

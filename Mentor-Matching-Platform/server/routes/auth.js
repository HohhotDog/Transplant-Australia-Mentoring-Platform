/**
 * @module AuthRoutes
 * @description Handles user authentication including registration, login, password reset, and logout.
 */

const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");
const router = express.Router();

/**
 * @route POST /register
 * @group Auth - Operations about user authentication
 * @summary Registers a new user
 * @param {string} email.body.required - User email
 * @param {string} password.body.required - User password
 * @param {string} securityQuestion.body.required - Security question
 * @param {string} securityAnswer.body.required - Security question answer
 * @returns {object} 200 - Success with created user ID
 * @returns {object} 400 - Validation error
 * @returns {object} 500 - Database or server error
 */
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
                    console.error("Insert error:", err.message);
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

/**
 * @route POST /login
 * @group Auth
 * @summary Authenticates a user and starts a session
 * @param {string} email.body.required - User email
 * @param {string} password.body.required - User password
 * @returns {object} 200 - Login successful
 * @returns {object} 401 - Invalid credentials
 * @returns {object} 500 - Server or database error
 */
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
            email: row.email,
            account_type: row.account_type
        };
        return res.json({
            success: true,
            message: "Login successful.",
            account_type: row.account_type
        });

    });
});

/**
 * @route POST /forgot-password
 * @group Auth
 * @summary Resets password using a security question
 * @param {string} email.body.required - User email
 * @param {string} securityAnswer.body.required - Answer to the security question
 * @param {string} newPassword.body.required - New password
 * @returns {object} 200 - Password reset successful
 * @returns {object} 403 - Security answer mismatch
 * @returns {object} 404 - User not found
 * @returns {object} 500 - Server or database error
 */
router.post("/forgot-password", (req, res) => {
    const { email, securityAnswer, newPassword } = req.body;

    if (!email || !securityAnswer || !newPassword) {
        return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const query = `SELECT * FROM users WHERE email = ?`;
    db.get(query, [email], async (err, row) => {
        if (err) {
            console.error("DB error:", err);
            return res.status(500).json({ success: false, message: "Database error." });
        }

        if (!row) {
            return res.status(404).json({ success: false, message: "No user found with that email." });
        }

        const answerMatch = await bcrypt.compare(securityAnswer, row.security_answer_hash);
        if (!answerMatch) {
            return res.status(403).json({ success: false, message: "Security answer does not match." });
        }

        const newHash = await bcrypt.hash(newPassword, 10);
        const updateStmt = `UPDATE users SET password_hash = ? WHERE email = ?`;

        db.run(updateStmt, [newHash, email], function (err) {
            if (err) {
                console.error("Update error:", err);
                return res.status(500).json({ success: false, message: "Failed to reset password." });
            }

            return res.json({ success: true, message: "Password has been reset successfully." });
        });
    });
});


// GET /api/me - returns current session user info
router.get("/me", (req, res) => {
    if (req.session && req.session.user) {
        return res.json({
            success: true,
            id: req.session.user.id,
            email: req.session.user.email,
            account_type: req.session.user.account_type
        });
    } else {
        return res.status(401).json({ success: false });
    }
});

/**
 * @route POST /logout
 * @group Auth
 * @summary Logs the user out by destroying the session
 * @returns {object} 200 - Logout successful
 */
router.post("/logout", (req, res) => {
    req.session.destroy();
    res.clearCookie("connect.sid");
    return res.json({ success: true, message: "Logged out successfully." });
});

/**
 * @route GET /check-auth
 * @group Auth
 * @summary Checks if the user is logged in (session-based)
 * @returns {object} 200 - { isAuthenticated: true/false }
 */
router.get("/check-auth", (req, res) => {
    if (req.session && req.session.user) {
        return res.json({
            isAuthenticated: true,
            user: {
                id: req.session.user.id,
                email: req.session.user.email,
            }
        });
    } else {
        return res.json({
            isAuthenticated: false
        });
    }
});



module.exports = router;



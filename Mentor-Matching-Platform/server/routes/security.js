/**
 * @module SecurityRoutes
 * @description Provides endpoints for accessing security questions and securely updating passwords.
 */

const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");

const router = express.Router();

/**
 * Middleware to ensure the user is authenticated via session.
 * @function isAuthenticated
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Next middleware function
 */
function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    return res.status(401).json({ success: false, message: "Unauthorized" });
}

/**
 * @route GET /security-question
 * @group Security - Security operations
 * @summary Retrieves the stored security question for the currently logged-in user.
 * @returns {object} 200 - Security question returned
 * @returns {object} 401 - Unauthorized
 * @returns {object} 404 - User not found
 * @returns {object} 500 - Database error
 */
router.get("/security-question", isAuthenticated, (req, res) => {
    const userId = req.session.user.id;
    db.get("SELECT security_question FROM users WHERE id = ?", [userId], (err, row) => {
        if (err) {
            console.error("DB error:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        if (!row) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.json({ success: true, question: row.security_question });
    });
});

/**
 * @route POST /update-password
 * @group Security
 * @summary Securely updates the user's password after verifying security answer and current password.
 * @param {string} securityAnswer.body.required - Answer to the user's security question
 * @param {string} currentPassword.body.required - User's current password
 * @param {string} newPassword.body.required - Desired new password
 * @returns {object} 200 - Password successfully updated
 * @returns {object} 400 - Missing fields or password reuse attempt
 * @returns {object} 403 - Incorrect current password or security answer
 * @returns {object} 401 - Unauthorized
 * @returns {object} 500 - Server or database error
 */
router.post("/update-password", isAuthenticated, async (req, res) => {
    const userId = req.session.user.id;
    const { securityAnswer, currentPassword, newPassword } = req.body;

    if (!securityAnswer || !currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: "Missing fields." });
    }

    db.get("SELECT * FROM users WHERE id = ?", [userId], async (err, user) => {
        if (err || !user) {
            console.error("User fetch error:", err);
            return res.status(500).json({ success: false, message: "User not found." });
        }

        // Check if the security answer is correct
        const isAnswerCorrect = await bcrypt.compare(securityAnswer, user.security_answer_hash);
        if (!isAnswerCorrect) {
            return res.status(403).json({ success: false, message: "Incorrect security answer." });
        }

        // Check if the current password is correct
        const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isPasswordCorrect) {
            return res.status(403).json({ success: false, message: "Incorrect current password." });
        }

        // Prevent reuse of the same password
        const isSamePassword = await bcrypt.compare(newPassword, user.password_hash);
        if (isSamePassword) {
            return res.status(400).json({ success: false, message: "New password must be different from the current password." });
        }

        // Hash the new password and update the database
        const newHash = await bcrypt.hash(newPassword, 10);
        db.run("UPDATE users SET password_hash = ? WHERE id = ?", [newHash, userId], (err) => {
            if (err) {
                console.error("Update error:", err);
                return res.status(500).json({ success: false, message: "Failed to update password." });
            }
            return res.json({ success: true, message: "Password updated successfully." });
        });
    });
});

module.exports = router;

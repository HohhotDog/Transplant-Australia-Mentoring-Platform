const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");

const router = express.Router();

// Middleware: check if logged in
function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    return res.status(401).json({ success: false, message: "Unauthorized" });
}

// GET security question for current user
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

// POST: change password with checks
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

        // ✅ Verify security answer
        const isAnswerCorrect = await bcrypt.compare(securityAnswer, user.security_answer_hash);
        if (!isAnswerCorrect) {
            return res.status(403).json({ success: false, message: "Incorrect security answer." });
        }

        // ✅ Verify current password
        const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isPasswordCorrect) {
            return res.status(403).json({ success: false, message: "Incorrect current password." });
        }

        // ❌ Prevent same password reuse
        const isSamePassword = await bcrypt.compare(newPassword, user.password_hash);
        if (isSamePassword) {
            return res.status(400).json({ success: false, message: "New password must be different from the current password." });
        }

        // ✅ Update with new hash
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

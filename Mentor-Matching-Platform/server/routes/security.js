const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");

const router = express.Router();

// Ensure user is logged in
function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    return res.status(401).json({ success: false, message: "Unauthorized" });
}

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

        // ✅ Hash new password and update
        const newHash = await bcrypt.hash(newPassword, 10);
        db.run("UPDATE users SET password_hash = ? WHERE id = ?", [newHash, userId], (err) => {
            if (err) {
                console.error("Update error:", err);
                return res.status(500).json({ success: false, message: "Failed to update password." });
            }
            return res.json({ success: true, message: "Password updated." });
        });
    });
});

module.exports = router;

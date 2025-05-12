// server/routes/avatar.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("../db.js"); // SQLite3 database instance
const { ensureAuthenticated } = require("../middlewares/auth"); // Authentication middleware

const router = express.Router();

// Configure multer storage: save uploaded files to client/public/images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // __dirname is server/routes, go up two levels to project root
        cb(
            null,
            path.join(__dirname, "..", "..", "client", "public", "images")
        );
    },
    filename: (req, file, cb) => {
        // Generate filename: original name (sanitized) + timestamp + extension
        const origExt = path.extname(file.originalname);
        const ext = origExt || ".jpg";
        const base = path
            .basename(file.originalname, origExt)
            .replace(/\s+/g, "_")
            .toLowerCase();
        cb(null, `${base}-${Date.now()}${ext}`);
    },
});

const upload = multer({ storage });

/**
 * POST /api/profile/avatar
 * Middleware: ensureAuthenticated
 * - Uploads a single file from field 'avatar'
 * - Saves file to public/images
 * - Updates or inserts into profiles table
 */
router.post(
    "/profile/avatar",
    ensureAuthenticated,
    upload.single("avatar"),
    async (req, res) => {
        console.log("▶ avatar upload hit");
        console.log("  req.file =", req.file);
        console.log("  req.user =", req.user);

        // Check that file was uploaded
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const publicUrl = `/images/${req.file.filename}`;
        const userId = req.user.id;

        try {
            // Attempt to update existing profile
            await new Promise((resolve, reject) => {
                db.run(
                    "UPDATE profiles SET profile_picture_url = ? WHERE user_id = ?",
                    [publicUrl, userId],
                    function (err) {
                        if (err) return reject(err);
                        // If no rows updated, insert a new profile record
                        if (this.changes === 0) {
                            db.run(
                                "INSERT INTO profiles (user_id, profile_picture_url) VALUES (?, ?)",
                                [userId, publicUrl],
                                (insertErr) => {
                                    if (insertErr) return reject(insertErr);
                                    resolve();
                                }
                            );
                        } else {
                            resolve();
                        }
                    }
                );
            });

            // Respond with the new avatar URL
            return res.json({ success: true, avatar_url: publicUrl });
        } catch (err) {
            console.error("Database update error:", err);
            return res
                .status(500)
                .json({ success: false, message: "Database update failed" });
        }
    }
);

module.exports = router;

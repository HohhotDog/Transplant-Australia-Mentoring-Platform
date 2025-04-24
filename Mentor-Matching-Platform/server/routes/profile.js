/**
 * @module ProfileRoutes
 * @description Handles authenticated user profile operations: fetching, creating, and updating.
 */

const express = require("express");
const db = require("../db");
const router = express.Router();

/**
 * Middleware to check if user is authenticated.
 * @function isAuthenticated
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        next();
    } else {
        res.status(401).json({ success: false, message: "Unauthorized" });
    }
}

/**
 * Helper function to check if a profile is complete.
 * @function isProfileComplete
 * @param {Object} profile - The user profile object
 * @returns {boolean} - Returns true if all required fields are non-empty
 */
function isProfileComplete(profile) {
    const requiredFields = [
        "first_name", "last_name", "date_of_birth", "address", "city_suburb",
        "state", "postal_code", "gender", "aboriginal_or_torres_strait_islander",
        "language_spoken_at_home", "living_situation"
    ];
    return requiredFields.every(field => profile[field] !== null && profile[field] !== "");
}

/**
 * @route GET /profile
 * @group Profile - Operations related to user profile
 * @summary Fetch the authenticated user's profile if it exists and is complete
 * @returns {object} 200 - Profile data
 * @returns {object} 401 - Unauthorized
 * @returns {object} 404 - Profile not found or incomplete
 * @returns {object} 500 - Database error
 */
router.get("/profile", isAuthenticated, (req, res) => {
    const userId = req.session.user.id;

    const query = `
        SELECT
            u.email,
            p.*
        FROM users u
                 LEFT JOIN profiles p ON u.id = p.user_id
        WHERE u.id = ?
    `;

    db.get(query, [userId], (err, row) => {
        if (err) {
            console.error("DB error:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }
        if (!row || !isProfileComplete(row)) {
            return res.status(404).json({
                success: false,
                message: "Incomplete or missing profile. Please complete your profile."
            });
        }
        return res.json({ success: true, profile: row });
    });
});

/**
 * @route POST /profile
 * @group Profile
 * @summary Create or update the authenticated user's profile
 * @param {object} req.body - Profile fields including name, address, DOB, etc.
 * @returns {object} 200 - Success confirmation
 * @returns {object} 400 - Invalid input (e.g., future DOB)
 * @returns {object} 401 - Unauthorized
 * @returns {object} 500 - Database error on insert/update
 */
router.post("/profile", isAuthenticated, (req, res) => {
    const userId = req.session.user.id;
    const {
        first_name, last_name, date_of_birth, address, city_suburb, state,
        postal_code, gender, aboriginal_or_torres_strait_islander,
        language_spoken_at_home, living_situation, profile_picture_url,
        bio, phone_number
    } = req.body;

    const dob = new Date(date_of_birth);
    const today = new Date();
    if (isNaN(dob.getTime()) || dob > today) {
        return res.status(400).json({
            success: false,
            message: "Invalid date of birth. It must be a valid past date."
        });
    }

    const values = [
        first_name, last_name, date_of_birth, address, city_suburb, state,
        postal_code, gender, aboriginal_or_torres_strait_islander,
        language_spoken_at_home, living_situation, profile_picture_url,
        bio, phone_number, userId
    ];

    db.get("SELECT * FROM profiles WHERE user_id = ?", [userId], (err, row) => {
        if (err) {
            console.error("DB error:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        if (row) {
            // Update profile
            const updateQuery = `
                UPDATE profiles SET
                                    first_name = ?, last_name = ?, date_of_birth = ?, address = ?, city_suburb = ?, state = ?, postal_code = ?,
                                    gender = ?, aboriginal_or_torres_strait_islander = ?, language_spoken_at_home = ?, living_situation = ?,
                                    profile_picture_url = ?, bio = ?, phone_number = ?,
                                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
            `;
            db.run(updateQuery, values, function (err) {
                if (err) {
                    console.error("Update error:", err);
                    return res.status(500).json({ success: false, message: "Failed to update profile." });
                }
                return res.json({ success: true });
            });
        } else {
            // Insert profile
            const insertQuery = `
                INSERT INTO profiles (
                    first_name, last_name, date_of_birth, address, city_suburb, state, postal_code, gender,
                    aboriginal_or_torres_strait_islander, language_spoken_at_home, living_situation,
                    profile_picture_url, bio, phone_number, user_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            db.run(insertQuery, values, function (err) {
                if (err) {
                    console.error("Insert error:", err);
                    return res.status(500).json({ success: false, message: "Failed to create profile." });
                }
                return res.json({ success: true });
            });
        }
    });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../db');

// Fetch comments for a specific user and session
router.get("/:userId", (req, res) => {
  const { userId } = req.params;
  const { sessionId } = req.query;

  const sql = `
    SELECT 
      c.content, 
      c.created_at, 
      pr.first_name || ' ' || pr.last_name AS commenter
    FROM comments c
    JOIN users u ON c.commenter_id = u.id
    LEFT JOIN profiles pr ON u.id = pr.user_id
    WHERE c.target_user_id = ? AND c.session_id = ?
  `;

  db.all(sql, [userId, sessionId], (err, rows) => {
    if (err) {
      console.error("Error fetching comments:", err);
      return res.status(500).json({ error: "Failed to fetch comments" });
    }
    res.json(rows);
  });
});

// Add a new comment for a specific user and session
router.post('/:userId', async (req, res) => {
    const { userId } = req.params;
    const { commenterId, content, sessionId } = req.body;

    console.log("Incoming request:", { userId, commenterId, content, sessionId });

    if (!commenterId || !content || !sessionId) {
        console.error("Validation failed: Missing required fields");
        return res.status(400).json({ error: 'Commenter ID, content, and session ID are required' });
    }

    try {
        // Validate that the target user exists
        const targetUser = await db.getAsync(`SELECT id FROM users WHERE id = ?`, [userId]);
        if (!targetUser) {
            console.error("Target user not found:", userId);
            return res.status(404).json({ error: 'Target user not found' });
        }

        // Validate that the commenter exists
        const commenter = await db.getAsync(`SELECT id FROM users WHERE id = ?`, [commenterId]);
        if (!commenter) {
            console.error("Commenter not found:", commenterId);
            return res.status(404).json({ error: 'Commenter not found' });
        }

        // Insert the comment into the database
        console.log("Insert params:", sessionId, userId, commenterId, content);
        const result = await db.runAsync(
            `INSERT INTO comments (session_id, target_user_id, commenter_id, content, created_at)
             VALUES (?, ?, ?, ?, datetime('now'))`,
            [sessionId, userId, commenterId, content]
        );

        console.log("Comment insert result:", result);

        if (result && result.lastID) {
            // Fetch the inserted comment with the correct created_at value and commenter name
            const inserted = await db.getAsync(
                `SELECT 
                    c.id,
                    c.content, 
                    c.created_at, 
                    pr.first_name || ' ' || pr.last_name AS commenter
                 FROM comments c
                 JOIN users u ON c.commenter_id = u.id
                 LEFT JOIN profiles pr ON u.id = pr.user_id
                 WHERE c.id = ?`,
                [result.lastID]
            );
            res.json({
                success: true,
                comment: inserted,
            });
        } else {
            throw new Error('Failed to insert comment');
        }
    } catch (err) {
        console.error("Error adding comment:", err);
        res.status(500).json({ error: 'Failed to add comment' });
    }
});

module.exports = router;

const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "data", "responses.json");

app.use(express.json()); // Parse JSON request bodies
app.use(cors()); // Allow cross-origin requests
app.use(express.static("public")); // Serve frontend files

// Sample survey questions
const questions = [
    { id: 1, text: "Do you prefer cooking?" },
    { id: 2, text: "Do you prefer dogs?" },
    { id: 3, text: "Do you prefer cats?" },
    { id: 4, text: "Do you prefer outdoor activities?" },
    { id: 5, text: "Do you prefer reading books?" }
];

// Endpoint to get survey questions
app.get("/api/questions", (req, res) => {
    res.json(questions);
});

// Endpoint to submit survey responses
app.post("/api/submit", (req, res) => {
    const { role, responses } = req.body; // role should be 'mentor' or 'mentee'
    
    if (!role || !['mentor', 'mentee'].includes(role)) {
        return res.status(400).json({ success: false, message: "Invalid role specified." });
    }
    
    const userResponse = { role, responses };
    
    // Ensure data directory exists
    if (!fs.existsSync("data")) {
        fs.mkdirSync("data");
    }
    
    // Read existing responses
    let storedResponses = [];
    if (fs.existsSync(DATA_FILE)) {
        const fileData = fs.readFileSync(DATA_FILE, "utf8");
        storedResponses = fileData ? JSON.parse(fileData) : [];
    }
    
    // Add new response and save to file
    storedResponses.push(userResponse);
    fs.writeFileSync(DATA_FILE, JSON.stringify(storedResponses, null, 2));
    
    res.json({ success: true, message: "Response recorded successfully." });
});

// Endpoint to match latest mentee with all mentors
app.get("/api/match-mentee", (req, res) => {
    if (!fs.existsSync(DATA_FILE)) {
        return res.json({ success: false, message: "No responses available." });
    }
    
    const fileData = fs.readFileSync(DATA_FILE, "utf8");
    const storedResponses = fileData ? JSON.parse(fileData) : [];
    
    // Separate mentors and mentees
    const mentors = storedResponses.filter(user => user.role === "mentor");
    const mentees = storedResponses.filter(user => user.role === "mentee");
    
    if (mentees.length === 0) {
        return res.json({ success: false, message: "No mentees available for matching." });
    }
    if (mentors.length === 0) {
        return res.json({ success: false, message: "No mentors available for matching." });
    }
    
    // Get the latest mentee
    const latestMentee = mentees[mentees.length - 1].responses;
    
    let matchScores = mentors.map(mentor => {
        let score = 0;
        let totalQuestions = questions.length;
        
        for (let i = 1; i <= totalQuestions; i++) {
            if (latestMentee[`q${i}`] === mentor.responses[`q${i}`]) {
                score += 1;
            }
        }
        
        const matchPercentage = ((score / totalQuestions) * 100).toFixed(2);
        return { mentor, score, matchPercentage };
    });
    
    // Sort by highest score and get top 3 matches
    matchScores.sort((a, b) => b.score - a.score);
    const topMatches = matchScores.slice(0, 3);
    
    res.json({
        success: true,
        message: "Top 3 mentor matches found.",
        matches: topMatches
    });
});

// Ensure public directory exists
if (!fs.existsSync("public")) {
    fs.mkdirSync("public");
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

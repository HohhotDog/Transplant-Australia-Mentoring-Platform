// index.js
const app = require("./app");
const seedSessions = require("./scripts/seedSessions");
const seedAdmin = require("./scripts/seedAdmin");
const seedTestUsers = require("./scripts/seedTestUsers");

// Seed the database
seedSessions();
seedAdmin();
seedTestUsers();

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`✅ Server listening on http://localhost:${PORT}`);
});

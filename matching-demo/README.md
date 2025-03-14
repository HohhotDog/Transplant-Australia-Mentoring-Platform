# Mentor-Mentee Matching Survey

## Overview
A simple survey-based matching system that pairs mentees with the most compatible mentors based on their answers.

## Features
- Users select their role: **Mentor** or **Mentee**.
- Both answer the same set of questions.
- Mentees are matched with the top 3 most compatible mentors.

## Matching Algorithm
- Each mentee's answers are compared with all mentors' answers.
- A score is calculated by simply adding up the number of matching responses.
- Each matching answer gets **1 point**, non-matching answers get **0 points**.
- The top 3 mentors with the highest scores are returned.

## Installation
### Prerequisites
- Ensure you have **Node.js** installed.
- Ensure you have **Git** installed.

### Setup Instructions
1. Clone the repository:
   ```sh
   git clone https://github.com/HohhotDog/Transplant-Australia-Mentoring-Platform.git
   cd matching-demo
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the server:
   ```sh
   node server.js
   ```
4. Open `http://localhost:3000/` in your browser.

## Usage
- Select **Mentor** or **Mentee**.
- Answer all survey questions and submit.
- Mentees click **“Find Top Mentors”** to view matches.

## API Endpoints
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET    | `/api/questions` | Fetch survey questions |
| POST   | `/api/submit` | Submit responses (`mentor` or `mentee`) |
| GET    | `/api/match-mentee` | Get top 3 mentor matches |

## Example
### Submit a Response
```json
{
    "role": "mentor",
    "responses": { "q1": "yes", "q2": "no", "q3": "yes" }
}
```

### Get Matches
```json
{
    "success": true,
    "matches": [
        { "mentor": { "role": "mentor", "responses": { "q1": "yes" } }, "score": 3, "matchPercentage": "100%" }
    ]
}
```

## Future Improvements
- Assign different weights to different questions for better matching.
- Store data in a database.
- Improve matching logic.
- Add a user login system.

## Notes for Team Members
- Ensure all team members **pull the latest changes** before running the project:
  ```sh
  git pull origin main
  ```
- If issues arise, delete `node_modules` and reinstall dependencies:
  ```sh
  rm -rf node_modules package-lock.json
  npm install
  ```

🚀 Ready to match mentees with mentors!


# Mentor-Mentee Matching demo

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
1. Install dependencies:
   ```sh
   npm install express cors
   ```
2. Start the server:
   ```sh
   node server.js
   ```
3. Open `http://localhost:3000/` in your browser.

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




// src/components/Match/MatchesPage.js
import React, { useState, useEffect } from 'react';

const MatchesPage = () => {
  const [mentorMatches, setMentorMatches] = useState([]);
  const [userType, setUserType] = useState(null); // To check if the user is a mentee
  const [userEnneagramType, setUserEnneagramType] = useState(null); 

  // Fetch user data from session or API to get role and enneagram type
  useEffect(() => {
    const userId = sessionStorage.getItem("userId"); // Assume user ID is in sessionStorage
    if (!userId) {
      alert("Please log in first!");
      return;
    }

    // Fetch user role and enneagram type from backend
    fetch(`/api/user-data/${userId}`, { credentials: 'include' })
      .then(response => response.json())
      .then(data => {
        setUserType(data.role);  // Get user role (mentor/mentee)
        setUserEnneagramType(data.enneagramType);  // Get enneagram type of the user
      })
      .catch(err => console.error('Error fetching user data:', err));
  }, []);

  // Fetch mentor matches for mentees
  const findMentorMatches = async () => {
    try {
      const response = await fetch(`/api/match/enneagram/${userEnneagramType}`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        setMentorMatches(data.matches); // Set mentor matches in state
      } else {
        alert("No matches found.");
      }
    } catch (err) {
      console.error("Error finding mentor matches:", err);
    }
  };

  if (userType !== 'mentee') {
    return <p>You must be a mentee to find mentor matches!</p>;
  }

  return (
    <div className="matches-container">
      <h2>Find My Top 3 Mentors</h2>
      <button onClick={findMentorMatches}>Find Mentors</button>
      <div>
        <h3>Top Matches for Type {userEnneagramType}</h3>
        <ul>
          {mentorMatches.length > 0 ? (
            mentorMatches.map((mentor, index) => (
              <li key={index}>
                <span>Mentor: {mentor.username} – Type {mentor.enneagramType}</span>
              </li>
            ))
          ) : (
            <p>No mentor matches found yet.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default MatchesPage;

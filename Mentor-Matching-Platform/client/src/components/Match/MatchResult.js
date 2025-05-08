// src/components/MatchResult.js
import React, { useState } from "react";

function MatchResult() {
  const [matchResult, setMatchResult] = useState(null);

  async function handleMatchRequest() {
    try {
      const sessionId = localStorage.getItem("sessionId"); 
      if (!sessionId) {
        console.error("⚠️ No sessionId found in localStorage");
        alert("Session ID is missing. Please complete the survey steps first.");
        return;
      }
      const res = await fetch(`/api/match-mentee?sessionId=${sessionId}`, {
        credentials: "include",
      });
      const data = await res.json();
      setMatchResult(data);
    } catch (err) {
      console.error("❌ Error fetching match results:", err);
    }
  }

  return (
    <div>
      <button onClick={handleMatchRequest}>🔎 Find a Mentee Match</button>
      {matchResult && (
        <div className="match-result">
          <h3>Match Results</h3>
         
          <pre>{JSON.stringify(matchResult, null, 2)}</pre>
          
        </div>
      )}
    </div>
  );
}

export default MatchResult;

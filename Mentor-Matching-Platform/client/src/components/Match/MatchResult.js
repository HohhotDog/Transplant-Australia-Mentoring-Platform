// src/components/MatchResult.js
import React, { useState } from "react";

function MatchResult() {
  const [matches, setMatches] = useState(null);
  const [error, setError] = useState("");

  async function findMentorMatches() {
    try {
      const res = await fetch("/api/match/by-enneagram", {
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        setMatches(data);
        setError("");
      } else {
        setError(data.message || "No matches found.");
        setMatches(null);
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching matches.");
    }
  }

  return (
    <div className="p-4">
      <button
        onClick={findMentorMatches}
        className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
      >
        🔍 Find My Top 3 Mentors
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {matches && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">
            Top Matches for Type {matches.yourType}
          </h3>
          <ul className="list-disc pl-6">
            {matches.matches.map((m) => (
              <li key={m.id}>
                🧑‍🏫 Mentor: {m.username} – Type {m.enneagramType}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default MatchResult;

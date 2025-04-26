// src/pages/Mentorship/ExploreSessionsPage.js
import React, { useState, useEffect } from 'react';
import SessionCard from '../../components/Session/SessionCard';
/**
 * ExploreSessionsPage component displays a list of Session cards.
 * It fetches sessions from the API and handles loading and error states.
 */
const ExploreSessionsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch all sessions from backend
    fetch('/api/sessions', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then((data) => {
        setSessions(data);
      })
      .catch((err) => {
        console.error('Error fetching sessions:', err);
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-red-600">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Explore Sessions</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.length ? (
          sessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))
        ) : (
          <p>No sessions available.</p>
        )}
      </div>
    </div>
  );
};

export default ExploreSessionsPage;

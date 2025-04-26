// src/pages/Mentorship/MySessions.js
import React, { useState, useEffect } from 'react';
import SessionCard from '../../components/Session/SessionCard';

/**
 * MySessions component fetches the user's applied sessions from the API,
 * then groups them into 'In Progress' and 'Approved' and renders SessionCard for each.
 */
const MySessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch user's sessions from backend
    fetch('/api/my-sessions', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then((data) => setSessions(data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
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

  // Separate sessions by status
  const inProgress = sessions.filter((s) => s.status === 'pending');
  const approved = sessions.filter((s) => s.status === 'approved');

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6">My Sessions</h1>

      <Section title="In Progress">
        {inProgress.length ? (
          inProgress.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))
        ) : (
          <p>No sessions in progress.</p>
        )}
      </Section>

      <Section title="Approved">
        {approved.length ? (
          approved.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))
        ) : (
          <p>No approved sessions.</p>
        )}
      </Section>
    </div>
  );
};

export default MySessions;

/**
 * Section component renders a titled section with a grid of SessionCards.
 */
const Section = ({ title, children }) => (
  <div>
    <h2 className="text-2xl font-semibold mb-4">{title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {children}
    </div>
  </div>
);

// src/pages/Mentorship/MySessions.js
import React from 'react';
import { useMySessions } from '../../hooks/useMySessions';
import SessionCard from '../../components/Session/SessionCard';

/**
 * MySessions component displays the sessions the user has applied to,
 * grouped into "In Progress" and "Approved" sections.
 */
const MySessions = () => {
  const { data, loading, error } = useMySessions();

  // Show loading or error states
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading sessions</div>;

  // Separate sessions by status
  const inProgress = data.filter((session) => session.status === 'in_progress');
  const approved = data.filter((session) => session.status === 'approved');

  return (
    <div className="px-4 py-8 space-y-8">
    <h1 className="text-3xl font-bold mb-6">My Sessions</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <Section title="In Progress">
        {inProgress.length ? (
          inProgress.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))
        ) : (
          <p>No sessions in progress.</p>
        )}
      </Section>
    </div>
     
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
};

export default MySessions;

/**
 * Section component renders a titled section with children elements.
 */
const Section = ({ title, children }) => (
  <div>
    <h2 className="text-2xl font-semibold mb-4">{title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {children}
    </div>
  </div>
);

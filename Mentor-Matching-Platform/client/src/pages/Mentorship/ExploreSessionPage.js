import React from 'react';
import SessionCard from '../../components/Session/SessionCard'; // Adjust the import path based on your project structure

/**
 * ExploreSessionsPage component displays a list of Session cards.
 * It maps through a sessions array and renders a SessionCard for each Session.
 */
const ExploreSessionsPage = () => {
  // Dummy Session data for demonstration
  const sessions = [
    {
      id: '1',
      // The image is stored in the public folder under 'images/sessions'
      image: '/images/sessions/session1.png',
      title: 'Mentorship Session 1',
      description: 'Brief description for mentorship Session 1.',
    },
    {
      id: '2',
      image: '/images/sessions/session2.png',
      title: 'Mentorship Session 2',
      description: 'Brief description for mentorship Session 2.',
    },
    // Add more Session objects as needed
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Explore Sessions</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
    </div>
  );
};

export default ExploreSessionsPage;

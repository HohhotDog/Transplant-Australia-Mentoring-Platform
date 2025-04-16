// src/pages/MentorshipSessionDetailPage.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import SessionDetail from '../../components/session/SessionDetail';

/**
 * MentorshipSessionDetailPage displays session details for mentorship view.
 * It adds an 'Apply' button for users to apply for the session.
 */
const MentorshipSessionDetailPage = () => {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate an API call to fetch session details based on the session id
    const fetchSessionDetail = async () => {
      // Dummy data; replace with a real API call when ready
      const dummyData = {
        id,
        title: `Session Title ${id}`,
        image: `/images/session.png`,
        description: `This is a detailed description for session ${id}.`,
        startDate: '2025-05-01',
        endDate: '2025-05-31'
      };

      // Simulate network delay
      setTimeout(() => {
        setSession(dummyData);
        setLoading(false);
      }, 500);
    };

    fetchSessionDetail();
  }, [id]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <SessionDetail session={session} />
      <div className="mt-6 text-center">
        <button className="bg-btnorange text-white font-semibold py-2 px-4 rounded">
          Apply
        </button>
      </div>
    </div>
  );
};

export default MentorshipSessionDetailPage;

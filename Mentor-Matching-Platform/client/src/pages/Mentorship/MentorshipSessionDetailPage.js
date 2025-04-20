// src/pages/MentorshipSessionDetailPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SessionDetail from '../../components/Session/SessionDetail';

/**
 * MentorshipSessionDetailPage displays Session details for the mentorship view.
 * It includes an 'Apply' button. Once applied, the button shows 'Applied'
 * and becomes disabled while a new 'Cancel Apply' button is added.
 * Clicking 'Cancel Apply' removes the application and updates the state.
 */
const MentorshipSessionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    // Simulate an API call to fetch Session details based on the Session id
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

  // Check if the Session has been applied previously using localStorage
  useEffect(() => {
    const appliedSessions = JSON.parse(localStorage.getItem('appliedSessions') || '[]');
    if (appliedSessions.includes(id)) {
      setApplied(true);
    } else {
      setApplied(false);
    }
  }, [id]);

  // Handle Apply button click
  const handleApply = () => {
    if (applied) return; // Prevent duplicate application
    alert("You have successfully send the application!");
    const appliedSessions = JSON.parse(localStorage.getItem('appliedSessions') || '[]');
    appliedSessions.push(id);
    localStorage.setItem('appliedSessions', JSON.stringify(appliedSessions));
    setApplied(true);
    navigate('/sessions'); // Redirect back to ExploreSessionPage
  };

  // Handle Cancel Apply button click
  const handleCancelApply = () => {
    const appliedSessions = JSON.parse(localStorage.getItem('appliedSessions') || '[]');
    const newAppliedSessions = appliedSessions.filter((sessionId) => sessionId !== id);
    localStorage.setItem('appliedSessions', JSON.stringify(newAppliedSessions));
    setApplied(false);
    alert("You have successfully canceled the application!");
    // Optionally, redirect to another page or refresh the current page
    navigate('/sessions'); // Redirect back to ExploreSessionPage
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <SessionDetail session={session} />
      <div className="mt-6 text-center space-x-4">
        {applied ? (
          <>
            <button
              disabled
              className="bg-gray-500 cursor-not-allowed font-semibold py-2 px-4 rounded"
            >
              Applied
            </button>
            <button
              onClick={handleCancelApply}
              className="bg-btnorange text-white font-semibold py-2 px-4 rounded"
            >
              Cancel Apply
            </button>
          </>
        ) : (
          <button
            onClick={handleApply}
            className="bg-btnorange text-white font-semibold py-2 px-4 rounded"
          >
            Apply
          </button>
        )}
      </div>
    </div>
  );
};

export default MentorshipSessionDetailPage;

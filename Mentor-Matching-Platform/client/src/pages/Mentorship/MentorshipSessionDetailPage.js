// src/pages/Mentorship/MentorshipSessionDetailPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SessionDetail from '../../components/Session/SessionDetail';

/**
 * MentorshipSessionDetailPage fetches session details and manages apply/cancel logic.
 * It uses real API calls for fetching data and updating application status.
 */
const MentorshipSessionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    // Load session detail and check application status
    const loadData = async () => {
      try {
        // Fetch session detail
        const respSession = await fetch(`/api/sessions/${id}`, { credentials: 'include' });
        if (!respSession.ok) {
          throw new Error(`Failed to load session (status ${respSession.status})`);
        }
        const sessionData = await respSession.json();
        setSession(sessionData);

        // Fetch user's applied sessions
        const respMy = await fetch('/api/my-sessions', { credentials: 'include' });
        if (!respMy.ok) {
          throw new Error(`Failed to load user sessions (status ${respMy.status})`);
        }
        const mySessions = await respMy.json();
        // Determine if current session is applied
        const isApplied = mySessions.some((s) => s.id.toString() === id);
        setApplied(isApplied);
      } catch (err) {
        console.error(err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  // Handle apply action
  const handleApply = async () => {
    try {
      const resp = await fetch(`/api/sessions/${id}/apply`, {
        method: 'POST',
        credentials: 'include'
      });
      if (resp.ok) {
        alert('Application sent successfully!');
        setApplied(true);
        navigate('/sessions');
      } else {
        const data = await resp.json();
        alert(data.error || 'Failed to apply');
      }
    } catch (err) {
      console.error(err);
      alert('Network error when applying');
    }
  };

  // Handle cancel application
  const handleCancelApply = async () => {
    try {
      const resp = await fetch(`/api/sessions/${id}/apply`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (resp.ok) {
        const data = await resp.json();
        alert(data.message || 'Cancelled successfully');
        setApplied(false);
        navigate('/sessions');
      } else {
        const data = await resp.json();
        alert(data.error || 'Failed to cancel');
      }
    } catch (err) {
      console.error(err);
      alert('Network error when cancelling');
    }
  };

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
    <div className="max-w-4xl mx-auto p-6">
      {/* Render session details */}
      <SessionDetail session={session} />

      {/* Action buttons */}
      <div className="mt-6 text-center space-x-4">
        {applied ? (
          <>  
            {/* Disabled applied button */}
            <button
              disabled
              className="bg-gray-500 cursor-not-allowed font-semibold py-2 px-4 rounded"
            >
              Applied
            </button>
            {/* Cancel apply button */}
            <button
              onClick={handleCancelApply}
              className="bg-btnorange text-white font-semibold py-2 px-4 rounded"
            >
              Cancel Apply
            </button>
          </>
        ) : (
          // Apply button for new applications
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

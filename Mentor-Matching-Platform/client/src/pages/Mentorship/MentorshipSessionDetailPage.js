// src/pages/Mentorship/MentorshipSessionDetailPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SessionDetail from '../../components/Session/SessionDetail';

/**
 * MentorshipSessionDetailPage handles session detail display,
 * role selection on apply, and cancel application with role info.
 */
const MentorshipSessionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applied, setApplied] = useState(false);

  // For new application: track selected role
  const [role, setRole] = useState('mentee');
  // For existing application: record applied role
  const [appliedRole, setAppliedRole] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch session detail
        const respSession = await fetch(`/api/sessions/${id}`, { credentials: 'include' });
        if (!respSession.ok) throw new Error(`Failed to load session (status ${respSession.status})`);
        const sessionData = await respSession.json();
        setSession(sessionData);

        // Fetch user's applications
        const respMy = await fetch('/api/my-sessions', { credentials: 'include' });
        if (!respMy.ok) throw new Error(`Failed to load user sessions (status ${respMy.status})`);
        const mySessions = await respMy.json();

        // Check if applied and record role
        const myApp = mySessions.find((s) => s.id.toString() === id);
        if (myApp) {
          setApplied(true);
          setAppliedRole(myApp.role);
        }
      } catch (err) {
        console.error(err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  // Apply with selected role
  const handleApply = async () => {
    try {
      const resp = await fetch(`/api/sessions/${id}/apply`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      if (resp.ok) {
        alert('Application sent successfully!');
        setApplied(true);
        setAppliedRole(role);
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

  // Cancel application
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

  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>;
  if (error) return <div className="container mx-auto px-4 py-8 text-red-600">Error: {error.message}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <SessionDetail session={session} />

      <div className="mt-6 text-center space-y-4">
        {applied ? (
          <>
            <div>Applied Role: <strong>{appliedRole}</strong></div>
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
          <>
            {/* Role selection */}
            <div className="space-x-4">
              <label>
                <input
                  type="radio"
                  name="role"
                  value="mentor"
                  checked={role === 'mentor'}
                  onChange={() => setRole('mentor')}
                /> Mentor
              </label>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="mentee"
                  checked={role === 'mentee'}
                  onChange={() => setRole('mentee')}
                /> Mentee
              </label>
            </div>
            <button
              onClick={handleApply}
              className="bg-btnorange text-white font-semibold py-2 px-4 rounded"
            >
              Apply
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MentorshipSessionDetailPage;

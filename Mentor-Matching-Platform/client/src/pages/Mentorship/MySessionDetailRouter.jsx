// src/pages/Mentorship/MySessionDetailRouter.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MentorshipSessionDetailPage from './MentorshipSessionDetailPage';
import ApprovedSessionDetailPage from './ApprovedSessionDetailPage';

export default function MySessionDetailRouter() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch user's sessions from backend
    fetch('/api/my-sessions', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then(data => {
        const s = data.find(item => item.id.toString() === id);
        if (!s) throw new Error('Session not found in your list');
        setSession(s);
      })
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error)  return <div className="text-red-600">Error: {error.message}</div>;

  // Check status and render appropriate component

  if (session.status === 'approved') {
    return <ApprovedSessionDetailPage session={session} />;
  } else {
    // Assuming 'pending' or other statuses are handled in MentorshipSessionDetailPage
    return <MentorshipSessionDetailPage session={session}/>;
  }
}

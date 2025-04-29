// src/pages/AdminPage.js
// src/pages/AdminPage.jsx
import React, { useState, useEffect } from 'react';
import SessionTable from '../../components/Admin/SessionTable';

const AdminPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/admin/sessions')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        setSessions(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="p-4">Loading sessions...</p>;
  if (error) return <p className="p-4 text-red-500">Error: {error.message}</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Admin Dashboard</h2>
      <SessionTable sessions={sessions} />
    </div>
  );
};

export default AdminPage;

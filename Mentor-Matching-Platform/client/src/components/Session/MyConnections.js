// src/components/Session/MyConnections.js
import React, { useEffect, useState } from 'react';

export default function MyConnections({ sessionId }) {
  const [connections, setConnections] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  useEffect(() => {
    async function fetchConnections() {
      try {
        const res = await fetch(`/api/sessions/${sessionId}/matches`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        setConnections(data);
      } catch (err) {
        setError(err.message || 'Failed to load connections');
      } finally {
        setLoading(false);
      }
    }
    fetchConnections();
  }, [sessionId]);

  if (loading) return <p className="text-gray-500">Loading connections…</p>;
  if (error)   return <p className="text-red-500">Error: {error}</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Your Mentor Connections</h2>
      {connections.length === 0 ? (
        <p className="text-gray-700">
          No connections yet. Please wait for admin approval.
        </p>
      ) : (
        connections.map(({ pairId, other, createdAt }) => (
          <div key={pairId} className="mb-3 p-4 border rounded-lg shadow-sm">
            <p>
              <strong>{other.email}</strong>
            </p>
            <p className="text-sm text-gray-500">
              Matched on {new Date(createdAt).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

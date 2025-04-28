
// src/pages/AdminApplicationDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

// AdminApplicationDetailPage: view and update application status
export default function AdminApplicationDetailPage() {
  const { sessionId, applicationId } = useParams();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Fetch application details
  useEffect(() => {
    fetch(`/api/admin/sessions/${sessionId}/applications/${applicationId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load application');
        return res.json();
      })
      .then(data => {
        setApp(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch application error:', err);
        setError(err);
        setLoading(false);
      });
  }, [sessionId, applicationId]);

  // Update status helper
  const updateStatus = (newStatus) => {
    console.log('Updating status to', newStatus);
    setUpdating(true);
    fetch(
      `/api/admin/sessions/${sessionId}/applications/${applicationId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      }
    )
      .then(res => {
        if (!res.ok) throw new Error(`Status update failed: ${res.status}`);
        return res.json();
      })
      .then(({ status }) => {
        console.log('Status updated to', status);
        setApp(prev => ({ ...prev, status }));
      })
      .catch(err => {
        console.error('Update status error:', err);
        setError(err);
      })
      .finally(() => setUpdating(false));
  };

  if (loading) return <p className="p-4">Loading details...</p>;
  if (error) return <p className="p-4 text-red-500">Error: {error.message}</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Application Details</h2>

      {/* Applicant Email */}
      <div className="mb-4">
        <h3 className="text-lg font-medium">Email</h3>
        <p>{app.email}</p>
      </div>

      {/* Applied Role */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-1">Applied Role</h3>
        <p>{app.role}</p>
      </div>

      {/* Personal Profile Placeholder */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-1">Personal Profile</h3>
        <div className="p-4 bg-gray-50 rounded">Profile details placeholder</div>
      </div>

      {/* Mentorship Preferences Placeholder */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-1">Mentorship Preferences</h3>
        <div className="p-4 bg-gray-50 rounded">Preferences placeholder</div>
      </div>

      {/* Current Status */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-1">Current Status</h3>
        <span
          className={`px-2 py-1 rounded-full text-sm ${
            app.status === 'approved'
              ? 'bg-green-100 text-green-800'
              : app.status === 'onhold'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {app.status}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={() => updateStatus('approved')}
          disabled={updating}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Approve
        </button>
        <button
          onClick={() => updateStatus('onhold')}
          disabled={updating}
          className="px-4 py-2 bg-yellow-500 text-white rounded"
        >
          On Hold
        </button>
      </div>
    </div>
  );
}


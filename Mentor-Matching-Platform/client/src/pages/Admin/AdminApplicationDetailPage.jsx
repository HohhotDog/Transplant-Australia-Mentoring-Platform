import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Toggle mock data for testing
const USE_MOCK_RECOMMEND = true;

function AdminApplicationDetailPage() {
  const { sessionId, applicationId } = useParams();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendedMentors, setRecommendedMentors] = useState(
    USE_MOCK_RECOMMEND
      ? [
          { id: 101, name: 'Mock Mentor A', avatar: null },
          { id: 102, name: 'Mock Mentor B', avatar: 'https://via.placeholder.com/150' },
        ]
      : []
  );
  const [recLoading, setRecLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/sessions/${sessionId}/applications/${applicationId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch application: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setApp(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch application error:", err);
        setError(err);
        setLoading(false);
      });
  }, [sessionId, applicationId]);

  useEffect(() => {
    if (app?.role?.toLowerCase() === 'mentee') {
      setRecLoading(true);
      fetch(`/api/match-mentee?sessionId=${sessionId}`, { credentials: 'include' })
        .then(res => {
          if (!res.ok) throw new Error(`Failed to fetch recommended mentors: ${res.status}`);
          return res.json();
        })
        .then(data => setRecommendedMentors(data))
        .catch(err => console.error('Error fetching recommended mentors:', err))
        .finally(() => setRecLoading(false));
    }
  }, [app, sessionId]);

  const updateStatus = (newStatus) => {
    setUpdating(true);
    fetch(`/api/admin/sessions/${sessionId}/applications/${applicationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Status update failed: ${res.status}`);
        return res.json();
      })
      .then(({ status }) => {
        setApp((prev) => ({ ...prev, status }));
      })
      .catch((err) => {
        console.error("Update status error:", err);
        setError(err);
      })
      .finally(() => setUpdating(false));
  };

  if (loading) return <p className="p-4">Loading details...</p>;
  if (error) return <p className="p-4 text-red-500">Error: {error.message}</p>;

  // Assign mentor to this application
  const assignMentor = (mentor) => {
    setUpdating(true);
    fetch('/api/matching-pairs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        sessionId,
        applicationId,
        mentorId: mentor.id,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to assign mentor: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log('Assigned mentor pair:', data);
        // You can update state or show a notification here
      })
      .catch((err) => console.error('Assign mentor error:', err))
      .finally(() => setUpdating(false));
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded shadow">
      {/* Top header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Mentorship Application Details</h2>
          <p className="text-sm text-gray-500 mt-1">Session ID: {sessionId}</p>
        </div>
      </div>

      {/* Applied Role */}
      <div className="mb-6">
        <h3 className="text-lg font-medium">Applied Role</h3>
        <p>{app?.role}</p>
      </div>

      {/* Personal Profile */}
      <div className="mb-6">
        <h3 className="text-lg font-medium">Personal Profile</h3>
        <div className="p-4 bg-gray-50 rounded text-gray-700">
          {app?.profile ? (
            Object.entries(app.profile).map(([key, value]) => (
              <div key={key} className="mb-1">
                <span className="font-semibold capitalize">{key}:</span>{" "}
                <span>{String(value)}</span>
              </div>
            ))
          ) : (
            "No profile information available."
          )}
        </div>
      </div>

      {/* Mentorship Preferences */}
      <div className="mb-6">
        <h3 className="text-lg font-medium">Mentorship Preferences</h3>
        <div className="p-4 bg-gray-50 rounded text-gray-700">
          {app?.preferences ? (
            Object.entries(app.preferences).map(([key, value]) => (
              <div key={key} className="mb-1">
                <span className="font-semibold capitalize">{key}:</span>{" "}
                <span>{String(value)}</span>
              </div>
            ))
          ) : (
            "No preferences information available."
          )}
        </div>
      </div>

      {app?.role?.toLowerCase() === "mentee" && (
        <>
          {/* Recommended Mentors */}
          <div className="mb-6">
            <h3 className="text-lg font-medium">Recommended Mentors</h3>
            {recLoading ? (
              <p className="text-gray-500">Loading recommended mentors...</p>
            ) : recommendedMentors.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {recommendedMentors.map((mentor) => (
                  <div
                    key={mentor.id}
                    onClick={() => !updating && assignMentor(mentor)}
                    className="cursor-pointer flex items-center space-x-3 p-3 border rounded shadow-sm hover:shadow-md transition"
                  >
                    <img
                      src={mentor.avatar || "/placeholder-avatar.jpg"}
                      alt={mentor.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="font-medium">{mentor.name}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No recommended mentors available now</p>
            )}
          </div>

          {/* Assign Another Mentor */}
          <div className="mb-6">
            <h3 className="text-lg font-medium">Assign Another Mentor</h3>
            <div className="p-4 bg-gray-50 rounded text-gray-700">
              <input
                type="text"
                placeholder="Search mentors..."
                className="w-full p-2 border rounded"
              />
              <p className="mt-2 text-gray-500 text-sm">Mentor details will appear here after selection</p>
            </div>
          </div>

      {/* Photo */}
      <div className="mb-6">
        <h3 className="text-lg font-medium">Photo</h3>
        <img
          src={app?.role === "Mentor" ? "/mentor-photo.jpg" : "/mentee-photo.jpg"}
          alt={`${app?.role} Session`}
          className="rounded-lg w-full max-w-2xl mx-auto"
        />
      </div>
      
      {/* Admin Comments */}
      <div className="mb-6">
            <h3 className="text-lg font-medium">Admin Comments</h3>
            {app?.adminComments && app.adminComments.length > 0 ? (
              <ul className="space-y-4 max-h-64 overflow-y-auto border p-4 rounded bg-gray-50">
                {app.adminComments.map((comment) => (
                  <li key={comment.id} className="border-b pb-2 last:border-b-0">
                    <div className="text-xs text-gray-500">
                      {new Date(comment.timestamp).toLocaleString()} by {comment.author}
                    </div>
                    <div className="mt-1 text-gray-700 whitespace-pre-wrap">{comment.content}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No admin comments available.</p>
            )}
          </div>
        </>
      )}

      {/* Current Status */}
      <div className="mb-6">
        <h3 className="text-lg font-medium">Current Status</h3>
        <span
          className={`px-2 py-1 rounded-full text-sm ${
            app?.status === "approved"
              ? "bg-green-100 text-green-800"
              : app?.status === "onhold"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {app?.status}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={() => updateStatus("approved")}
          disabled={updating}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Approve
        </button>
        <button
          onClick={() => updateStatus("onhold")}
          disabled={updating}
          className="px-4 py-2 bg-yellow-500 text-white rounded"
        >
          On Hold
        </button>
      </div>
    </div>
  );
}

export default AdminApplicationDetailPage;
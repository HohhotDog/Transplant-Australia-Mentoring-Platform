import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

// AdminApplicationsPage: list all applications for a given session with role tabs
export default function AdminApplicationsPage() {
  const { sessionId } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleFilter, setRoleFilter] = useState('mentor');

  useEffect(() => {
    fetch(`/api/admin/sessions/${sessionId}/applications`)
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        setApplications(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err);
        setLoading(false);
      });
  }, [sessionId]);

  if (loading) return <p className="p-4">Loading applications...</p>;
  if (error) return <p className="p-4 text-red-500">Error: {error.message}</p>;

  const filtered = applications.filter(app => app.role === roleFilter);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Applications</h2>
      <div className="flex space-x-4 border-b mb-4">
        {['mentor', 'mentee'].map(role => (
          <button
            key={role}
            className={`bg-2-brown pb-2 text-sm font-medium ${
              role === roleFilter ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600'
            }`}
            onClick={() => setRoleFilter(role)}
          >
            {role === 'mentor' ? 'Mentors' : 'Mentees'}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left">Email</th>
              <th className="py-2 px-4 text-left">Application Date</th>
              <th className="py-2 px-4 text-left">Status</th>
              <th className="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(app => (
              <tr key={app.id} className="border-t">
                <td className="py-2 px-4">{app.email}</td>
                <td className="py-2 px-4">{app.applicationDate.split('T')[0]}</td>
                <td className="py-2 px-4">
                  <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-sm capitalize">
                    {app.status}
                  </span>
                </td>
                <td className="py-2 px-4">
                  <Link
                    to={`/admin/sessions/${sessionId}/applications/${app.id}`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 px-4 text-center text-gray-500">
                  No {roleFilter === 'mentor' ? 'mentor' : 'mentee'} applications.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// src/components/admin/SessionRow.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const SessionRow = ({ session }) => (
  <tr className="border-t">
    <td className="py-2 px-4">{session.title}</td>
    <td className="py-2 px-4">
      {session.start_date && session.end_date ? (
        `${new Date(session.start_date).toLocaleDateString()} – ${new Date(session.end_date).toLocaleDateString()}`
      ) : session.timeFrame && session.timeFrame.includes('T') ? (
        // Parse and format ISO–ISO string
        (() => {
          const parts = session.timeFrame.split('–').map(s => s.trim());
          if (parts.length === 2) {
            return `${new Date(parts[0]).toLocaleDateString()} – ${new Date(parts[1]).toLocaleDateString()}`;
          }
          return session.timeFrame;
        })()
      ) : (
        session.timeFrame || ''
      )}
    </td>
    <td className="py-2 px-4">{session.participants}</td>
    <td className="py-2 px-4">{session.pendingApplications}</td>
    <td className="py-2 px-4 capitalize">
      <span
        className={`px-2 py-1 rounded-full text-sm ${
          session.status === 'active'
            ? 'bg-green-100 text-green-800'
            : session.status === 'available'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        {session.status}
      </span>
    </td>
    <td className="py-2 px-4">{session.creator}</td>
    <td className="py-2 px-4 space-x-2">
      <Link to={`/sessions/${session.id}`} className="text-blue-600 hover:underline text-sm">
        Details
      </Link>
      <Link
        to={`/admin/sessions/${session.id}/applications`}
        className="text-blue-600 hover:underline text-sm"
      >
        Applications
      </Link>
      <Link
        to={`/admin/sessions/${session.id}/participants`}
        className="text-blue-600 hover:underline text-sm"
      >
        Participants
      </Link>
    </td>
  </tr>
);

export default SessionRow;
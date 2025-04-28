// src/components/admin/SessionTable.jsx
import React from 'react';
import SessionRow from './SessionRow';

const SessionTable = ({ sessions }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
      <thead>
        <tr className="bg-gray-100">
          <th className="py-2 px-4 text-left">Session Name</th>
          <th className="py-2 px-4 text-left">Time Frame</th>
          <th className="py-2 px-4 text-left">Participants</th>
          <th className="py-2 px-4 text-left">Pending Applications</th>
          <th className="py-2 px-4 text-left">Status</th>
          <th className="py-2 px-4 text-left">Creator</th>
          <th className="py-2 px-4 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {sessions.map(session => (
          <SessionRow key={session.id} session={session} />
        ))}
      </tbody>
    </table>
  </div>
);

export default SessionTable;
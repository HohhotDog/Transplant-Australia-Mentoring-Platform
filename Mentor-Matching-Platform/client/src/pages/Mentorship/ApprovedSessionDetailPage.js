// src/pages/Mentorship/ApprovedSessionDetailPage.js
import React from 'react';
import SessionDetail from '../../components/Session/SessionDetail';

/**
 * ApprovedSessionDetailPage
 *
 * Displays detailed information for a session that has already been approved.
 * After approval, the user can view mentor matches or other follow-up actions.
 *
 * Props:
 * - session: object containing { id, title, image, description, startDate, endDate, status }
 */
const ApprovedSessionDetailPage = ({ session }) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Reuse the SessionDetail component to show core session info */}
      <SessionDetail session={session} />

      {/* Additional approved-only actions */}
      <div className="mt-6 text-center">
        <button className="bg-green-600 text-white font-semibold py-2 px-4 rounded">
          View Mentor Matches
        </button>
      </div>
    </div>
  );
};

export default ApprovedSessionDetailPage;

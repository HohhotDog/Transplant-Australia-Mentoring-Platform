// src/components/Session/SessionDetail.js
import React from 'react';

/**
 * SessionDetail component displays details of a session.
 * It shows the title, image, description, start date, and end date.
 */
const SessionDetail = ({ session }) => {
  const { title, image, description, startDate, endDate } = session;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Session image */}
      <img
        src={image}
        alt={title}
        className="w-full h-64 object-cover rounded-md mb-4"
      />
      {/* Session title */}
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      {/* Session description */}
      <p className="text-lg text-gray-700 mb-4">{description}</p>
      {/* Session dates */}
      <div className="text-gray-600 text-sm mb-2">
        <span className="font-semibold">Start Date:</span> {startDate}
      </div>
      <div className="text-gray-600 text-sm">
        <span className="font-semibold">End Date:</span> {endDate}
      </div>
    </div>
  );
};

export default SessionDetail;

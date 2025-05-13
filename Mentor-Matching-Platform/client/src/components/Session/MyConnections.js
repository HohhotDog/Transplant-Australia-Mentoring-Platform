// src/components/Session/MyConnections.js
import React from 'react';
 
const MyConnections = ({ sessionId }) => {
  // You can fetch or receive connection data based on sessionId
  return (
<div>
<h2 className="text-xl font-semibold mb-4">Your Mentor Connections</h2>
<p className="text-gray-700">[TODO: Display connections here for session ID {sessionId}]</p>
</div>
  );
};
 
export default MyConnections;
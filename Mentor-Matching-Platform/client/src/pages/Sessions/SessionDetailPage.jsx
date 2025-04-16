import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

/**
 * SessionDetailPage component displays detailed information for a session.
 * It uses the session id from URL parameters to fetch (or load) session details.
 */
const SessionDetailPage = () => {
  // Get the session id from route parameters
  const { id } = useParams();
  
  // State for session details and loading status
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate an API call to fetch session details based on the session id
    const fetchSessionDetail = async () => {
      // Dummy data for demonstration; replace with a real API call when ready
      const dummyData = {
        id,
        image: `/images/session.png`,
        title: `Session Title ${id}`,
        description: `This is a detailed description for session ${id}.`,
      };

      // Simulate network delay
      setTimeout(() => {
        setSession(dummyData);
        setLoading(false);
      }, 500);
    };

    fetchSessionDetail();
  }, [id]);

  // Display a loading state if data is not yet available
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Session image */}
      <img
        src={session.image}
        alt={session.title}
        className="w-full h-64 object-cover rounded-md mb-4"
      />
      {/* Session title */}
      <h1 className="text-3xl font-bold mb-4">{session.title}</h1>
      {/* Session description */}
      <p className="text-lg text-gray-700 mb-6">{session.description}</p>
      {/* Additional session details or actions can be added here */}
    </div>
  );
};

export default SessionDetailPage;

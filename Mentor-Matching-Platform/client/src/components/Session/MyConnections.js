import React, { useEffect, useState } from 'react';

const MyConnections = ({ sessionId }) => {
  const [mentor, setMentor] = useState(null);

  useEffect(() => {
    // Mock data — replace with real fetch later
    const mockMentor = {
      name: 'Emma Johnson',
      email: 'emma.johnson@example.com',
      phone: '+1-555-987-6543',
      role: 'Mentor',
      transplantYear: 2018,
      photo: 'https://randomuser.me/api/portraits/women/44.jpg',
    };

    setTimeout(() => setMentor(mockMentor), 300);
  }, [sessionId]);

  if (!mentor) return <p className="text-gray-500">Loading connection info...</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-semibold text-center mb-4">My Mentor</h2>

      <div className="flex flex-col items-center text-center space-y-2 mb-6">
        <img
          src={mentor.photo}
          alt={mentor.name}
          className="w-28 h-28 rounded-full object-cover"
        />
        <h3 className="text-xl font-bold">{mentor.name}</h3>
      </div>

      <hr className="border-t border-gray-300 mb-6" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-left text-sm">
        <div>
          <h4 className="font-semibold text-base mb-1">Contact Information</h4>
          <p><span className="text-gray-500">Email:</span> <a href={`mailto:${mentor.email}`} className="text-blue-600 underline">{mentor.email}</a></p>
          <p><span className="text-gray-500">Phone:</span> {mentor.phone}</p>
        </div>

        <div>
          <h4 className="font-semibold text-base mb-1">Participant Role</h4>
          <p>{mentor.role}</p>

          <h4 className="font-semibold text-base mt-4 mb-1">Transplant Information</h4>
          <p><span className="text-gray-500">Most Recent Transplant:</span> {mentor.transplantYear}</p>
        </div>
      </div>
    </div>
  );
};

export default MyConnections;

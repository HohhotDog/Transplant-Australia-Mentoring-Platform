import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for routing

/**
 * SessionCard component displays a Session card with image, title, and description.
 * When clicked, it navigates to the Session detail page.
 */
const SessionCard = ({ session }) => {
  // Destructure Session properties
  const { id, image, title, description } = session;

  return (
    <Link to={`/sessions/${id}`} className="block">
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition duration-300">
        {/* Session image */}
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <div className="p-4">
          {/* Session title */}
          <h3 className="text-xl font-bold">{title}</h3>
          {/* Session description */}
          <p className="mt-2 text-gray-600 text-sm">{description}</p>
        </div>
      </div>
    </Link>
  );
};

export default SessionCard;

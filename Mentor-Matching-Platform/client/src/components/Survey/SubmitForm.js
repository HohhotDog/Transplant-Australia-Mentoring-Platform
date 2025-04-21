// src/components/Survey/SubmitForm.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import celebrationImg from '../../assets/submitpicture.png'; // replace with actual path

const SubmitForm = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-center">

      <div className="bg-white rounded-lg shadow-md p-8">
        <img
          src={celebrationImg}
          alt="Celebration"
          className="mx-auto mb-8 rounded-lg max-w-full h-auto"
        />

        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">
          Application Submitted Successfully
        </h1>

        <p className="text-gray-600 mb-2 max-w-xl mx-auto text-center">
  Your mentorship application has been received.
</p>
<p className="text-gray-600 mb-6 max-w-xl mx-auto text-center">
  Our team is reviewing it, and you’ll hear from us within 3–5 business days.<br />
  We will contact you with details of your mentor match!
</p>


        <button
          onClick={() => navigate('/dashboard')}
          className="bg-orange-600 text-white font-semibold px-6 py-2 rounded hover:bg-orange-700"
        >
          Back to Connections
        </button>
      </div>
    </div>
  );
};

export default SubmitForm;

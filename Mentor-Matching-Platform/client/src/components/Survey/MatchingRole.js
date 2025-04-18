import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MatchingRole = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    localStorage.setItem('selectedRole', role); // Store for later use
  };

  const handleNext = () => {
    if (!selectedRole) {
      alert('Please select a role before proceeding.');
      return;
    }
    navigate('/survey/preferences'); // You’ll build this next
  };

  const inputStyle = "w-full p-2 border border-gray-300 rounded-md mb-4 bg-gray-100";
  const labelStyle = "font-medium mb-1 block";

  return (
    <div className="max-w-2xl mx-auto p-8 text-left">
      <h1 className="text-3xl font-bold mb-8">Mentorship Application</h1>

      <h2 className="text-xl font-semibold mb-2">Choose Your Role</h2>
      <p className="mb-4">I’m applying to:</p>

      <div className="flex gap-4 mb-8">
      <button
  type="button"
  onClick={() => handleRoleSelect("mentor")}
  className={`px-4 py-2 rounded border ${
    selectedRole === 'mentor'
      ? 'bg-orange-500 text-white border-orange-500'
      : 'bg-[#f8f4ee] text-black border-[#f8f4ee]'
  } hover:border-gray-300 hover:shadow-md transition duration-200 ease-in-out`}  
>
  Become a mentor
</button>


  <button
    type="button"
    onClick={() => handleRoleSelect("mentee")}
    className={`px-4 py-2 rounded border ${
        selectedRole === 'mentee'
          ? 'bg-orange-500 text-white border-orange-500'
          : 'bg-[#f8f4ee] text-black border-[#f8f4ee]'
      } hover:border-gray-300 hover:shadow-md transition duration-200 ease-in-out`}
      >
    Find a mentor
  </button>
</div>


      <h2 className="text-xl font-semibold mb-4">Confirm Your Personal Details</h2>

      <div>
        <label className={labelStyle}>First Name</label>
        <input type="text" className={inputStyle} disabled placeholder="Will be auto-filled later" />

        <label className={labelStyle}>Last Name</label>
        <input type="text" className={inputStyle} disabled />

        <label className={labelStyle}>Date of Birth</label>
        <input type="date" className={inputStyle} disabled />

        <label className={labelStyle}>Address</label>
        <input type="text" className={inputStyle} disabled />

        <label className={labelStyle}>Gender</label>
        <input type="text" className={inputStyle} disabled />

        <label className={labelStyle}>Aboriginal or Torres Strait Islander</label>
        <input type="text" className={inputStyle} disabled />

        <label className={labelStyle}>Language Other Than English Spoken at Home</label>
        <input type="text" className={inputStyle} disabled />

        <label className={labelStyle}>Living Situation</label>
        <input type="text" className={inputStyle} disabled />
      </div>

      <div className="flex justify-end mt-8">
        <button
          type="button"
          onClick={handleNext}
          className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600 flex items-center gap-2"
        >
          <span>Next</span>
          <span>➔</span>
        </button>
      </div>
    </div>
  );
};

export default MatchingRole;

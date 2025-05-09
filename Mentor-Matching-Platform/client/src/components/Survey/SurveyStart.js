// src/components/Survey/SurveyStart.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// read url parameter
import { useSearchParams } from 'react-router-dom';

const SurveyStart = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [profile, setProfile] = useState({});
  const [isLocked, setIsLocked] = useState(false);
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const roleFromUrl = searchParams.get('role');
  


  useEffect(() => {
    if (!sessionId) return;  
  
    fetch(`/api/form-status?sessionId=${sessionId}`, {
      method: 'GET',
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.submitted) {
          setIsLocked(true);
        }
      })
      .catch(err => console.error("⚠️ Error checking form status:", err));
  }, [sessionId]);
  

  useEffect(() => {
    fetch('/api/profile', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProfile(data.profile);
        } else {
          console.warn("No profile found or incomplete.");
        }
      })
      .catch(err => console.error("Failed to fetch profile", err));
  }, []);

  useEffect(() => {
    if (roleFromUrl) {
        setSelectedRole(roleFromUrl);
        setIsLocked(true); 
    }
}, [roleFromUrl]);


  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleNext = () => {
    if (!selectedRole) {
      alert('Please select a role before proceeding.');
      return;
    }
    navigate(`/survey/preferences?sessionId=${sessionId}&role=${selectedRole}`);
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
          disabled={isLocked}
          className={`px-4 py-2 rounded border ${
            selectedRole === 'mentor'
              ? 'bg-orange-500 text-white border-orange-500'
              : 'bg-[#f8f4ee] text-black border-[#f8f4ee]'
          } ${isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-300 hover:shadow-md'} transition duration-200 ease-in-out`}
        >
          Become a mentor
        </button>

        <button
          type="button"
          onClick={() => handleRoleSelect("mentee")}
          disabled={isLocked}
          className={`px-4 py-2 rounded border ${
            selectedRole === 'mentee'
              ? 'bg-orange-500 text-white border-orange-500'
              : 'bg-[#f8f4ee] text-black border-[#f8f4ee]'
          } ${isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-300 hover:shadow-md'} transition duration-200 ease-in-out`}
        >
          Find a mentor
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-4">Confirm Your Personal Details</h2>

      <div>
        <label className={labelStyle}>First Name</label>
        <input type="text" className={inputStyle} value={profile.first_name || ''} disabled />

        <label className={labelStyle}>Last Name</label>
        <input type="text" className={inputStyle} value={profile.last_name || ''} disabled />

        <label className={labelStyle}>Date of Birth</label>
        <input type="text" className={inputStyle} value={profile.date_of_birth || ''} disabled />

        <label className={labelStyle}>Address</label>
        <input type="text" className={inputStyle} value={profile.address || ''} disabled />

        <label className={labelStyle}>Gender</label>
        <input type="text" className={inputStyle} value={profile.gender || ''} disabled />

        <label className={labelStyle}>Aboriginal or Torres Strait Islander</label>
        <input
          type="text"
          className={inputStyle}
          value={
            profile.aboriginal_or_torres_strait_islander === 'Yes' || profile.aboriginal_or_torres_strait_islander === true
              ? 'Yes'
              : 'No'
          }
          disabled
        />

        <label className={labelStyle}>Language Other Than English Spoken at Home</label>
        <input type="text" className={inputStyle} value={profile.language_spoken_at_home || ''} disabled />

        <label className={labelStyle}>Living Situation</label>
        <input type="text" className={inputStyle} value={profile.living_situation || ''} disabled />
      </div>

      <div className="flex justify-end mt-8">
      <button
  type="button"
  onClick={handleNext}
  className={`px-6 py-2 rounded flex items-center gap-2 text-white ${
    !selectedRole
      ? 'bg-gray-400 cursor-not-allowed'
      : 'bg-orange-500 hover:bg-orange-600'
  }`}
  disabled={!selectedRole}  
>
  <span>Next</span>
  <span>➔</span>
</button>

      </div>
    </div>
  );
};

export default SurveyStart;

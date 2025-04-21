// src/components/Survey/MatchingPreferences.js

import React, { useState } from 'react';
import Select from 'react-select';

const transplantOptions = [
    { value: 'Bone Marrow', label: 'Bone Marrow' },
    { value: 'Pancreas', label: 'Pancreas' },
    { value: 'Kidney', label: 'Kidney' },
    { value: 'Liver', label: 'Liver' },
    { value: 'Heart', label: 'Heart' },
    { value: 'Lung', label: 'Lung' },
    { value: 'Cornea', label: 'Cornea' },
    { value: 'Other Tissue', label: 'Other Tissue' },
    { value: 'Not Applicable', label: 'Not Applicable' },
  ];

  const sportsOptions = [
    { value: 'Running', label: 'Running' },
    { value: 'Pilates/Yoga', label: 'Pilates/Yoga' },
    { value: 'Cycling', label: 'Cycling' },
    { value: 'Triathlon', label: 'Triathlon' },
    { value: 'Swimming', label: 'Swimming' },
    { value: 'Bowls/Petanque', label: 'Bowls/Petanque' },
    { value: 'Ball Sports', label: 'Ball Sports (Football, Volleyball, etc.)' },
    { value: 'Walking', label: 'Walking' },
    { value: 'Board Games', label: 'Board Games' },
  ];
  

const MatchingPreferences = () => {
  const [formData, setFormData] = useState({
    participantRole: '',
    transplantType: [],
    transplantYear: '',
    meetingPreference: '',
    sportsInterests: [],
    supportNeeds: []
  });


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      supportNeeds: checked
        ? [...prev.supportNeeds, value]
        : prev.supportNeeds.filter(item => item !== value)
    }));
  };

  return (
    <div className="max-w-3xl mx-auto p-8 text-left">
      <h1 className="text-3xl font-bold mb-4">Confirm Your Preferences</h1>
      <p className="mb-6 text-gray-600">
        Please fill in the following information to help us match you effectively.
      </p>

      {/* Participant Role */}
      <label className="block font-medium mb-1">Participant Role</label>
      <select
        name="participantRole"
        value={formData.participantRole}
        onChange={handleChange}
        className="w-full p-2 mb-4 border border-gray-300 rounded"
      >
        <option value="">Choose your role</option>
        <option>Recipient</option>
        <option>Carer</option>
        <option>Living Donor</option>
        <option>Donor Family</option>
        <option>Waiting for Transplant</option>
        <option>Dialysis</option>
        <option>Health Professional</option>
        <option>Sports Coach/Professional</option>
      </select>

      {/* Transplant Type */}
<label className="block font-medium mb-1">Transplant Type</label>
<Select
  isMulti
  options={transplantOptions}
  value={transplantOptions.filter(option =>
    formData.transplantType.includes(option.value)
  )}
  onChange={(selectedOptions) => {
    setFormData(prev => ({
      ...prev,
      transplantType: selectedOptions.map(option => option.value),
    }));
  }}
  className="mb-4"
/>
      {/* Year of Transplant */}
      <label className="block font-medium mb-1">Year of Transplant</label>
      <select
  name="transplantYear"
  value={formData.transplantYear}
  onChange={handleChange}
  className="w-full p-2 mb-4 border border-gray-300 rounded"
>
  <option value="">Select Year</option>
  {Array.from({ length: 40 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return (
      <option key={year} value={year}>
        {year}
      </option>
    );
  })}
</select>


      {/* I’m looking for... */}
      <label className="block font-medium mb-1">I am looking for:</label>
      <div className="mb-4 space-y-2">
        {['Peer Support', 'Goal Setting', 'Sports Mentoring', 'Positive Community', 'Return to Work/Study'].map(need => (
          <label key={need} className="flex items-center gap-2">
            <input
              type="checkbox"
              value={need}
              checked={formData.supportNeeds.includes(need)}
              onChange={handleCheckboxChange}
            />
            {need}
          </label>
        ))}
      </div>

      {/* Meeting Preference */}
      <label className="block font-medium mb-1">Preference for Meeting</label>
      <select
        name="meetingPreference"
        value={formData.meetingPreference}
        onChange={handleChange}
        className="w-full p-2 mb-4 border border-gray-300 rounded"
      >
        <option value="">Choose meeting preference</option>
        <option>In-person</option>
        <option>Phone</option>
        <option>Online</option>
        <option>Any</option>
      </select>

      {/* Sports/Activity Interests */}
      <label className="block font-medium mb-1">Sports/Activities Interest</label>
<Select
  isMulti
  name="sportsInterests"
  options={sportsOptions}
  value={sportsOptions.filter(option =>
    formData.sportsInterests.includes(option.value)
  )}
  onChange={(selectedOptions) => {
    setFormData(prev => ({
      ...prev,
      sportsInterests: selectedOptions.map(option => option.value),
    }));
  }}
  className="mb-6"
  classNamePrefix="select"
/>

      <div className="flex justify-end mt-8">
  <button
    type="button"
    onClick={async () => {
        const payload = {
          role: localStorage.getItem("selectedRole") || "mentee", // or fetch from global state
          transplantType: formData.transplantType,
          transplantYear: formData.transplantYear,
          goals: formData.supportNeeds,
          meetingPref: formData.meetingPreference,
          sportsInterest: formData.sportsInterests,
        };
      
        try {
          const res = await fetch("/api/save-preferences", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
          });
      
          const data = await res.json();
      
          if (data.success) {
            window.location.href = '/survey/lifestyle';
          } else {
            alert("❌ Failed to save preferences.");
          }
        } catch (err) {
          console.error("❌ Error saving preferences:", err);
          alert("⚠️ Server error. Please try again.");
        }
      }}
      
    className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600 flex items-center gap-2"
  >
    <span>Next</span>
    <span>➔</span>
  </button>
</div>

    </div>
  );
};

export default MatchingPreferences;

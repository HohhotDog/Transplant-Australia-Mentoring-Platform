// src/components/Survey/MatchingPreferences.js

import React, { useState } from 'react';

const transplantOptions = [
  'Bone Marrow', 'Pancreas', 'Kidney', 'Liver', 'Heart',
  'Lung', 'Cornea', 'Other Tissue', 'Not Applicable'
];

const sportsOptions = [
  'Running', 'Pilates/Yoga', 'Cycling', 'Swimming',
  'Ball Sports', 'Walking', 'Board Games', 'Triathlon', 'Bowls/Petanque'
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

  const toggleMultiSelect = (field, value) => {
    setFormData(prev => {
      const arr = prev[field];
      return {
        ...prev,
        [field]: arr.includes(value)
          ? arr.filter(item => item !== value)
          : [...arr, value]
      };
    });
  };

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
      <div className="flex flex-wrap gap-2 mb-4">
        {transplantOptions.map(option => (
          <button
            key={option}
            type="button"
            onClick={() => toggleMultiSelect('transplantType', option)}
            className={`px-3 py-1 rounded border ${
              formData.transplantType.includes(option)
                ? 'bg-orange-500 text-white'
                : 'bg-white border-gray-300'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

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
      <div className="flex flex-wrap gap-2 mb-6">
        {sportsOptions.map(option => (
          <button
            key={option}
            type="button"
            onClick={() => toggleMultiSelect('sportsInterests', option)}
            className={`px-3 py-1 rounded border ${
              formData.sportsInterests.includes(option)
                ? 'bg-orange-500 text-white'
                : 'bg-white border-gray-300'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="flex justify-end mt-8">
  <button
    type="button"
    onClick={() => {
      // You can log the data or store it if needed
      console.log(formData);
      localStorage.setItem('preferencesData', JSON.stringify(formData));
      window.location.href = '/survey/questionnaire'; // Navigate to next page
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

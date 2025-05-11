// src/pages/Account/AccountMentorshipPreferences.js
import React, { useState, useEffect } from 'react';
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

const AccountMentorshipPreferences = () => {
    const [formData, setFormData] = useState({
        participantRole: '',
        transplantType: [],
        transplantYear: '',
        meetingPreference: '',
        sportsInterests: [],
        supportNeeds: []
    });

    const [hasData, setHasData] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/latest-survey', { credentials: 'include' })
          .then(res => res.json())
          .then(data => {
            if (data.success && data.data?.preferences) {
              const prefs = data.data.preferences;
              setFormData({
                participantRole: prefs.session_role || '',
                transplantType: JSON.parse(prefs.transplant_type || '[]'),
                transplantYear: prefs.transplant_year || '',
                supportNeeds: JSON.parse(prefs.goals || '[]'),
                meetingPreference: prefs.meeting_preference || '',
                sportsInterests: JSON.parse(prefs.sports_activities || '[]')
              });
              setHasData(true);
            } else {
              setHasData(false);
            }
          })
          .catch(err => {
            console.error('Error loading preferences:', err);
            setHasData(false);
          })
          .finally(() => setLoading(false));
      }, []);
      

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

    const handleSave = async () => {
        try {
            const res = await fetch('/api/account-save-preferences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    session_role: formData.participantRole,
                    transplantType: formData.transplantType,
                    transplantYear: formData.transplantYear,
                    goals: formData.supportNeeds,
                    meetingPref: formData.meetingPreference,
                    sportsInterest: formData.sportsInterests,
                }),
            });
            const data = await res.json();
            if (data.success) {
                alert('✅ Preferences saved successfully!');
            } else {
                alert('❌ Failed to save preferences.');
            }
        } catch (err) {
            console.error('Error saving preferences:', err);
            alert('⚠️ Server error.');
        }
    };

    if (loading) return <div>Loading preferences...</div>;

    if (!hasData) {
       
        return (
            <div className="max-w-3xl mx-auto p-8 mt-10 bg-white rounded-xl shadow text-center">
              <h1 className="text-4xl font-bold mb-6 text-gray-800">My Mentorship Preferences</h1>
              <div className="text-gray-700 text-lg leading-relaxed px-6">
                <div className="flex justify-center mb-4 text-yellow-600 text-2xl">⚠️</div>
                <p className="mb-4 font-medium">
                  You haven’t submitted any mentorship application yet.
                </p>
                <p className="text-base font-normal text-gray-700">
                Join a session and complete the survey to view and manage your preferences here.
                </p>
              </div>
            </div>
          );
          
              
          
      }
      


    return (
        <div className="max-w-3xl mx-auto p-8 text-left">
            <h1 className="text-3xl font-bold mb-6">My Mentorship Preferences</h1>

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
                        transplantType: selectedOptions.map(opt => opt.value),
                    }));
                }}
                className="mb-4"
            />

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

            <label className="block font-medium mb-1">Sports/Activities Interest</label>
            <Select
                isMulti
                options={sportsOptions}
                value={sportsOptions.filter(option =>
                    formData.sportsInterests.includes(option.value)
                )}
                onChange={(selectedOptions) => {
                    setFormData(prev => ({
                        ...prev,
                        sportsInterests: selectedOptions.map(opt => opt.value),
                    }));
                }}
                className="mb-6"
            />

            <div className="flex justify-end mt-8">
                <button
                    onClick={handleSave}
                    className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600"
                >
                    Save Preferences
                </button>
            </div>
        </div>
    );
};

export default AccountMentorshipPreferences;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MatchingLifestyle = () => {
  const navigate = useNavigate();
  const [isLocked, setIsLocked] = useState(false);
  const [responses, setResponses] = useState({
    physicalExerciseFrequency: '',
    likeAnimals: '',
    likeCooking: '',
    travelImportance: '',
    freeTimePreference: '',
    feelOverwhelmed: 3,
    activityBarriers: 3,
    longTermGoals: 3,
    stressHandling: 3,
    motivationLevel: 3,
    hadMentor: 3,
  });
  
  useEffect(() => {
    fetch("/api/form-status", {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.submitted) {
          setIsLocked(true);
        }
      });
  }, []);

  useEffect(() => {
    fetch('/api/latest-survey', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        console.log("🔍 FULL SURVEY DATA:", data);
        if (data.success && data.data?.lifestyle) {
          const lifestyle = data.data.lifestyle;
          console.log("⭐ LIFESTYLE BACKEND DATA:", lifestyle);
          setResponses({
            physicalExerciseFrequency: lifestyle.physicalExerciseFrequency ?? '',
            likeAnimals: lifestyle.likeAnimals ?? '',
            likeCooking: lifestyle.likeCooking ?? '',
            travelImportance: lifestyle.travelImportance ?? '',
            freeTimePreference: lifestyle.freeTimePreference ?? '',
            feelOverwhelmed: lifestyle.feelOverwhelmed !== undefined ? Number(lifestyle.feelOverwhelmed) : 3,
            activityBarriers: lifestyle.activityBarriers !== undefined ? Number(lifestyle.activityBarriers) : 3,
            longTermGoals: lifestyle.longTermGoals !== undefined ? Number(lifestyle.longTermGoals) : 3,
            stressHandling: lifestyle.stressHandling !== undefined ? Number(lifestyle.stressHandling) : 3,
            motivationLevel: lifestyle.motivationLevel !== undefined ? Number(lifestyle.motivationLevel) : 3,
            hadMentor: lifestyle.hadMentor !== undefined ? Number(lifestyle.hadMentor) : 3,
          });
        }
      })
      .catch(err => console.error("Failed to fetch existing lifestyle responses:", err));
  }, []);



  const handleSliderChange = (key, value) => {
    setResponses(prev => ({ ...prev, [key]: Number(value) }));
  };

  const handleDropdownChange = (e) => {
    const { name, value } = e.target;
    setResponses(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleNext = () => {
    console.log("🔥 Matching Lifestyle Responses:", responses);

    const sessionId = localStorage.getItem("sessionId") || "9999";
    const role = localStorage.getItem("selectedRole") || "mentee";

    fetch('/api/save-lifestyle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ sessionId, role, answers: responses })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          console.log("✅ Lifestyle answers saved!");
          navigate('/survey/enneagram');
        } else {
          console.error("❌ Failed to save lifestyle answers");
          alert("Something went wrong while saving. Try again?");
        }
      })
      .catch(err => {
        console.error("❌ Server error:", err);
        alert("Server error. Please try again later.");
      });
  };

  const QuestionSlider = ({ label, name }) => (
    <div className="mb-6">
      <label className="block font-semibold text-lg mb-1 text-gray-800">{label}</label>
      <input
        type="range"
        min="1"
        max="5"
        value={responses[name]}
        onChange={(e) => handleSliderChange(name, e.target.value)}
        className="w-full accent-orange-500"
        disabled={isLocked}
      />
      <div className="text-sm text-gray-500 mt-1">Value: {responses[name]}</div>
    </div>
  );

  const QuestionDropdown = ({ label, name, options }) => (
    <div className="mb-6">
      <label className="block font-semibold text-lg mb-1 text-gray-800">{label}</label>
      <select
        disabled={isLocked}
        name={name}
        value={responses[name]?.toString() || ''}
        onChange={handleDropdownChange}
        className="w-full p-3 rounded-lg border border-[#d4cfc5] text-gray-800 bg-[#f9f7f4] focus:outline-none focus:ring-2 focus:ring-orange-400 appearance-none"
      >
        <option value="">Choose option</option>
        {options.map((opt, i) => (
          <option key={i} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
  

  return (
    <div className="max-w-3xl mx-auto p-8 text-left">
      <h1 className="text-3xl font-bold mb-6">Lifestyle & Matching Questions</h1>

      <QuestionDropdown
        name="physicalExerciseFrequency"
        label="How often do you engage in physical exercise or sports?"
        options={[
          { label: "Never", value: 1 },
          { label: "Rarely", value: 2 },
          { label: "Sometimes (1–2×/week)", value: 3 },
          { label: "Often (2+×/week)", value: 4 },
          { label: "Very Often (3+×/week)", value: 5 },
        ]}
      />

      <QuestionDropdown
        name="likeAnimals"
        label="Do you like animals and have pets?"
        options={[
          { label: "Strongly Dislike", value: 1 },
          { label: "Dislike", value: 2 },
          { label: "Neutral", value: 3 },
          { label: "Like", value: 4 },
          { label: "Strongly Like", value: 5 },
        ]}
      />

      <QuestionDropdown
        name="likeCooking"
        label="Do you enjoy cooking and trying new recipes?"
        options={[
          { label: "Strongly Dislike", value: 1 },
          { label: "Dislike", value: 2 },
          { label: "Neutral", value: 3 },
          { label: "Like", value: 4 },
          { label: "Strongly Like", value: 5 },
        ]}
      />

      <QuestionDropdown
        name="travelImportance"
        label="How important is travel and exploring new places to you?"
        options={[
          { label: "Not Important", value: 1 },
          { label: "Slightly Important", value: 2 },
          { label: "Moderately Important", value: 3 },
          { label: "Very Important", value: 4 },
          { label: "Extremely Important", value: 5 },
        ]}
      />

      <QuestionDropdown
        name="freeTimePreference"
        label="Do you prefer spending your free time indoors or outdoors?"
        options={[
          { label: "Strongly Prefer Indoors", value: 1 },
          { label: "Prefer Indoors", value: 2 },
          { label: "Neutral", value: 3 },
          { label: "Prefer Outdoors", value: 4 },
          { label: "Strongly Prefer Outdoors", value: 5 },
        ]}
      />

      <QuestionSlider
        name="feelOverwhelmed"
        label="Do you have days where you feel overwhelmed by your or your family’s health journey?"
      />

      <QuestionSlider
        name="activityBarriers"
        label="I feel I have barriers to returning to physical activity or work."
      />

      <QuestionSlider
        name="longTermGoals"
        label="I have clear long-term health and activity goals."
      />

      <QuestionSlider
        name="stressHandling"
        label="I have strategies to handle stress and maintain balance in my life."
      />

      <QuestionSlider
        name="motivationLevel"
        label="I feel motivated to stay engaged in my or my family’s recovery and health management."
      />

      <QuestionSlider
        name="hadMentor"
        label="I have had a mentor or support person who has significantly influenced my transplant/carer journey."
      />

      <div className="flex justify-end mt-10">
        <button
          onClick={handleNext}
          disabled={isLocked}
          className={`px-6 py-2 rounded ${
            isLocked
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-orange-500 text-white hover:bg-orange-600'
          }`}
        >
          Next ➔
        </button>
      </div>
    </div>);
};

export default MatchingLifestyle;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MatchingLifestyle = () => {
  const navigate = useNavigate();

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

  const handleSliderChange = (key, value) => {
    setResponses(prev => ({ ...prev, [key]: Number(value) }));
  };

  const handleDropdownChange = (e) => {
    const { name, value } = e.target;
    setResponses(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleNext = () => {
    console.log("🔥 Matching Lifestyle Responses:");
    Object.entries(responses).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });
  
    localStorage.setItem('lifestyleData', JSON.stringify(responses));
    navigate('/survey/enneagram');
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
      />
      <div className="text-sm text-gray-500 mt-1">Value: {responses[name]}</div>
    </div>
  );

  const QuestionDropdown = ({ label, name, options }) => (
    <div className="mb-6">
      <label className="block font-semibold text-lg mb-1 text-gray-800">{label}</label>
      <select
        name={name}
        value={responses[name]}
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
          className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600"
        >
          Next ➔
        </button>
      </div>
    </div>
  );
};

export default MatchingLifestyle;

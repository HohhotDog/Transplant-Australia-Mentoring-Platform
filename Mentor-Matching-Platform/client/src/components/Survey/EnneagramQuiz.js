import React, { useState } from 'react';
import { enneagramQuestions } from '../../../src/data/enneagramQuestions';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EnneagramQuiz = () => {
  const userId = sessionStorage.getItem("userId"); // Move this to top ✅
  const [answers, setAnswers] = useState(Array(enneagramQuestions.length).fill(3));
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (!userId) {
      alert("User ID not found. Please log in again.");
      return;
    }

    console.log("📤 Submitting Enneagram answers:", answers);
    console.log("👤 User ID from sessionStorage:", userId);

    try {
      await axios.post(
        '/api/enneagram/submit',
        {
          answers
        },
        { withCredentials: true }
      );

      setSubmitted(true);
      navigate("/matches");
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert("Something went wrong!");
    }
  };

  if (submitted) {
    return <p className="text-center text-green-600 text-lg mt-4">🎉 Thanks! Your type has been saved.</p>;
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Enneagram Personality Quiz</h1>
      {enneagramQuestions.map((q, i) => (
        <div key={q.id} className="mb-6">
          <p className="mb-2">{q.question}</p>
          <input
            type="range"
            min={1}
            max={5}
            value={answers[i]}
            onChange={(e) => handleChange(i, parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-1">
            <span>Strongly Disagree</span>
            <span>Strongly Agree</span>
          </div>
        </div>
      ))}
      <button
        onClick={handleSubmit}
        className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Submit Quiz
      </button>
    </div>
  );
};

export default EnneagramQuiz;

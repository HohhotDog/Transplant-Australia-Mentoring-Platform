import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const questions = [
  { id: 1, textA: 'I want to be helpful.', typeA: 2, textB: 'I want to be competent.', typeB: 3 },
  { id: 2, textA: 'I tend to trust most people.', typeA: 9, textB: 'I tend to be skeptical of others.', typeB: 6 },
  { id: 3, textA: 'I strive for perfection.', typeA: 1, textB: 'I strive for success.', typeB: 3 },
  { id: 4, textA: 'I focus on pleasing others.', typeA: 2, textB: 'I focus on getting things done.', typeB: 3 },
  { id: 5, textA: 'I worry a lot.', typeA: 6, textB: 'I don’t worry much.', typeB: 7 },
  { id: 6, textA: 'I often feel different from others.', typeA: 4, textB: 'I often feel part of the group.', typeB: 9 },
  { id: 7, textA: 'I tend to withdraw from others.', typeA: 5, textB: 'I tend to seek closeness with others.', typeB: 2 },
  { id: 8, textA: 'I want to be seen as strong.', typeA: 8, textB: 'I want to be seen as caring.', typeB: 2 },
  { id: 9, textA: 'I’m more reserved.', typeA: 5, textB: 'I’m more outgoing.', typeB: 7 },
  { id: 10, textA: 'I like structure and rules.', typeA: 1, textB: 'I like freedom and flexibility.', typeB: 7 },
  { id: 11, textA: 'I question authority.', typeA: 8, textB: 'I respect authority.', typeB: 1 },
  { id: 12, textA: 'I fear being unloved.', typeA: 2, textB: 'I fear being worthless.', typeB: 3 },
  { id: 13, textA: 'I fear being controlled.', typeA: 8, textB: 'I fear being alone.', typeB: 4 },
  { id: 14, textA: 'I adapt to others easily.', typeA: 9, textB: 'I assert myself easily.', typeB: 8 },
  { id: 15, textA: 'I often look to others for reassurance.', typeA: 6, textB: 'I rely on myself for validation.', typeB: 5 },
  { id: 16, textA: 'I tend to be imaginative and emotional.', typeA: 4, textB: 'I tend to be logical and detached.', typeB: 5 },
  { id: 17, textA: 'I need to be needed.', typeA: 2, textB: 'I need to be respected.', typeB: 3 },
  { id: 18, textA: 'I avoid conflict.', typeA: 9, textB: 'I confront issues directly.', typeB: 8 },
  { id: 19, textA: 'I fear making mistakes.', typeA: 1, textB: 'I fear being without support.', typeB: 6 },
  { id: 20, textA: 'I’m driven by pleasure.', typeA: 7, textB: 'I’m driven by purpose.', typeB: 1 },
  { id: 21, textA: 'I like being the center of attention.', typeA: 3, textB: 'I prefer to observe quietly.', typeB: 5 },
  { id: 22, textA: 'I crave excitement.', typeA: 7, textB: 'I crave peace.', typeB: 9 },
  { id: 23, textA: 'I protect myself from being vulnerable.', typeA: 8, textB: 'I open up easily.', typeB: 4 },
  { id: 24, textA: 'I define myself by how I feel.', typeA: 4, textB: 'I define myself by what I do.', typeB: 3 },
  { id: 25, textA: 'I enjoy exploring ideas.', typeA: 5, textB: 'I enjoy exploring experiences.', typeB: 7 },
  { id: 26, textA: 'I’m cautious and hesitant.', typeA: 6, textB: 'I’m confident and spontaneous.', typeB: 7 },
  { id: 27, textA: 'I enjoy solving problems.', typeA: 5, textB: 'I enjoy helping others.', typeB: 2 },
  { id: 28, textA: 'I strive to improve things.', typeA: 1, textB: 'I strive to enjoy life.', typeB: 7 },
  { id: 29, textA: 'I feel most at home in calm environments.', typeA: 9, textB: 'I feel most at home in exciting environments.', typeB: 7 },
  { id: 30, textA: 'I care what others think of me.', typeA: 3, textB: 'I care more about what I think of myself.', typeB: 5 },
  { id: 31, textA: 'I try to understand myself deeply.', typeA: 4, textB: 'I try to improve myself constantly.', typeB: 1 },
  { id: 32, textA: 'I want to be admired.', typeA: 3, textB: 'I want to be loved.', typeB: 2 },
  { id: 33, textA: 'I feel anxious often.', typeA: 6, textB: 'I feel free and lighthearted.', typeB: 7 },
  { id: 34, textA: 'I like to be in control.', typeA: 8, textB: 'I like to go with the flow.', typeB: 9 },
  { id: 35, textA: 'I value loyalty above all.', typeA: 6, textB: 'I value independence above all.', typeB: 5 },
  { id: 36, textA: 'I focus on what’s missing.', typeA: 4, textB: 'I focus on what I have.', typeB: 9 },
];

const MatchingEnneagram = () => {
  const [step, setStep] = useState(1);
  const [responses, setResponses] = useState({});
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/form-status', {
      method: 'GET',
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.submitted) {
          setIsLocked(true);
        }
      })
      .catch(err => console.error("⚠️ Error checking form status:", err));
  }, []);

  useEffect(() => {
    fetch('/api/latest-survey', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.enneagram) {
          const enneagram = data.data.enneagram;
          const savedResponses = enneagram.answers; // 👈 this should be the raw slider data
          if (savedResponses) {
            console.log("🧠 Loaded previous enneagram responses:", savedResponses);
            const parsed = typeof savedResponses === 'string' ? JSON.parse(savedResponses) : savedResponses;
            setResponses(parsed);
         }         
        }
      })
      .catch(err => console.error("⚠️ Error loading latest survey:", err));
  }, []);

  const handleSliderChange = (id, value) => {
    setResponses(prev => ({ ...prev, [id]: Number(value) }));
  };

  const batch1 = questions.slice(0, 18);
  const batch2 = questions.slice(18, 36);

  const weightMap = {
    1: [5, 0],
    2: [4, 1],
    3: [2.5, 2.5],
    4: [1, 4],
    5: [0, 5],
  };

  const calculateResult = async () => {
    const scores = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };

    Object.entries(responses).forEach(([id, val]) => {
      const question = questions.find(q => q.id === Number(id));
      const [scoreA, scoreB] = weightMap[val];
      scores[question.typeA] += scoreA;
      scores[question.typeB] += scoreB;
    });
  
    const maxScore = Math.max(...Object.values(scores));
    const topTypes = Object.entries(scores)
      .filter(([_, score]) => score === maxScore)
      .map(([type]) => Number(type));
  
    const resultData = {
      topTypes: topTypes.length === 1 ? topTypes[0] : topTypes,
      topScore: maxScore,
      allScores: scores,
    };
  
    localStorage.setItem('enneagramResult', JSON.stringify(resultData));

    const sessionId = localStorage.getItem("sessionId");
    const role = localStorage.getItem("selectedRole");

    try {
      const enneagramRes = await fetch('/api/save-enneagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sessionId,
          role,
          topTypes: resultData.topTypes,
          allScores: resultData.allScores,
          answers: responses,  
        })
      });

      const enneagramData = await enneagramRes.json();
      if (!enneagramData.success) {
        alert("⚠️ Failed to save Enneagram result.");
        return;
      }

      const markRes = await fetch('/api/mark-submitted', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sessionId })
      });
      const markData = await markRes.json();

      if (markData.success) {
        fetch(`/api/match-mentee?sessionId=${sessionId}`, {
          method: 'GET',
          credentials: 'include'
        })
          .then(res => res.json())
          .then(matchData => {
            console.log("🧠 Mentor Matches:", matchData);
            navigate('/survey/submitform');
          })
          .catch(err => {
            console.error("❌ Error fetching matches:", err);
            navigate('/survey/submitform');
          });
      } else {
        alert("⚠️ Failed to mark application as submitted.");
      }
    } catch (err) {
      console.error("❌ Error during submission:", err);
      alert("An error occurred while finalizing submission.");
    }
  };
  
  const renderSlider = (q) => (
    <div key={q.id} className="mb-6">
      <p className="font-semibold text-gray-700 mb-2">Q{q.id}</p>
      <div className="flex justify-between text-sm mb-1 text-gray-600">
        <span>{q.textA}</span>
        <span>{q.textB}</span>
      </div>
      <input
        type="range"
        min="1"
        max="5"
        disabled={isLocked}
        value={responses[q.id] || 3}
        onChange={(e) => handleSliderChange(q.id, e.target.value)}
        className="w-full accent-orange-500"
      />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-6 text-left">
      <h1 className="text-3xl font-bold mb-6">Enneagram Questionnaire</h1>
      <p className="mb-4 text-gray-600">
        Please adjust the slider to indicate which statement is more like you.
      </p>

      {(step === 1 ? batch1 : batch2).map(renderSlider)}

      {step === 2 && (
        <div className="mt-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              disabled={isLocked}
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
            />
            <span className="text-sm text-gray-700">
              I confirm that the information provided is accurate and I want to submit my mentorship application.
            </span>
          </label>
        </div>
      )}

      <div className="flex justify-between mt-10">
        {step === 2 && (
          <button
            onClick={() => setStep(1)}
            className="bg-gray-300 text-black px-6 py-2 rounded hover:bg-gray-400"
          >
            ◀ Back
          </button>
        )}
        {step === 1 ? (
          <button
            onClick={() => setStep(2)}
            className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600 ml-auto"
          >
            Next ➔
          </button>
        ) : (
          <button
            onClick={calculateResult}
            disabled={!isConfirmed || isLocked}
            className={`ml-auto px-6 py-2 rounded text-white ${
              isConfirmed
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
};

export default MatchingEnneagram;
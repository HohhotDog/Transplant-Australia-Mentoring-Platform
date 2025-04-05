// src/components/SurveyForm.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function SurveyForm() {
  const [questions, setQuestions] = useState([]);
  const [role, setRole] = useState("mentor");
  const [responses, setResponses] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuestions();
  }, []);

  async function fetchQuestions() {
    try {
      const res = await fetch("/api/questions", { credentials: "include" });
      const data = await res.json();
      setQuestions(data);
    } catch (err) {
      console.error(err);
    }
  }

  function handleResponseChange(qId, value) {
    setResponses((prev) => ({ ...prev, [qId]: value }));
  }

  async function handleSurveySubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role, responses })
      });
      const data = await res.json();
      if (data.success) {
        alert("🎉 Survey submitted!");
        setResponses({});
        if (data.success) {
          alert("🎉 Survey submitted!");
          setResponses({});
          navigate("/enneagram"); 
        }
        
      } else {
        alert("Error: " + data.message);
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <h2>📝 Survey Questions</h2>
      <form className="survey-form" onSubmit={handleSurveySubmit}>
        <label>Role:</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ marginBottom: "1rem" }}
        >
          <option value="mentor">Mentor</option>
          <option value="mentee">Mentee</option>
        </select>
        <div className="questions-list">
          {questions.map((q) => (
            <div className="question-item" key={q.id}>
              <label>{q.text}</label>
              <select
                value={responses[`q${q.id}`] || ""}
                onChange={(e) =>
                  handleResponseChange(`q${q.id}`, e.target.value)
                }
              >
                <option value="">Select</option>
                <option value="yes">👍 Yes</option>
                <option value="no">👎 No</option>
              </select>
            </div>
          ))}
        </div>
        <button type="submit" style={{ marginTop: "1rem" }}>
          Submit Survey
        </button>
      </form>
    </div>
  );
}

export default SurveyForm;

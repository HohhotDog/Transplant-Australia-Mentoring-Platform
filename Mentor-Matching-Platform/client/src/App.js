// App.js
import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Registration state
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // Login state
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Survey state
  const [questions, setQuestions] = useState([]);
  const [role, setRole] = useState("mentor");
  const [responses, setResponses] = useState({});
  const [matchResult, setMatchResult] = useState(null);

  // Check if user is logged in or not by trying to fetch questions
  useEffect(() => {
    fetchQuestionsIfLoggedIn();
  }, []);

  async function fetchQuestionsIfLoggedIn() {
    try {
      const res = await fetch("/api/questions", {
        credentials: "include",
      });
      if (res.status === 401) {
        // Not logged in
        setIsLoggedIn(false);
      } else {
        const data = await res.json();
        setQuestions(data);
        setIsLoggedIn(true);
      }
    } catch (err) {
      console.error(err);
      setIsLoggedIn(false);
    }
  }

  // ---------- Register ----------
  async function handleRegister(e) {
    e.preventDefault();
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: regUsername,
          password: regPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("🎉 Account created! You can now log in.");
        setRegUsername("");
        setRegPassword("");
      } else {
        alert("Error: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error registering user");
    }
  }

  // ---------- Login ----------
  async function handleLogin(e) {
    e.preventDefault();
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ Logged in successfully!");
        setIsLoggedIn(true);
        fetchQuestionsIfLoggedIn();
      } else {
        alert("Error: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error logging in");
    }
  }

  // ---------- Logout ----------
  async function handleLogout() {
    try {
      const res = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        alert("👋 Logged out!");
        setIsLoggedIn(false);
        setQuestions([]);
        setResponses({});
        setMatchResult(null);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // ---------- Survey ----------
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
        body: JSON.stringify({ role, responses }),
      });
      const data = await res.json();
      if (data.success) {
        alert("🎉 Survey submitted!");
        setResponses({});
      } else {
        alert("Error: " + data.message);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // ---------- Match Request ----------
  async function handleMatchRequest() {
    try {
      const res = await fetch("/api/match-mentee", {
        credentials: "include",
      });
      const data = await res.json();
      setMatchResult(data);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="container">
      <h1>🧑‍💻 Mentor-Mentee Portal</h1>

      {!isLoggedIn && (
        <div className="auth-container">
          <h2>🚀 Create an Account</h2>
          <form onSubmit={handleRegister}>
            <label>Username</label>
            <input
              value={regUsername}
              onChange={(e) => setRegUsername(e.target.value)}
              required
            />
            <label>Password</label>
            <input
              type="password"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              required
            />
            <button type="submit">Register</button>
          </form>

          <hr />

          <h2>🔑 Log In</h2>
          <form onSubmit={handleLogin}>
            <label>Username</label>
            <input
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              required
            />
            <label>Password</label>
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />
            <button type="submit">Login</button>
          </form>
        </div>
      )}

      {isLoggedIn && (
        <>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>

          <hr />

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

          <hr />

          <div>
            <button onClick={handleMatchRequest}>🔎 Find a Mentee Match</button>
            {matchResult && (
              <div className="match-result">
                <h3>Match Results</h3>
                <pre>{JSON.stringify(matchResult, null, 2)}</pre>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;

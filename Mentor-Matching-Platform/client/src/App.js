// src/App.js
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

// Import pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
<<<<<<< HEAD
//import SurveyPage from "./pages/Mentorship/SurveyPage";
import MatchingPreferences from './components/Survey/MatchingPreferences';
import SubmitForm from './components/Survey/SubmitForm';
import MatchingEnneagram from './components/Survey/MatchingEnneagram';
import MatchingLifestyle from "./components/Survey/MatchingLifestyle";
import ProfilePage from "./pages/ProfilePage";
=======
import SurveyPage from "./pages/Mentorship/SurveyPage";
>>>>>>> temp-chensu
import AdminPage from "./pages/Admin/AdminPage";
import SessionPage from "./pages/Mentorship/ExploreSessionPage";
import MentorshipSessionDetailPage from './pages/Mentorship/MentorshipSessionDetailPage';
import MentorshipSessionPage from './pages/Mentorship/MySessions';
import RegisterSuccessInfo from "./components/Auth/RegisterSuccessInfo";
import PasswordLost from "./components/Auth/PasswordLost";
<<<<<<< HEAD
import MatchingRole from './components/Survey/MatchingRole';
=======
import ProfileForm from "./components/Profile/ProfileCreation";
import ProfilePage from "./components/Profile/ProfilePage";
import PersonalDetails from "./components/Profile/PersonalDetails";
import SecurityManagement from "./components/Profile/SecurityManagement";
>>>>>>> temp-chensu

// Import global layout
import Layout from "./components/Layout";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    function handleLoginSuccess() {
        setIsLoggedIn(true);
    }

    function handleLogout() {
        fetch("/api/logout", {
            method: "POST",
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    alert("👋 Logged out!");
                    setIsLoggedIn(false);
                }
            })
            .catch((err) => console.error(err));
    }

    return (
        <Router>
            <Routes>
                {/* Routes using the global layout */}
                <Route
                    path="/"
                    element={
                        <Layout isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
                    }
                >
                    <Route index element={<HomePage />} />
<<<<<<< HEAD
                    <Route path="survey" element={<MatchingRole />} />
                    <Route path="/survey/preferences" element={<MatchingPreferences />} />
                    <Route path="/survey/lifestyle" element={<MatchingLifestyle />} />
                    <Route path="/survey/enneagram" element={<MatchingEnneagram />} />
                    <Route path="/survey/submitform" element={<SubmitForm />} />
                    <Route path="profile" element={<ProfilePage />} />
=======
                    <Route path="survey" element={<SurveyPage />} />
>>>>>>> temp-chensu
                    <Route path="admin" element={<AdminPage />} />
                    <Route path="sessions" element={<SessionPage />} />
                    <Route path="sessions/:id" element={<MentorshipSessionDetailPage />} />
                    <Route path="my-sessions" element={<MentorshipSessionPage />} />
                    <Route
                        path="profile"
                        element={<ProfilePage isLoggedIn={isLoggedIn} handleLogout={handleLogout} />}
                    />
                    <Route
                        path="profile-creation"
                        element={<ProfileForm isLoggedIn={isLoggedIn} handleLogout={handleLogout} />}
                    />
                    <Route
                        path="profile-edit"
                        element={<PersonalDetails isLoggedIn={isLoggedIn} handleLogout={handleLogout} />}
                    />
                    <Route
                        path="profile-security"
                        element={<SecurityManagement isLoggedIn={isLoggedIn} handleLogout={handleLogout} />}
                    />

                </Route>
                <Route
                    path="/login"
                    element={
                        <LoginPage
                            isLoggedIn={isLoggedIn}
                            handleLogout={handleLogout}
                            onLoginSuccess={handleLoginSuccess}
                        />
                    }
                />
                <Route
                    path="/register"
                    element={
                        <RegisterPage
                            isLoggedIn={isLoggedIn}
                            handleLogout={handleLogout}
                        />
                    }
                />
                <Route
                    path="/register-success"
                    element={
                        <RegisterSuccessInfo
                            isLoggedIn={isLoggedIn}
                            handleLogout={handleLogout}
                        />
                    }
                />
                <Route
                    path="/forgot-password"
                    element={
                        <PasswordLost
                            isLoggedIn={isLoggedIn}
                            handleLogout={handleLogout}
                        />
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;

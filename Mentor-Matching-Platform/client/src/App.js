import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import RequireAdmin from "./components/Auth/RequireAdmin";

// Pages
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/Auth/RegisterPage";
import SurveyPage from "./pages/Mentorship/SurveyPage";
import AdminPage from "./pages/Admin/AdminPage";
import ExploreSessionPage from "./pages/Mentorship/ExploreSessionPage";
import MentorshipSessionDetailPage from "./pages/Mentorship/MentorshipSessionDetailPage";
import MySessionPage from "./pages/Mentorship/MySessions";
import RegisterSuccessInfo from "./components/Auth/RegisterSuccessInfo";
import PasswordLost from "./components/Auth/PasswordLost";

// Auth and Profile Components
import LoginForm from "./components/Auth/LoginForm"; // ✅ Login component
import ProfileForm from "./components/Profile/ProfileCreation";
import ProfilePage from "./components/Profile/ProfilePage";
import PersonalDetails from "./components/Profile/PersonalDetails";
import SecurityManagement from "./components/Profile/SecurityManagement";
import MySessionDetailRouter from "./pages/Mentorship/MySessionDetailRouter";

// Admin Routes
import AdminApplicationsPage from "./pages/Admin/AdminApplicationPage";
import AdminApplicationDetailPage from "./pages/Admin/AdminApplicationDetailPage";

// Layout
import Layout from "./components/Layout";

function App() {
    // Global session state
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [accountType, setAccountType] = useState(null); // 0 = regular user, 1 = admin
    const [isSessionChecked, setIsSessionChecked] = useState(false); // Wait for session to be checked before rendering routes

    // Automatically check session on initial page load
    useEffect(() => {
        fetch("/api/me", {
            method: "GET",
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setIsLoggedIn(true);
                    setAccountType(data.account_type);
                }
            })
            .catch((err) => {
                console.error("Failed to check session:", err);
            })
            .finally(() => {
                setIsSessionChecked(true); // Finish session check
            });
    }, []);

    // Called when login succeeds
    function handleLoginSuccess(type) {
        setIsLoggedIn(true);
        setAccountType(type);
    }

    // Called when logout is triggered
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
                    setAccountType(null);
                }
            })
            .catch((err) => console.error(err));
    }

    // Delay rendering routes until session check is complete
    if (!isSessionChecked) return null;

    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={
                        <Layout
                            isLoggedIn={isLoggedIn}
                            handleLogout={handleLogout}
                            accountType={accountType}
                        />
                    }
                >
                    {/* Public & user-accessible pages */}
                    <Route index element={<HomePage />} />
                    <Route path="survey/*" element={<SurveyPage />} />
                    <Route path="sessions">
                        <Route index element={<ExploreSessionPage />} />
                        <Route path=":id" element={<MentorshipSessionDetailPage />} />
                    </Route>
                    <Route path="my-sessions">
                        <Route index element={<MySessionPage />} />
                        <Route path=":id" element={<MySessionDetailRouter />} />
                    </Route>

                    {/* Profile management routes */}
                    <Route path="profile" element={<ProfilePage isLoggedIn={isLoggedIn} handleLogout={handleLogout} />} />
                    <Route path="profile-creation" element={<ProfileForm isLoggedIn={isLoggedIn} handleLogout={handleLogout} />} />
                    <Route path="profile-edit" element={<PersonalDetails isLoggedIn={isLoggedIn} handleLogout={handleLogout} />} />
                    <Route path="profile-security" element={<SecurityManagement isLoggedIn={isLoggedIn} handleLogout={handleLogout} />} />

                    {/* Admin-only pages with permission check */}
                    <Route
                        path="admin"
                        element={
                            <RequireAdmin accountType={accountType}>
                                <AdminPage />
                            </RequireAdmin>
                        }
                    />
                    <Route
                        path="admin/sessions/:sessionId/applications"
                        element={
                            <RequireAdmin accountType={accountType}>
                                <AdminApplicationsPage />
                            </RequireAdmin>
                        }
                    />
                    <Route
                        path="admin/sessions/:sessionId/applications/:applicationId"
                        element={
                            <RequireAdmin accountType={accountType}>
                                <AdminApplicationDetailPage />
                            </RequireAdmin>
                        }
                    />
                </Route>

                {/* Auth-related pages (outside layout) */}
                <Route
                    path="/login"
                    element={
                        <LoginForm
                            isLoggedIn={isLoggedIn}
                            handleLogout={handleLogout}
                            onLoginSuccess={handleLoginSuccess}
                        />
                    }
                />
                <Route path="/register" element={<RegisterPage isLoggedIn={isLoggedIn} handleLogout={handleLogout} />} />
                <Route path="/register-success" element={<RegisterSuccessInfo isLoggedIn={isLoggedIn} handleLogout={handleLogout} />} />
                <Route path="/forgot-password" element={<PasswordLost isLoggedIn={isLoggedIn} handleLogout={handleLogout} />} />
            </Routes>
        </Router>
    );
}

export default App;

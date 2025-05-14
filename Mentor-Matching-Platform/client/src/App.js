import React, { useState, useEffect } from "react";
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
import AvatarUpdatePage from "./components/Profile/ChangeAvatar";
import ParticipantDetails from "./pages/Admin/ParticipantDetails";

// Auth and Profile Components
import LoginForm from "./components/Auth/LoginForm"; 
import ProfileForm from "./components/Profile/ProfileCreation";
import ProfilePage from "./components/Profile/ProfilePage";
import PersonalDetails from "./components/Profile/PersonalDetails";
import AccountMentorshipPreferences from "./pages/Account/AccountMentorshipPreferences";
import SecurityManagement from "./components/Profile/SecurityManagement";
import MySessionDetailRouter from "./pages/Mentorship/MySessionDetailRouter";
import { useUser } from "./components/context/UserContext";

// Admin Routes
import AdminApplicationsPage from "./pages/Admin/AdminApplicationPage";
import AdminApplicationDetailPage from "./pages/Admin/AdminApplicationDetailPage";
import ParticipantPage from "./pages/Admin/ParticipantsPage";

// Layout
import Layout from "./components/utils/Layout";
import SidebarLayout from "./components/utils/SidebarLayout";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accountType, setAccountType] = useState(null);
  const [isSessionChecked, setIsSessionChecked] = useState(false);
  const { user, setUser } = useUser();

  useEffect(() => {
    // Only fetch if user is not already set
    if (!user) {
      fetch("/api/me")
        .then((res) => res.json())
        .then((userData) => {
          if (userData.success) {
            setUser({
              id: userData.id,
              email: userData.email,
              account_type: userData.account_type,
              avatar_url: userData.avatar_url,
            });
            setIsLoggedIn(true);
            setAccountType(userData.account_type);
          }
        })
        .catch((err) => console.error("Failed to check session:", err))
        .finally(() => setIsSessionChecked(true));
    } else {
      setIsSessionChecked(true);
    }
  }, [user, setUser]);

  function handleLoginSuccess(type, avatarUrl) {
    setIsLoggedIn(true);
    setAccountType(type);
    setUser({
      avatar_url: avatarUrl || "/images/default-avatar.png",
    });
  }

  function handleLogout() {
    fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setIsLoggedIn(false);
          setAccountType(null);
          setUser(null);
        }
      });
  }

  if (!isSessionChecked) return null;

  return (
    <Router>
      <Routes>
        {/* Sidebar Layout */}
        <Route element={<SidebarLayout isLoggedIn={isLoggedIn} accountType={accountType} />}>
          <Route
            path="account-mentorship-preferences"
            element={
              <AccountMentorshipPreferences
                isLoggedIn={isLoggedIn}
                handleLogout={handleLogout}
              />
            }
          />
          <Route path="profile" element={<ProfilePage isLoggedIn={isLoggedIn} handleLogout={handleLogout} />} />
          <Route path="profile-creation" element={<ProfileForm isLoggedIn={isLoggedIn} handleLogout={handleLogout} />} />
          <Route path="profile-edit" element={<PersonalDetails isLoggedIn={isLoggedIn} handleLogout={handleLogout} />} />
          <Route path="profile-security" element={<SecurityManagement isLoggedIn={isLoggedIn} handleLogout={handleLogout} />} />
          <Route path="profile-avatar" element={<AvatarUpdatePage />} />
          <Route path="my-sessions">
            <Route index element={<MySessionPage />} />
            <Route path=":id" element={<MySessionDetailRouter />} />
          </Route>
          <Route path="sessions">
            <Route index element={<ExploreSessionPage />} />
            <Route path=":id" element={<MentorshipSessionDetailPage />} />
          </Route>
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
          <Route
            path="admin/sessions/:sessionId/participants"
            element={
              <RequireAdmin accountType={accountType}>
                <ParticipantPage />
              </RequireAdmin>
            }
          />
          <Route
            path="admin/participants/:userId/details"
            element={
              <RequireAdmin accountType={accountType}>
                <ParticipantDetails />
              </RequireAdmin>
            }
          />
        </Route>

        {/* Top Navbar Layout */}
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
          <Route index element={<HomePage />} />
          <Route path="survey/*" element={<SurveyPage />} />
        </Route>

        {/* Auth Routes */}
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
        <Route
          path="/register"
          element={<RegisterPage isLoggedIn={isLoggedIn} handleLogout={handleLogout} />}
        />
        <Route
          path="/register-success"
          element={<RegisterSuccessInfo isLoggedIn={isLoggedIn} handleLogout={handleLogout} />}
        />
        <Route
          path="/forgot-password"
          element={<PasswordLost isLoggedIn={isLoggedIn} handleLogout={handleLogout} />}
        />
      </Routes>
    </Router>
  );
}

export default App;


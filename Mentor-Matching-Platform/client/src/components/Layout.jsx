import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import NavBar from "./Navigation/NavBar";
import ApplicationLayout from "./Survey/ApplicationLayout";

const Layout = ({ isLoggedIn, handleLogout }) => {
  const location = useLocation();
  const isSurveyPage = location.pathname.startsWith("/survey");

  if (isSurveyPage) {
    return (
      <ApplicationLayout>
        <Outlet />
      </ApplicationLayout>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-lightbrown">
      <NavBar isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
      
      <main className="flex-grow container mx-auto px-4 py-4">
        <Outlet />
      </main>

      <footer className="bg-gray-200 text-center p-4">
        © 2025 Your Company Name
      </footer>
    </div>
  );
};

export default Layout;

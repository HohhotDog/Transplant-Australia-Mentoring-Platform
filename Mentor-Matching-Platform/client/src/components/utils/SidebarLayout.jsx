import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../Navigation/Sidebar";
import Topbar from "../Navigation/TopBar";
import { useUser } from "../context/UserContext";

const SidebarLayout = ({ isLoggedIn, accountType }) => {
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  return (
    <div className="flex min-h-screen bg-[#fdfbf8]">
      <Sidebar accountType={accountType} />
      <div className="flex-1 flex flex-col">
        <Topbar userImage={user?.avatar_url || "/images/default-avatar.png"} />
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;

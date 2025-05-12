import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const Topbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser } = useUser();

  const pathTitle = location.pathname
    .split("/")[1]
    ?.replaceAll("-", " ")
    .replace(/\b\w/g, (l) => l.toUpperCase()) || "Dashboard";

    const handleLogout = async () => {
        try {
          const res = await fetch("/api/logout", {
            method: "POST",
            credentials: "include",
          });
          const data = await res.json();
      
          if (data.success) {
            setUser(null); 
            navigate("/login"); 
          } else {
            alert("Logout failed.");
          }
        } catch (err) {
          console.error("Logout error:", err);
          alert("An error occurred during logout.");
        }
      };
      

  return (
    <div className="flex items-center justify-between px-8 py-4 bg-white border-b">
      
      <div className="w-32" /> {/* or any fixed width to maintain layout spacing */}

      {/* Right: Links + profile image + logout */}
      <div className="flex items-center gap-6">
        <a href="#" className="text-sm font-medium text-gray-800 hover:underline">
          Dashboard
        </a>
        
        <a href="#" className="text-sm font-medium text-gray-800 hover:underline">
          Resources
        </a>
        <a
  onClick={handleLogout}
  className="text-sm font-medium text-red-600 hover:underline cursor-pointer"
>
  Logout
</a>

        <img
          src={user?.avatar_url || "/images/default-avatar.png"}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover"
        />

      </div>
    </div>
  );
};

export default Topbar;

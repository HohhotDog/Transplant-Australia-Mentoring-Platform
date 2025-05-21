import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
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

  console.log("👤 Topbar user context:", user);

  return (
    <div className="flex items-center justify-between px-8 py-4 bg-[#a80063] border-b">
      <div className="w-32" /> {/* Placeholder to maintain layout */}

      {/* Right: Home, Resources, Logout, Avatar */}
      <div className="flex items-center gap-6">
        <Link to="/" className="text-sm font-medium text-white hover:underline">
          Home
        </Link>

        <a href="#" className="text-sm font-medium text-white hover:underline">
          Resources
        </a>

        <a
          onClick={handleLogout}
          className="text-sm font-medium text-white hover:underline cursor-pointer"
        >
          Logout
        </a>

        <img
          src={
            user?.avatar_url?.trim() ||
            "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
          }
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover bg-gray-100"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
          }}
        />
      </div>
    </div>
  );
};

export default Topbar;

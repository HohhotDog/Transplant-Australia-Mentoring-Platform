// components/Survey/ApplicationLayout.jsx
import { Link } from "react-router-dom";

const ApplicationLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm border-b">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">🏥 Transplant Australia</span>
        </div>
        <nav className="flex items-center gap-6 text-sm">
          <Link to="/dashboard" className="hover:underline">Dashboard</Link>
          <Link to="/network" className="hover:underline">My Network</Link>
          <Link to="/resources" className="hover:underline">Resources</Link>
        </nav>
        <div>
          <img
            src="/path-to-avatar.jpg"
            alt="User Avatar"
            className="w-8 h-8 rounded-full object-cover"
          />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};

export default ApplicationLayout;

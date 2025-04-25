import { Link } from "react-router-dom";

const ApplicationLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#f4ede6] text-black">
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">🏥 Transplant Australia</span>
        </div>

        <nav className="flex items-center gap-6 text-sm">
          <Link to="/dashboard" className="hover:underline">Dashboard</Link>
          <Link to="/network" className="hover:underline">My Network</Link>
          <button
            onClick={async () => {
              await fetch("/api/logout", { method: "POST", credentials: "include" });
              window.location.href = "/";
            }}
            className="hover:underline text-sm text-red-600"
          >
            Logout
          </button>
        </nav>

        <div>
          <img
            src="/path-to-avatar.jpg"
            alt="User Avatar"
            className="w-8 h-8 rounded-full object-cover"
          />
        </div>
      </header>

      <main className="py-10 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-10 border">
          {children}
        </div>
      </main>
    </div>
  );
};

export default ApplicationLayout;

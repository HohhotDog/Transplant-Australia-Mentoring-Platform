import './index.css';

function App() {
  return (
    <div className="font-sans">
      {/* Navbar */}
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <div className="text-xl font-bold text-blue-700">Transplant Australia</div>
        <div className="space-x-6 text-gray-700 text-sm hidden md:flex">
            <a href="/about">About</a>
            <a href="/support">Get Support</a>
            <a href="/resources">Resources</a>
          <a href="/contact">Contact</a>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-gray-50 text-center py-20 px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-800">
          Empowering Lives Through Support
        </h1>
        <p className="mt-6 max-w-xl mx-auto text-gray-700 text-lg">
          Connecting transplant recipients, donors, and caregivers with compassionate mentors for shared understanding and strength.
        </p>
        <button className="mt-8 bg-blue-700 text-white px-6 py-3 rounded hover:bg-blue-800 transition">
          Learn More
        </button>
      </header>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-gray-500">
        © {new Date().getFullYear()} Transplant Australia | Mentoring Platform
      </footer>
    </div>
  );
}

export default App;

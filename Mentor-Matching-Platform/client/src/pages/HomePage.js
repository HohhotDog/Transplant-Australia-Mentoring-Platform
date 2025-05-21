// HomePage.js
import React from "react";
import { useNavigate } from "react-router-dom";
import heroImage from "../assets/mentor-mentee-banner.png";

function HomePage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#ff6f00] flex flex-col">
      {/* Purple branding stripe only */}
      <div className="w-full h-[12px] bg-[#a80063]"></div>

      {/* Hero Section */}
      <div
        className="relative w-full h-[600px] md:h-[700px] bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-white text-center px-4">
          <div className="mt-20 space-y-4">
            <h1 className="text-4xl sm:text-5xl font-extrabold max-w-3xl leading-tight">
              Find a Mentor for Your Transplant Journey
            </h1>
            <p className="text-lg max-w-2xl">
              Connect with someone who understands. Whether you're a transplant recipient,
              awaiting surgery, or a caregiver — you're not alone.
            </p>
            <button
              onClick={handleGetStarted}
              className="bg-[#ff6f00] hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>

      {/* Orange callout bar */}
      <div className="bg-[#ff6f00] h-[50px] w-full"></div>

      {/* Info Section */}
      <div className="flex flex-col items-center justify-center px-4 py-12 space-y-10 max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md w-full border border-[#ffe0ef] shadow-pink-100">
          <h2 className="text-xl font-bold text-[#a80063] mb-2">What is Transplant Australia?</h2>
          <p className="text-gray-800">
            Transplant Australia is the national voice for transplant recipients, families, living donors,
            and those awaiting the gift of life. We exist to promote organ and tissue donation, support recovery
            and well-being post-transplant, and celebrate the strength and stories of this inspiring community.
            <br /><br />
            Our goal is to ensure every Australian touched by transplantation feels informed, empowered,
            and supported — no matter where they are on their journey.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md w-full border border-[#ffe0ef] shadow-pink-100">
          <h2 className="text-xl font-bold text-[#a80063] mb-2">Welcome to the Mentor-Mentee Portal</h2>
          <p className="text-gray-800">
            This platform connects people undergoing transplantation with mentors who’ve already experienced the journey.
            Whether you're preparing for surgery or navigating recovery, we’ll help you find someone who’s been there before.
            <br /><br />
            The platform also offers tools to support your mentorship experience — track progress, manage preferences, and 
            access guidance every step of the way. It’s more than just a connection — it’s a lifeline of understanding and shared strength.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md w-full border border-[#ffe0ef] shadow-pink-100">
          <h2 className="text-xl font-bold text-[#a80063] mb-2">For Patients Awaiting Transplant</h2>
          <p className="text-gray-800">
            Undergoing an organ transplant can be overwhelming — physically, emotionally, and mentally. 
            This platform exists to connect you with someone who truly understands what you're facing.
            Our mentors are people just like you, who have walked this path before. Through this program, 
            you’ll gain insights, emotional support, and a compassionate companion who gets it. 
            You are not alone — and you never have to be.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md w-full border border-[#ffe0ef] shadow-pink-100">
          <h2 className="text-xl font-bold text-[#a80063] mb-2">For Mentors with Lived Experience</h2>
          <p className="text-gray-800">
            Your transplant journey was life-changing — and now, you have the power to change someone else’s. 
            As a mentor, you’ll offer hope, strength, and reassurance to individuals preparing for or recovering 
            from a transplant. Share your story, your strength, and your insight. Help others find peace in 
            their most uncertain moments. Your experience can light the way for someone who needs it most.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#a80063] text-white text-center text-sm py-4 mt-12">
        © {new Date().getFullYear()}
      </footer>
    </div>
  );
}

export default HomePage;

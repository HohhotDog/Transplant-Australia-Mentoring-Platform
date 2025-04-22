import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../components/Profile/style/ProfilePage.css";

function ProfilePage({ isLoggedIn, handleLogout }) {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await fetch("/api/profile", {
                    method: "GET",
                    credentials: "include",
                });

                if (res.status === 401) {
                    navigate("/login");
                    return;
                }

                if (res.status === 404) {
                    alert("⚠️ You haven't completed your profile yet. Redirecting...");
                    navigate("/profile-creation");
                    return;
                }

                const data = await res.json();
                if (data.success) {
                    setProfile(data.profile);
                } else {
                    setError(data.message || "Unexpected error.");
                }
            } catch (err) {
                console.error(err);
                setError("Server error.");
            }
        }

        fetchProfile();
    }, [navigate]);

    if (error) {
        return (
            <div className="form-container">
                <h2 className="form-title">Profile</h2>
                <p className="form-footer error-text">❌ {error}</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="form-container">
                <h2 className="form-title">Loading profile...</h2>
            </div>
        );
    }

    return (
        <div className="form-container">
            <h2 className="form-title">My Profile</h2>

            <div className="avatar-card">
                <div className="avatar-card-inner">
                    <img
                        src={profile.profile_picture_url || "/images/ProfilePage/Sample.jpg"}
                        alt="Profile"
                    />
                </div>
            </div>

            <div className="profile-info">
                {[
                    ["Name", `${profile.first_name} ${profile.last_name}`],
                    ["Email", profile.email],
                    ["Phone", profile.phone_number],
                    ["Bio", profile.bio],
                    ["Date of Birth", profile.date_of_birth],
                    ["Address", profile.address],
                    ["City/Suburb", profile.city_suburb],
                    ["State", profile.state],
                    ["Postcode", profile.postal_code],
                    ["Gender", profile.gender],
                    ["Aboriginal / Torres Strait Islander", profile.aboriginal_or_torres_strait_islander === "true" ? "Yes" : "No"],
                    ["Language at Home", profile.language_spoken_at_home],
                    ["Living Situation", profile.living_situation],
                ].map(([label, value], idx) => (
                    <div className="profile-info-row" key={idx}>
                        <span className="label">{label}:</span>
                        <span className="value">{value || "(N/A)"}</span>
                    </div>
                ))}
            </div>

            <div className="profile-buttons">
                <button className="form-btn" onClick={() => navigate("/profile-edit")}>
                    Edit Profile
                </button>
                <button className="form-btn secondary-btn" onClick={() => navigate("/profile-security")}>
                    Password & Security
                </button>
            </div>
        </div>
    );
}

export default ProfilePage;

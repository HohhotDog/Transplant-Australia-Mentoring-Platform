/**
 * @file ProfilePage.jsx
 * @description Displays the authenticated user's profile in read-only view with options to edit or manage security settings.
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../components/Profile/style/ProfilePage.css";

/**
 * ProfilePage Component
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.isLoggedIn - Indicates whether the user is currently authenticated
 * @param {Function} props.handleLogout - Function to log out the user
 * @returns {JSX.Element} A page displaying user's personal profile details
 */
function ProfilePage({ isLoggedIn, handleLogout }) {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    /**
     * Fetch profile data on mount
     * Redirects if user is unauthorized (401) or has not completed profile (404)
     */
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
                console.log("Fetched profile:", data.profile);
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

    // Error state
    if (error) {
        return (
            <div className="form-container">
                <h2 className="form-title">Profile</h2>
                <p className="form-footer error-text">❌ {error}</p>
            </div>
        );
    }

    // Loading state
    if (!profile) {
        return (
            <div className="form-container">
                <h2 className="form-title">Loading profile...</h2>
            </div>
        );
    }

    // Render profile
    return (
        <div className="form-container">
            <h2 className="form-title">My Profile</h2>

            {/* Avatar Section */}
            <div className="avatar-card" onClick={() => navigate("/profile-avatar")} style={{ cursor: "pointer" }}>
                <div className="avatar-card-inner">
                    <img
                        src={profile.profile_picture_url || "/images/ProfilePage/Sample.jpg"}
                        alt="Profile"
                    />
                </div>

            </div>

            {/* Profile Info */}
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
                    [
                        "Aboriginal / Torres Strait Islander",
                        profile.aboriginal_or_torres_strait_islander === "true" ? "Yes" : "No"
                    ],
                    ["Language at Home", profile.language_spoken_at_home],
                    ["Living Situation", profile.living_situation],
                ].map(([label, value], idx) => (
                    <div className="profile-info-row" key={idx}>
                        <span className="label">{label}:</span>
                        <span className="value">{value || "(N/A)"}</span>
                    </div>
                ))}
            </div>

            {/* Action Buttons */}
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

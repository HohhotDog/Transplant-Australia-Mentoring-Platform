import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../components/Auth/style/Register.css";

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
                <p className="form-footer text-red-500">❌ {error}</p>
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
            <div className="form-box">
                {profile.profile_picture_url && (
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
                        <div
                            style={{
                                padding: "6px",
                                border: "2px solid #ccc",
                                borderRadius: "12px",
                                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                                maxWidth: "180px"
                            }}
                        >
                            <img
                                src={profile.profile_picture_url}
                                alt="Profile"
                                style={{
                                    width: "100%",
                                    height: "auto",
                                    borderRadius: "8px",
                                    objectFit: "cover"
                                }}
                            />
                        </div>
                    </div>
                )}
                <p><strong>Name:</strong> {profile.first_name} {profile.last_name}</p>
                <p><strong>Email:</strong> {profile.email || "(N/A)"}</p>
                <p><strong>Phone:</strong> {profile.phone_number || "(N/A)"}</p>
                <p><strong>Bio:</strong> {profile.bio || "(N/A)"}</p>
                <p><strong>Date of Birth:</strong> {profile.date_of_birth}</p>
                <p><strong>Address:</strong> {profile.address}</p>
                <p><strong>City/Suburb:</strong> {profile.city_suburb}</p>
                <p><strong>State:</strong> {profile.state}</p>
                <p><strong>Postcode:</strong> {profile.postal_code}</p>
                <p><strong>Gender:</strong> {profile.gender}</p>
                <p><strong>Aboriginal or Torres Strait Islander:</strong> {profile.aboriginal_or_torres_strait_islander === "true" ? "Yes" : "No"}</p>
                <p><strong>Language at Home:</strong> {profile.language_spoken_at_home}</p>
                <p><strong>Living Situation:</strong> {profile.living_situation}</p>

                <button
                    className="form-btn mt-4"
                    onClick={() => navigate("/profile-edit")}
                >
                    Edit Profile
                </button>
                <button
                    className="form-btn mt-2"
                    onClick={() => navigate("/profile-security")}
                >
                    Password & Security
                </button>

            </div>
        </div>
    );
}

export default ProfilePage;

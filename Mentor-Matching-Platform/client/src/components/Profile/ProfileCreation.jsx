/**
 * @file ProfileCreation.jsx
 * @description A user-facing form for creating a new personal profile, including demographic and contact details.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../components/Profile/style/ProfileCreation.css";

/**
 * ProfileCreation Component
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.isLoggedIn - Indicates whether the user is currently logged in
 * @param {Function} props.handleLogout - Function to trigger logout
 * @returns {JSX.Element} A form for new users to create their profile
 */
function ProfileCreation({ isLoggedIn, handleLogout }) {
    /**
     * @description State to store form data fields
     */
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        date_of_birth: "",
        address: "",
        city_suburb: "",
        state: "",
        postal_code: "",
        gender: "",
        aboriginal_or_torres_strait_islander: "",
        language_spoken_at_home: "",
        living_situation: "",
    });

    const navigate = useNavigate();

    /**
     * Handle input changes for form fields
     * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement>} e
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    /**
     * Handle form submission to create a profile
     * @param {React.FormEvent<HTMLFormElement>} e
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log("📦 Form data before submit:", formData);

        try {
            const res = await fetch("/api/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) {
                alert("✅ Profile created successfully!");
                navigate("/profile");
            } else {
                alert("❌ " + data.message);
            }
        } catch (err) {
            console.error(err);
            alert("Error saving profile.");
        }
    };

    return (
        <div>
            <div className="form-container">
                <img
                    src="/images/ProfileCreation/1.jpg"
                    alt="Profile illustration"
                    className="creation-image"
                />
                <h2 className="form-title">Personal Details</h2>
                <p className="form-footer">
                    Please provide your personal details accurately. This information will be kept confidential.
                </p>

                <form onSubmit={handleSubmit} className="form-box">
                    {/* Name */}
                    <div className="form-group">
                        <label>Name</label>
                        <input name="first_name" placeholder="First name" value={formData.first_name} onChange={handleChange} required />
                        <input name="last_name" placeholder="Last name" value={formData.last_name} onChange={handleChange} required />
                    </div>

                    {/* Date of Birth */}
                    <div className="form-group">
                        <label>Date of Birth</label>
                        <input name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleChange} required />
                    </div>

                    {/* Address */}
                    <div className="form-group">
                        <label>Address</label>
                        <input name="address" placeholder="Street address" value={formData.address} onChange={handleChange} required />
                    </div>

                    {/* City/Suburb */}
                    <div className="form-group">
                        <label>City / Suburb</label>
                        <input name="city_suburb" placeholder="City or Suburb" value={formData.city_suburb} onChange={handleChange} required />
                    </div>

                    {/* State */}
                    <div className="form-group">
                        <label>State</label>
                        <input name="state" placeholder="State" value={formData.state} onChange={handleChange} required />
                    </div>

                    {/* Postcode */}
                    <div className="form-group">
                        <label>Postcode</label>
                        <input name="postal_code" type="text" maxLength="4" placeholder="Postal code" value={formData.postal_code} onChange={handleChange} required />
                    </div>

                    {/* Gender */}
                    <div className="form-group">
                        <label>Gender</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} required>
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    {/* Aboriginal or Torres Strait Islander status */}
                    <div className="form-group">
                        <label>Are you of Aboriginal or Torres Strait Islander origin?</label>
                        <select name="aboriginal_or_torres_strait_islander" value={formData.aboriginal_or_torres_strait_islander} onChange={handleChange} required>
                            <option value="">Select origin</option>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </div>

                    {/* Language spoken at home */}
                    <div className="form-group">
                        <label>Is a language other than English spoken at home?</label>
                        <input name="language_spoken_at_home" placeholder="Enter language" value={formData.language_spoken_at_home} onChange={handleChange} />
                    </div>

                    {/* Living situation */}
                    <div className="form-group">
                        <label>Living Situation</label>
                        <input name="living_situation" placeholder="e.g. With family, Alone" value={formData.living_situation} onChange={handleChange} />
                    </div>

                    <button className="form-btn" type="submit">Create Account</button>
                </form>
            </div>
        </div>
    );
}

export default ProfileCreation;

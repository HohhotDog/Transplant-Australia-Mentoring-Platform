/**
 * @file PersonalDetails.jsx
 * @description A form component that allows the logged-in user to view and update their personal profile details.
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./style/PersonalDetails.css";

/**
 * PersonalDetails Component
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.isLoggedIn - Indicates if the user is logged in
 * @param {Function} props.handleLogout - Function to log out the user
 * @returns {JSX.Element} The rendered personal details form component
 */
function PersonalDetails({ isLoggedIn, handleLogout }) {
    // State to store form data
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        profile_picture_url: "",
        bio: "",
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
     * Fetch profile data on component mount
     */
    useEffect(() => {
        fetch("/api/profile", {
            method: "GET",
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setFormData(data.profile);
                } else {
                    alert("Failed to load profile.");
                }
            })
            .catch((err) => console.error("Error fetching profile:", err));
    }, []);

    /**
     * Handles input changes in the form
     * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>} e
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    /**
     * Submits the updated profile data to the server
     * @param {React.FormEvent<HTMLFormElement>} e
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) {
                alert("✅ Profile updated successfully.");
                navigate("/profile");
            } else {
                alert("❌ " + data.message);
            }
        } catch (err) {
            console.error(err);
            alert("Error updating profile.");
        }
    };

    return (
        <div>
            <div className="form-container">
                <h2 className="form-title">Personal Details</h2>
                <form onSubmit={handleSubmit} className="form-box">
                    {/* Text Inputs */}
                    <input name="first_name" placeholder="First name" value={formData.first_name} onChange={handleChange} required />
                    <input name="last_name" placeholder="Last name" value={formData.last_name} onChange={handleChange} required />
                    <input name="email" type="email" placeholder="Email" value={formData.email} disabled required />
                    <input name="phone_number" placeholder="Phone Number" value={formData.phone_number} onChange={handleChange} />
                    <input name="profile_picture_url" placeholder="Photo (URL)" value={formData.profile_picture_url} onChange={handleChange} />
                    <textarea name="bio" placeholder="Bio (100 words max)" value={formData.bio} onChange={handleChange} rows={4} />

                    {/* Date input */}
                    <input name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleChange} />

                    {/* Address Info */}
                    <input name="state" placeholder="State" value={formData.state} onChange={handleChange} />
                    <input name="city_suburb" placeholder="Suburb" value={formData.city_suburb} onChange={handleChange} />
                    <input name="postal_code" placeholder="Postcode" value={formData.postal_code} onChange={handleChange} />
                    <input name="address" placeholder="Address" value={formData.address} onChange={handleChange} />

                    {/* Select Inputs */}
                    <select name="gender" value={formData.gender} onChange={handleChange}>
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>

                    <select name="aboriginal_or_torres_strait_islander" value={formData.aboriginal_or_torres_strait_islander} onChange={handleChange}>
                        <option value="">Aboriginal or Torres Strait Islander Status</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>

                    {/* Other Inputs */}
                    <input name="language_spoken_at_home" placeholder="Language other than English spoken at home" value={formData.language_spoken_at_home} onChange={handleChange} />
                    <input name="living_situation" placeholder="Living Situation" value={formData.living_situation} onChange={handleChange} />

                    <button type="submit" className="form-btn mt-4">Save</button>
                </form>
            </div>
        </div>
    );
}

export default PersonalDetails;

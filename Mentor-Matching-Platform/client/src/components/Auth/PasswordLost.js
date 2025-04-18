// src/components/Auth/PasswordLost.js
import React, { useState } from "react";
import NavBar from "../Navigation/NavBar";
import "../../components/Auth/style/Register.css";

function PasswordLost({ isLoggedIn, handleLogout }) {
    const [email, setEmail] = useState("");
    const [securityQuestion, setSecurityQuestion] = useState("");
    const [securityAnswer, setSecurityAnswer] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    const handleReset = async (e) => {
        e.preventDefault();

        if (!passwordRegex.test(newPassword)) {
            alert("Password must meet complexity requirements.");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        try {
            const res = await fetch("/api/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, securityAnswer, newPassword }),
            });

            const data = await res.json();
            if (data.success) {
                alert("✅ Password reset successfully!");
            } else {
                alert("❌ " + data.message);
            }
        } catch (err) {
            console.error(err);
            alert("Error resetting password.");
        }
    };

    return (
        <div>
            <NavBar isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
            <div className="form-container">
                <h2 className="form-title">Forgot Password</h2>
                <p className="form-footer">To reset your password, please answer your security question:</p>

                <form onSubmit={handleReset} className="form-box">
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>

                    <div className="form-group">
                        <label>Select a security question</label>
                        <select value={securityQuestion} onChange={(e) => setSecurityQuestion(e.target.value)} required>
                            <option value="">-- Choose a question --</option>
                            <option value="What is your childhood pet's name?">What is your childhood pet's name?</option>
                            <option value="What is the name of your first school?">What is the name of your first school?</option>
                            <option value="In what city were you born?">In what city were you born?</option>
                            <option value="What is your favorite teacher's name?">What is your favorite teacher's name?</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Your Answer</label>
                        <input type="text" value={securityAnswer} onChange={(e) => setSecurityAnswer(e.target.value)} required />
                    </div>

                    <div className="form-group">
                        <label>New Password</label>
                        <div className="form-password-toggle">
                            <input type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                            <span className="toggle-icon" onClick={() => setShowPassword(!showPassword)}>👁️</span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Confirm New Password</label>
                        <div className="form-password-toggle">
                            <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                            <span className="toggle-icon" onClick={() => setShowPassword(!showPassword)}>👁️</span>
                        </div>
                    </div>

                    <button className="form-btn" type="submit">Reset Password</button>
                </form>
            </div>
        </div>
    );
}

export default PasswordLost;

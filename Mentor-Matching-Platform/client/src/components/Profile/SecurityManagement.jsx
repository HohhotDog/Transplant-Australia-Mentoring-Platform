// src/components/Profile/SecurityManagement.jsx
import React, { useState, useEffect } from "react";
import "../../components/Profile/style/SecurityManagement.css";

function SecurityManagement({ isLoggedIn, handleLogout }) {
    const [securityQuestion, setSecurityQuestion] = useState("");
    const [securityAnswer, setSecurityAnswer] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        async function fetchSecurityQuestion() {
            try {
                const res = await fetch("/api/security-question", {
                    credentials: "include"
                });
                const data = await res.json();
                if (data.success) {
                    setSecurityQuestion(data.question);
                } else {
                    setSecurityQuestion("(Unable to load security question)");
                }
            } catch (err) {
                console.error("Error fetching security question:", err);
                setSecurityQuestion("(Server error)");
            }
        }

        fetchSecurityQuestion();
    }, []);

    const handleChangePassword = async () => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;

        if (newPassword !== confirmPassword) {
            alert("❌ New passwords do not match.");
            return;
        }

        if (!passwordRegex.test(newPassword)) {
            alert("❌ Password must be at least 6 characters long and include uppercase, lowercase, number, and special character.");
            return;
        }

        if (newPassword === currentPassword) {
            alert("❌ New password must be different from the current password.");
            return;
        }

        try {
            const res = await fetch("/api/update-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    securityAnswer,
                    currentPassword,
                    newPassword,
                    confirmPassword,
                }),
            });

            const data = await res.json();
            if (data.success) {
                alert("✅ Password updated successfully.");
                setSecurityAnswer("");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                alert("❌ " + data.message);
            }
        } catch (err) {
            console.error(err);
            alert("❌ Server error.");
        }
    };

    return (
        <div>

            <div className="security-section">
                <h2 className="security-title">Security</h2>

                <h3 className="security-subtitle">Change Password</h3>
                <p className="security-note">
                    To reset your password, please answer your security question:
                    <br />
                    <span className="security-question">
                        Security Question: {securityQuestion}
                    </span>
                </p>

                <div className="security-form">
                    <input
                        className="security-input"
                        type="text"
                        placeholder="Enter your answer"
                        value={securityAnswer}
                        onChange={(e) => setSecurityAnswer(e.target.value)}
                        required
                    />
                    <input
                        className="security-input"
                        type="password"
                        placeholder="Enter your current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                    />
                    <input
                        className="security-input"
                        type="password"
                        placeholder="Enter your new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                    <input
                        className="security-input"
                        type="password"
                        placeholder="Confirm your new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <button className="security-btn" onClick={handleChangePassword}>
                        Change Password
                    </button>
                </div>

                <div className="security-recovery">
                    <h3 className="security-subtitle">Forgot Password</h3>
                    <p className="security-note">
                        If you’ve forgotten your password, follow the steps below to recover access to your account.
                    </p>
                    <button
                        className="security-recovery-btn"
                        onClick={() => alert("🔐 Account recovery not implemented.")}
                    >
                        Initiate Account Recovery
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SecurityManagement;

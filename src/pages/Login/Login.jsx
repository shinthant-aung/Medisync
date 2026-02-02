// src/pages/Login/Login.jsx
import React, { useState } from "react";
import "./Login.css";

const Login = ({ onLogin }) => {
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      console.log("Sending data to backend...", { email, password, role });

      const response = await fetch("http://localhost:5001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();
      console.log("Backend replied:", data);

      if (data.success) {
        // 1. Save User Info to Browser Memory
        localStorage.setItem("userFullName", data.user.full_name);
        localStorage.setItem("userEmail", data.user.email);

        // 2. Log the user in (Call this ONLY ONCE)
        onLogin(role);
      } else {
        // If database says "No", show the error
        setError("Invalid Email or Password!");
      }
    } catch (err) {
      console.error("Connection Error:", err);
      setError("Cannot connect to server. Check if backend is running.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="brand-title">✚ MediSync</div>
        <p className="brand-subtitle">Secure Clinic Management</p>
      </div>

      <div className="login-right">
        <div className="login-box">
          {!role ? (
            <div className="step-role">
              <h2>Welcome to MediSync</h2>
              <p className="instruction">
                Please select your role to continue.
              </p>

              <div className="form-group">
                <select
                  value={role}
                  onChange={handleRoleChange}
                  className="role-select"
                >
                  <option value="" disabled>
                    Select your role
                  </option>
                  <option value="doctor">Doctor</option>
                  <option value="nurse">Nurse</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          ) : (
            <form className="step-login" onSubmit={handleSubmit}>
              <h2>{role.charAt(0).toUpperCase() + role.slice(1)} Portal</h2>

              {/* Show Error Message in Red */}
              {error && (
                <div
                  style={{
                    color: "red",
                    background: "#ffe6e6",
                    padding: "10px",
                    borderRadius: "5px",
                    marginBottom: "15px",
                  }}
                >
                  {error}
                </div>
              )}

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="primary-btn">
                Sign In
              </button>

              <div
                className="back-link"
                onClick={() => {
                  setRole("");
                  setError("");
                }}
              >
                ← Choose a different role
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;

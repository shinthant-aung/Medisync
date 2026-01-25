// src/pages/Login/Login.jsx
import React, { useState } from "react";
import "./Login.css";

// 1. We added { onLogin } here so this page can talk to App.jsx
const Login = ({ onLogin }) => {
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 2. SIMULATION LOGIC:
    // Instead of connecting to a backend, we just check if fields are filled.
    if (role && username && password) {
      // This tells App.jsx: "User successfully logged in as Admin!"
      onLogin(role);
    } else {
      alert("Please fill in all fields (User/Pass can be anything for now)");
    }
  };

  return (
    <div className="login-page">
      {/* LEFT SIDE: Branding */}
      <div className="login-left">
        <div className="brand-title">MediSync</div>
        <p className="brand-subtitle">
          Next-generation hospital management. Secure, efficient, and reliable.
        </p>
      </div>

      {/* RIGHT SIDE: Form */}
      <div className="login-right">
        <div className="login-box">
          {!role ? (
            /* STEP 1: SELECT ROLE */
            <div className="step-role">
              <h2>Welcome Back</h2>
              <p className="instruction">
                Please select your portal to continue.
              </p>

              <div className="form-group">
                <label>I am a...</label>
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
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>
          ) : (
            /* STEP 2: LOGIN FORM */
            <form className="step-login" onSubmit={handleSubmit}>
              <h2>{role.charAt(0).toUpperCase() + role.slice(1)} Portal</h2>
              <p className="instruction">
                Enter your credentials to access the dashboard.
              </p>

              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  placeholder="e.g. admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Any password works"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="primary-btn">
                Sign In
              </button>

              <div className="back-link" onClick={() => setRole("")}>
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

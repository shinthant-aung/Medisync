// src/pages/Doctor/DoctorLayout.jsx
import React, { useState, useEffect } from "react";
import "./Doctor.css"; // Ensure you have this file (or use Admin.css)

// --- IMPORT YOUR PAGES ---
import DoctorDashboard from "./DoctorDashboard";
import DoctorPatients from "./DoctorPatients"; // <--- Make sure this matches your file name!
import DiseaseTrend from "./DiseaseTrend";

const DoctorLayout = ({ onLogout }) => {
  // State to track the active page
  const [activePage, setActivePage] = useState("dashboard");

  // State for user profile info
  const [user, setUser] = useState({ name: "Doctor", email: "" });

  // Load user data from localStorage on mount
  useEffect(() => {
    const savedName = localStorage.getItem("userFullName");
    const savedEmail = localStorage.getItem("userEmail");

    if (savedName) {
      setUser({
        name: savedName,
        email: savedEmail || "",
      });
    }
  }, []);

  // Function to determine which component to render
  const renderContent = () => {
    switch (activePage) {
      case "dashboard":
        return <DoctorDashboard />;
      case "monitor":
        return <DiseaseTrend />;
      case "my-patients":
        return <DoctorPatients />;
      default:
        return <DoctorDashboard />;
    }
  };

  return (
    <div className="admin-container">
      {/* --- SIDEBAR --- */}
      <div className="sidebar">
        <div>
          <div className="sidebar-brand">✚ MediSync</div>
          <nav className="nav-links">
            <div
              className={`nav-item ${
                activePage === "dashboard" ? "active" : ""
              }`}
              onClick={() => setActivePage("dashboard")}
            >
              🏠 Dashboard
            </div>

            <div
              className={`nav-item ${activePage === "monitor" ? "active" : ""}`}
              onClick={() => setActivePage("monitor")}
            >
              📈 Disease Trend Monitor
            </div>

            <div
              className={`nav-item ${
                activePage === "my-patients" ? "active" : ""
              }`}
              onClick={() => setActivePage("my-patients")}
            >
              📋 My Patients
            </div>
          </nav>
        </div>

        {/* --- USER PROFILE (Bottom Left) --- */}
        <div className="user-profile">
          {/* <div className="avatar-circle">{user.name.charAt(0)}</div> */}
          <div className="user-info">
            <h4>{user.name}</h4>
            <span style={{ fontSize: "0.8rem", color: "#cbd5e1" }}>
              {user.email}
            </span>
          </div>
          <button
            onClick={onLogout}
            style={{
              marginLeft: "auto",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: "0.8rem",
              color: "black",
            }}
            title="Logout"
          >
            Logout
          </button>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="admin-content">{renderContent()}</main>
    </div>
  );
};

export default DoctorLayout;

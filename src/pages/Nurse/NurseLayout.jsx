import React, { useState, useEffect } from "react";
import "./Nurse.css"; // Ensure you have this file (or use Admin.css)

// --- IMPORT YOUR NURSE PAGES ---
import NurseDashboard from "./NurseDashboard";
import NurseCheckIn from "./NurseCheckIn";
import NursePatient from "./NursePatient"; // Check your filename (NursePatient.jsx or NursePatientList.jsx)
import NurseMedicine from "./NurseMedicine";

const NurseLayout = ({ onLogout }) => {
  // State to track the active page
  const [activePage, setActivePage] = useState("dashboard");

  // State for user profile info
  const [user, setUser] = useState({ name: "Nurse", email: "" });

  // Load user data from localStorage on mount
  useEffect(() => {
    // Ensure these keys match what you save during Login
    const savedName = localStorage.getItem("userFullName");
    const savedEmail = localStorage.getItem("userEmail"); // or 'user' object parsing

    // Fallback if using the 'user' object in localStorage
    const savedUserObj = JSON.parse(localStorage.getItem("user"));

    if (savedName) {
      setUser({ name: savedName, email: savedEmail || "" });
    } else if (savedUserObj) {
      setUser({ name: savedUserObj.full_name, email: savedUserObj.email });
    }
  }, []);

  // Function to determine which component to render
  const renderContent = () => {
    switch (activePage) {
      case "dashboard":
        return <NurseDashboard />;
      case "checkin":
        return <NurseCheckIn />;
      case "patients":
        return <NursePatient />;
      case "medicine":
        return <NurseMedicine />;
      default:
        return <NurseDashboard />;
    }
  };

  return (
    <div className="admin-container">
      {/* --- SIDEBAR --- */}
      <div className="sidebar">
        <div>
          <div className="sidebar-brand">✚ MediSync</div>
          <nav className="nav-links">
            {/* 1. Dashboard */}
            <div
              className={`nav-item ${
                activePage === "dashboard" ? "active" : ""
              }`}
              onClick={() => setActivePage("dashboard")}
            >
              🏠 Dashboard
            </div>

            {/* 2. Check In */}
            <div
              className={`nav-item ${activePage === "checkin" ? "active" : ""}`}
              onClick={() => setActivePage("checkin")}
            >
              📝 Check In
            </div>

            {/* 3. Patient List */}
            <div
              className={`nav-item ${
                activePage === "patients" ? "active" : ""
              }`}
              onClick={() => setActivePage("patients")}
            >
              📋 Patient List
            </div>

            {/* 4. Medicine Inventory */}
            <div
              className={`nav-item ${
                activePage === "medicine" ? "active" : ""
              }`}
              onClick={() => setActivePage("medicine")}
            >
              💊 Medicine
            </div>
          </nav>
        </div>

        {/* --- USER PROFILE (Bottom Left) --- */}
        <div className="user-profile">
          {/* Avatar Circle (Optional) */}
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
              color: "black", // Explicitly black as requested
              fontWeight: "bold",
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

export default NurseLayout;

import React, { useState } from "react";
import "./Nurse.css";

// Import Pages
import NurseDashboard from "./NurseDashboard";
import NurseCheckIn from "./NurseCheckIn";
import NursePatient from "./NursePatient";
import NurseMedicine from "./NurseMedicine";

const NurseLayout = ({ onLogout }) => {
  const [activePage, setActivePage] = useState("dashboard");

  const renderContent = () => {
    switch (activePage) {
      case "dashboard":
        return <NurseDashboard />;
      case "checkin":
        return <NurseCheckIn />;
      case "patient":
        return <NursePatient />;
      case "medicine":
        return <NurseMedicine />;
      default:
        return <NurseDashboard />;
    }
  };

  return (
    <div className="nurse-container">
      {/* SIDEBAR */}
      <div className="sidebar">
        <div>
          <div className="sidebar-brand">☒ Logo</div>
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
              className={`nav-item ${activePage === "checkin" ? "active" : ""}`}
              onClick={() => setActivePage("checkin")}
            >
              ❤️ Check-In
            </div>
            <div
              className={`nav-item ${activePage === "patient" ? "active" : ""}`}
              onClick={() => setActivePage("patient")}
            >
              📋 Patient
            </div>
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

        {/* User Profile */}
        <div className="user-profile">
          <div className="avatar-circle"></div>
          <div className="user-info">
            <h4>Nurse_Name</h4>
            <span>nurse.com</span>
          </div>
          <button
            onClick={onLogout}
            style={{
              marginLeft: "auto",
              border: "none",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            🚪
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="nurse-content">{renderContent()}</main>
    </div>
  );
};

export default NurseLayout;

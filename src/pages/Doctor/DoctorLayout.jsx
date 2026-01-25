import React, { useState } from "react";
import "./Doctor.css";

// Import Pages
import DoctorDashboard from "./DoctorDashboard";
import DoctorMedicine from "./DoctorMedicine";
import DiseaseTrend from "./DiseaseTrend";
import DoctorPatientList from "./DoctorPatientList";
import "./Doctor.css";

const DoctorLayout = ({ onLogout }) => {
  const [activePage, setActivePage] = useState("dashboard");

  const renderContent = () => {
    switch (activePage) {
      case "dashboard":
        return (
          <DoctorDashboard onSelectPatient={() => setActivePage("medicine")} />
        );
      case "medicine":
        return <DoctorMedicine />;
      case "trends":
        return <DiseaseTrend />;
      case "patient":
        return <DoctorPatientList />;
      default:
        return <DoctorDashboard />;
    }
  };

  return (
    <div className="doctor-container">
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
              className={`nav-item ${activePage === "trends" ? "active" : ""}`}
              onClick={() => setActivePage("trends")}
            >
              📈 Disease Trend Monitor
            </div>
            <div
              className={`nav-item ${activePage === "patient" ? "active" : ""}`}
              onClick={() => setActivePage("patient")}
            >
              📋 Patient
            </div>
          </nav>
        </div>

        {/* User Profile */}
        <div className="user-profile">
          <div className="avatar-circle"></div>
          <div className="user-info">
            <h4>Doctor_Name</h4>
            <span>doc@.com</span>
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
      <main className="doctor-content">{renderContent()}</main>
    </div>
  );
};

export default DoctorLayout;

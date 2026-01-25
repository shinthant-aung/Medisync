import React, { useState } from "react";
import "./Admin.css";

// Import all your pages (We will create these next)
import AdminDashboard from "./AdminDashboard";
import Booking from "./Booking";
import NewPatient from "./NewPatient";
import PatientList from "./PatientList";
import DoctorList from "./DoctorList";
import NurseList from "./NurseList";

const AdminLayout = ({ onLogout }) => {
  // State to track which page is active
  const [activePage, setActivePage] = useState("dashboard");

  // Helper to render the correct component
  const renderContent = () => {
    switch (activePage) {
      case "dashboard":
        return <AdminDashboard />;
      case "booking":
        return <Booking />;
      case "new-patient":
        return <NewPatient />;
      case "patients":
        return <PatientList />;
      case "doctors":
        return <DoctorList />;
      case "nurses":
        return <NurseList />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="admin-container">
      {/* SIDEBAR */}
      <div className="sidebar">
        <div>
          <div className="sidebar-brand">☒ MediSync</div>
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
              className={`nav-item ${activePage === "booking" ? "active" : ""}`}
              onClick={() => setActivePage("booking")}
            >
              📅 Booking
            </div>
            <div
              className={`nav-item ${
                activePage === "new-patient" ? "active" : ""
              }`}
              onClick={() => setActivePage("new-patient")}
            >
              ➕ New Patient
            </div>
            <div
              className={`nav-item ${
                activePage === "patients" ? "active" : ""
              }`}
              onClick={() => setActivePage("patients")}
            >
              📋 Patient List
            </div>
            <div
              className={`nav-item ${activePage === "doctors" ? "active" : ""}`}
              onClick={() => setActivePage("doctors")}
            >
              👨‍⚕️ Doctor List
            </div>
            <div
              className={`nav-item ${activePage === "nurses" ? "active" : ""}`}
              onClick={() => setActivePage("nurses")}
            >
              👩‍⚕️ Nurse List
            </div>
          </nav>
        </div>

        {/* User Profile at Bottom */}
        <div className="user-profile">
          <div className="avatar-circle"></div>
          <div className="user-info">
            <h4>Admin_Name</h4>
            <span>admin.com</span>
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

      {/* MAIN CONTENT AREA */}
      <main className="admin-content">{renderContent()}</main>
    </div>
  );
};

export default AdminLayout;

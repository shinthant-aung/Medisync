// src/pages/Admin/AdminLayout.jsx
import React, { useState, useEffect } from "react";
import "./Admin.css";

// Import all your pages
import AdminDashboard from "./AdminDashboard";
import Booking from "./Booking";
import PatientList from "./PatientList";
import DoctorList from "./DoctorList";
import NurseList from "./NurseList";

const AdminLayout = ({ onLogout }) => {
  // State to track which page is active
  const [activePage, setActivePage] = useState("dashboard");

  // NEW: State to store the User's Name & Email
  const [user, setUser] = useState({
    name: "Admin",
    email: "admin@hospital.com",
  });

  // NEW: Fetch real user data when the page loads
  useEffect(() => {
    const savedName = localStorage.getItem("userFullName");
    const savedEmail = localStorage.getItem("userEmail");

    if (savedName) {
      setUser({
        name: savedName,
        email: savedEmail || "No Email Found",
      });
    }
  }, []);

  // Helper to render the correct component
  const renderContent = () => {
    switch (activePage) {
      case "dashboard":
        return <AdminDashboard />;
      case "booking":
        return <Booking />;
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
              className={`nav-item ${activePage === "booking" ? "active" : ""}`}
              onClick={() => setActivePage("booking")}
            >
              📅 Booking
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

        {/* --- DYNAMIC USER PROFILE SECTION --- */}
        <div className="user-profile">
          <div className="user-info">
            {/* Show Real Name */}
            <h4>{user.name}</h4>
            {/* Show Real Email */}
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
            }}
            title="Logout"
          >
            Logout
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="admin-content">{renderContent()}</main>
    </div>
  );
};

export default AdminLayout;

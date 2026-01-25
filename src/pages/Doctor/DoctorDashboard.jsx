import React from "react";

const DoctorDashboard = ({ onSelectPatient }) => {
  return (
    <div>
      {/* Top Welcome Card */}
      <div className="welcome-card">
        <h2>Welcome, Doctor</h2>
        <p>
          Here are your appointments for today. You can view patient details,
          update diagnoses, and manage prescriptions.
        </p>
      </div>

      {/* Title & Search Bar */}
      <div className="header-row">
        <h2>Today's Appointments</h2>
        <input
          type="text"
          placeholder="Search medicine..."
          className="search-input"
        />
      </div>

      {/* Table Header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr 1fr 1.5fr 100px",
          background: "#e5e5e5",
          padding: "15px",
          fontWeight: "bold",
          borderRadius: "8px 8px 0 0",
        }}
      >
        <div>Patient ↓</div>
        <div>Time</div>
        <div>Status</div>
        <div>Appointment Type</div>
        <div>Action</div>
      </div>

      {/* Table Rows (Simulated Data) */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr 1fr 1.5fr 100px",
            padding: "15px",
            borderBottom: "1px solid #eee",
            alignItems: "center",
            background: "white",
          }}
        >
          {/* Grey Bars representing text */}
          <div className="row-bar" style={{ width: "60%" }}></div>
          <div className="row-bar" style={{ width: "50%" }}></div>
          <div className="row-bar" style={{ width: "50%" }}></div>
          <div className="row-bar" style={{ width: "70%" }}></div>

          {/* THE IMPORTANT BUTTON: Switches to Medicine Page */}
          <button className="select-btn" onClick={onSelectPatient}>
            Select
          </button>
        </div>
      ))}
    </div>
  );
};

export default DoctorDashboard;

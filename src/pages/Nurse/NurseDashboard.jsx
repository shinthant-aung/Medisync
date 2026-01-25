import React from "react";

const NurseDashboard = () => {
  return (
    <div>
      <div className="welcome-card">
        <h2>Welcome, Nurse</h2>
        <p>
          Here are the patients waiting for check-in. You can record vitals and
          prepare them for their appointment.
        </p>
      </div>

      <div className="header-row">
        <h2>Prescription</h2>
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
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          background: "#e5e5e5",
          padding: "15px",
          fontWeight: "bold",
        }}
      >
        <div>Patient ↓</div>
        <div>Doctor</div>
        <div>Time</div>
        <div>Prescription</div>
      </div>

      {/* Table Rows */}
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            padding: "20px 15px",
            borderBottom: "1px solid #eee",
            alignItems: "center",
          }}
        >
          <div className="row-bar" style={{ width: "60%" }}></div>
          <div className="row-bar" style={{ width: "60%" }}></div>
          <div className="row-bar" style={{ width: "60%" }}></div>
          <div className="row-bar" style={{ width: "60%" }}></div>
        </div>
      ))}
    </div>
  );
};
export default NurseDashboard;

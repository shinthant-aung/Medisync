import React, { useEffect, useState } from "react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_patients: 0,
    active_doctors: 0,
    active_nurses: 0,
  });

  useEffect(() => {
    fetch("http://localhost:5001/admin/dashboard")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Error fetching stats:", err));
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Inter, sans-serif" }}>
      <h2
        style={{
          fontSize: "1.8rem",
          fontWeight: "bold",
          marginBottom: "30px",
          color: "#111827",
        }}
      >
        Dashboard Overview
      </h2>

      {/* STATS CARDS GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "24px",
          marginBottom: "40px",
        }}
      >
        {/* Total Patients */}
        <div style={cardStyle}>
          <h3
            style={{
              fontSize: "0.9rem",
              color: "#6b7280",
              fontWeight: "600",
              marginBottom: "8px",
            }}
          >
            Total Patients
          </h3>
          <p
            style={{
              fontSize: "3rem",
              fontWeight: "bold",
              color: "#111827",
              margin: 0,
            }}
          >
            {stats.total_patients ?? 0}
          </p>
        </div>

        {/* Available Doctors (Renamed) */}
        <div style={cardStyle}>
          <h3
            style={{
              fontSize: "0.9rem",
              color: "#6b7280",
              fontWeight: "600",
              marginBottom: "8px",
            }}
          >
            Available Doctors
          </h3>
          <p
            style={{
              fontSize: "3rem",
              fontWeight: "bold",
              color: "#2563eb",
              margin: 0,
            }}
          >
            {stats.active_doctors ?? 0}
          </p>
        </div>

        {/* Available Nurses */}
        <div style={cardStyle}>
          <h3
            style={{
              fontSize: "0.9rem",
              color: "#6b7280",
              fontWeight: "600",
              marginBottom: "8px",
            }}
          >
            Available Nurses
          </h3>
          <p
            style={{
              fontSize: "3rem",
              fontWeight: "bold",
              color: "#059669",
              margin: 0,
            }}
          >
            {stats.active_nurses ?? 0}
          </p>
        </div>
      </div>

      {/* WELCOME SECTION */}
      <div
        style={{
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "16px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: "#111827",
            marginBottom: "10px",
          }}
        >
          Welcome, Administrator
        </h2>
        <p style={{ color: "#6b7280", fontSize: "1rem", lineHeight: "1.5" }}>
          Use the sidebar to manage hospital records, add new staff, or update
          patient details.
        </p>
      </div>
    </div>
  );
};

const cardStyle = {
  backgroundColor: "white",
  padding: "30px",
  borderRadius: "16px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  border: "1px solid #e5e7eb",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

export default AdminDashboard;

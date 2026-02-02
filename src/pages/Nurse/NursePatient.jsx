import React, { useState, useEffect } from "react";

const NursePatient = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Fetch Patients
  useEffect(() => {
    fetch("http://localhost:5001/patients")
      .then((res) => res.json())
      .then((data) => setPatients(data))
      .catch((err) => console.error("Error fetching patients:", err));
  }, []);

  // 2. Filter Patients
  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      style={{
        padding: "30px",
        backgroundColor: "#ffffff",
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* --- HEADER --- */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <h1
          style={{
            fontSize: "1.8rem",
            fontWeight: "bold",
            color: "#111827",
            margin: 0,
          }}
        >
          Patient List
        </h1>

        {/* Search Bar (Pill Shape like Check-in) */}
        <div style={{ position: "relative", width: "300px" }}>
          <input
            type="text"
            placeholder="Search patient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 20px 12px 20px",
              borderRadius: "30px", // Pill shape
              border: "1px solid #e2e8f0",
              backgroundColor: "#fff",
              fontSize: "0.95rem",
              outline: "none",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          />
          <span
            style={{
              position: "absolute",
              right: "20px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#9ca3af",
              fontSize: "1.1rem",
            }}
          >
            🔍
          </span>
        </div>
      </div>

      {/* --- TABLE (Matching Check-in Design) --- */}
      <div
        style={{
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid #e5e7eb",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "white",
          }}
        >
          <thead>
            {/* Gray Header Row */}
            <tr style={{ backgroundColor: "#e5e5e5", textAlign: "left" }}>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Gender</th>
              <th style={thStyle}>Phone</th>
              <th style={thStyle}>Date of Birth</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  style={{
                    padding: "50px",
                    textAlign: "center",
                    color: "#6b7280",
                    fontSize: "1.1rem",
                  }}
                >
                  No patients found.
                </td>
              </tr>
            ) : (
              filteredPatients.map((patient) => (
                <tr
                  key={patient.patient_id}
                  style={{ borderBottom: "1px solid #f3f4f6" }}
                >
                  <td style={tdStyle}>
                    <span style={{ fontWeight: "600", color: "#111827" }}>
                      {patient.name}
                    </span>
                  </td>
                  <td style={tdStyle}>{patient.gender || "-"}</td>
                  <td style={tdStyle}>{patient.phone || "-"}</td>
                  <td style={tdStyle}>
                    {patient.date_of_birth
                      ? patient.date_of_birth.split("T")[0]
                      : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- STYLES ---
const thStyle = {
  padding: "18px 24px",
  fontSize: "0.95rem",
  fontWeight: "bold",
  color: "#374151",
  letterSpacing: "0.03em",
};

const tdStyle = {
  padding: "18px 24px",
  fontSize: "1rem",
  color: "#4b5563",
  verticalAlign: "middle",
};

export default NursePatient;

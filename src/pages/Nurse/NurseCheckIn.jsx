import React, { useState, useEffect } from "react";

const NurseCheckIn = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // MODAL STATE
  const [showModal, setShowModal] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);

  // VITALS FORM STATE
  // REMOVED 'prescriptions' from here so Nurse cannot add them
  const [vitals, setVitals] = useState({
    height: "",
    weight: "",
    pulse_rate: "",
    temperature: "",
    blood_pressure: "",
    spo2: "",
    allergies: "",
  });

  // 1. Fetch Appointments (With Filter to remove Mike Ross/Michael Brown)
  const fetchAppointments = () => {
    fetch("http://localhost:5001/appointments")
      .then((res) => res.json())
      .then((data) => {
        const scheduled = data.filter(
          (a) =>
            a.status === "Scheduled" &&
            a.patient_name !== "Mike Ross" &&
            a.patient_name !== "Michael Brown"
        );
        setAppointments(scheduled);
        setLoading(false);
      })
      .catch((err) => console.error("Error:", err));
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // 2. Open Modal
  const handleRecordClick = (appt) => {
    setSelectedAppt(appt);
    // Reset form (No prescription field)
    setVitals({
      height: "",
      weight: "",
      pulse_rate: "",
      temperature: "",
      blood_pressure: "",
      spo2: "",
      allergies: "",
    });
    setShowModal(true);
  };

  // 3. Handle Input Change
  const handleChange = (e) => {
    setVitals({ ...vitals, [e.target.name]: e.target.value });
  };

  // 4. Submit Vitals
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppt) return;

    try {
      // We send an empty string for prescription since Nurse can't add it
      const response = await fetch("http://localhost:5001/vitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_name: selectedAppt.patient_name,
          prescriptions: "", // Force empty prescription for Nurse
          ...vitals,
        }),
      });

      if (response.ok) {
        alert("✅ Vitals Recorded Successfully!");
        setShowModal(false);
        fetchAppointments(); // Refresh list
      } else {
        alert("❌ Failed to save.");
      }
    } catch (err) {
      console.error("Error saving:", err);
      alert("Server Error");
    }
  };

  const filteredList = appointments.filter((appt) =>
    appt.patient_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* HEADER */}
      <div
        className="header-row"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
          Patient Check-in
        </h2>
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Search patient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "10px 40px 10px 15px",
              borderRadius: "20px",
              border: "1px solid #e2e8f0",
              width: "250px",
              outline: "none",
            }}
          />
          <span
            style={{
              position: "absolute",
              right: "15px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
            }}
          >
            🔍
          </span>
        </div>
      </div>

      {/* TABLE */}
      <div
        className="table-container"
        style={{
          background: "white",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                background: "#e2e2e2",
                color: "#333",
                textAlign: "left",
              }}
            >
              <th style={{ padding: "15px" }}>Patient ↓</th>
              <th style={{ padding: "15px" }}>Doctor</th>
              <th style={{ padding: "15px" }}>Reason</th>
              <th style={{ padding: "15px" }}>Diagnosis</th>
              <th style={{ padding: "15px", textAlign: "center" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="5"
                  style={{ padding: "20px", textAlign: "center" }}
                >
                  Loading schedule...
                </td>
              </tr>
            ) : filteredList.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "#64748b",
                  }}
                >
                  No pending check-ins.
                </td>
              </tr>
            ) : (
              filteredList.map((appt) => (
                <tr key={appt.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "15px", fontWeight: "600" }}>
                    {appt.patient_name}
                  </td>
                  <td style={{ padding: "15px", color: "#64748b" }}>
                    {appt.doctor_name}
                  </td>
                  <td style={{ padding: "15px", color: "#64748b" }}>
                    {appt.reason}
                  </td>

                  {/* DIAGNOSIS COLUMN */}
                  <td
                    style={{
                      padding: "15px",
                      color: appt.diagnosis ? "#059669" : "#94a3b8",
                      fontWeight: appt.diagnosis ? "bold" : "normal",
                      fontStyle: appt.diagnosis ? "normal" : "italic",
                    }}
                  >
                    {appt.diagnosis || "Pending..."}
                  </td>

                  <td style={{ padding: "15px", textAlign: "center" }}>
                    <button
                      onClick={() => handleRecordClick(appt)}
                      style={{
                        background: "white",
                        border: "1px solid #334155",
                        borderRadius: "20px",
                        padding: "6px 20px",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      Record
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- POPUP MODAL --- */}
      {showModal && selectedAppt && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(255,255,255,0.95)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              width: "800px",
              padding: "40px",
              borderRadius: "8px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
              position: "relative",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "none",
                border: "none",
                fontSize: "1.5rem",
                cursor: "pointer",
              }}
            >
              ×
            </button>

            <h1
              style={{
                textAlign: "center",
                fontSize: "2rem",
                fontWeight: "bold",
                marginBottom: "30px",
                color: "#111827",
              }}
            >
              Vital Records for {selectedAppt.patient_name}
            </h1>

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <div style={rowStyle}>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Height</label>
                  <input
                    name="height"
                    value={vitals.height}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Weight</label>
                  <input
                    name="weight"
                    value={vitals.weight}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div style={rowStyle}>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Pulse Rate</label>
                  <input
                    name="pulse_rate"
                    value={vitals.pulse_rate}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Temperature</label>
                  <input
                    name="temperature"
                    value={vitals.temperature}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div style={rowStyle}>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Blood Pressure</label>
                  <input
                    name="blood_pressure"
                    value={vitals.blood_pressure}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>SPO2</label>
                  <input
                    name="spo2"
                    value={vitals.spo2}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* ALLERGIES ONLY */}
              <div style={fieldGroupStyle}>
                <label style={{ ...labelStyle, color: "#dc2626" }}>
                  Allergies
                </label>
                <input
                  name="allergies"
                  placeholder="e.g. Peanuts, None"
                  value={vitals.allergies}
                  onChange={handleChange}
                  style={{
                    ...inputStyle,
                    border: "1px solid #fca5a5",
                    backgroundColor: "#fef2f2",
                  }}
                />
              </div>

              {/* REMOVED PRESCRIPTION BOX FROM HERE */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "10px",
                }}
              >
                <button
                  type="submit"
                  style={{
                    fontSize: "1.5rem",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#000",
                    fontWeight: "400",
                  }}
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- STYLES ---
const rowStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "30px",
};
const fieldGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "5px",
};
const labelStyle = { fontSize: "0.9rem", color: "#374151", fontWeight: "600" };
const inputStyle = {
  padding: "10px",
  borderRadius: "4px",
  border: "none",
  backgroundColor: "#F3F4F6",
  fontSize: "1rem",
  outline: "none",
};

export default NurseCheckIn;

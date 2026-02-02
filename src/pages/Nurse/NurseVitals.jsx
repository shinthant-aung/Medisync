import React, { useState } from "react";

const NurseVitals = ({ patient, onBack }) => {
  const [vitals, setVitals] = useState({
    blood_pressure: "",
    temperature: "",
    heart_rate: "",
    height: "",
    weight: "",
    spo2: "",
  });

  const handleChange = (e) => {
    setVitals({ ...vitals, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5001/vitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // We send 'allergies' data here. Backend will pick it up and update the Patient List.
        body: JSON.stringify({ patient_name: patient.patient_name, ...vitals }),
      });

      if (response.ok) {
        alert("✅ Vitals & Allergies Recorded!");
        onBack();
      } else {
        alert("❌ Failed to save.");
      }
    } catch (err) {
      console.error(err);
      alert("Server Error");
    }
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        background: "white",
        padding: "40px",
        borderRadius: "12px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
      }}
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        style={{
          marginBottom: "20px",
          border: "none",
          background: "transparent",
          color: "#64748b",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "5px",
          fontSize: "1rem",
        }}
      >
        ← Back to List
      </button>

      <h1
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
          marginBottom: "40px",
          color: "#111827",
          textAlign: "center",
        }}
      >
        Vital Records for {patient.patient_name}
      </h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "30px" }}
      >
        {/* Row 1 */}
        <div style={rowStyle}>
          <div style={groupStyle}>
            <label style={labelStyle}>Blood Pressure (mmHg)</label>
            <input
              name="blood_pressure"
              placeholder="e.g. 120/80"
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>
          <div style={groupStyle}>
            <label style={labelStyle}>Temperature (°C)</label>
            <input
              name="temperature"
              type="number"
              step="0.1"
              placeholder="e.g. 36.6"
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>
        </div>

        {/* Row 2 */}
        <div style={rowStyle}>
          <div style={groupStyle}>
            <label style={labelStyle}>Heart Rate (bpm)</label>
            <input
              name="heart_rate"
              type="number"
              placeholder="e.g. 80"
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>
          <div style={groupStyle}>
            <label style={labelStyle}>Height (cm)</label>
            <input
              name="height"
              type="number"
              step="0.1"
              placeholder="e.g. 175"
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Row 3 */}
        <div style={rowStyle}>
          <div style={groupStyle}>
            <label style={labelStyle}>Weight (kg)</label>
            <input
              name="weight"
              type="number"
              step="0.1"
              placeholder="e.g. 70"
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
          <div style={groupStyle}>
            <label style={labelStyle}>SPO2 (%)</label>
            <input
              name="spo2"
              type="number"
              placeholder="e.g. 98"
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "20px",
          }}
        >
          <button
            type="submit"
            style={{
              fontSize: "1.2rem",
              padding: "12px 40px",
              background: "#111827",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Submit Record
          </button>
        </div>
      </form>
    </div>
  );
};

// Styles
const rowStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "40px",
};
const groupStyle = { display: "flex", flexDirection: "column", gap: "8px" };
const labelStyle = { fontWeight: "600", color: "#374151", fontSize: "0.9rem" };
const inputStyle = {
  padding: "12px",
  background: "#F3F4F6",
  border: "1px solid #e5e7eb",
  borderRadius: "6px",
  outline: "none",
  fontSize: "1rem",
};

export default NurseVitals;

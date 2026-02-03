import React, { useState, useEffect } from "react";

const NurseCheckIn = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [recordedVitals, setRecordedVitals] = useState({});

  // MODAL STATE
  const [showModal, setShowModal] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);

  // VITALS FORM STATE
  // Only track the fields that exist in vital_signs table
  const [vitals, setVitals] = useState({
    blood_pressure: "",
    temperature: "",
    heart_rate: "",
    height: "",
    weight: "",
    spo2: "",
  });

  // Fetch vitals for a specific appointment
  const fetchVitalsForAppointment = async (appointmentId) => {
    try {
      const response = await fetch(`http://localhost:5001/vitals?appointment_id=${appointmentId}`);
      if (response.ok) {
        const data = await response.json();
        setRecordedVitals((prev) => ({
          ...prev,
          [appointmentId]: data && data.vital_id ? data : null,
        }));
        return data && data.vital_id ? true : false;
      }
    } catch (err) {
      console.error("Error fetching vitals:", err);
    }
    return false;
  };

  // 1. Fetch Appointments (With Filter to only show Check-in status)
  const fetchAppointments = async () => {
    fetch("http://localhost:5001/appointments")
      .then((res) => res.json())
      .then((data) => {
        const checkined = data.filter(
          (a) =>
            a.status === "Check-in" &&
            a.patient_name !== "Mike Ross" &&
            a.patient_name !== "Michael Brown"
        );
        setAppointments(checkined);
        
        // Fetch vitals for each appointment
        checkined.forEach((appt) => {
          fetchVitalsForAppointment(appt.appointment_id);
        });
        
        setLoading(false);
      })
      .catch((err) => console.error("Error:", err));
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // 2. Open Modal
  const handleRecordClick = async (appt) => {
    setSelectedAppt(appt);
    
    // Try to load existing vitals for this specific appointment
    try {
      const response = await fetch(`http://localhost:5001/vitals?appointment_id=${appt.appointment_id}`);
      if (response.ok) {
        const data = await response.json();
        // Check if data is an object with vital_id (single record) or empty
        if (data && data.vital_id) {
          setVitals({
            blood_pressure: data.blood_pressure || "",
            temperature: data.temperature || "",
            heart_rate: data.heart_rate || "",
            height: data.height || "",
            weight: data.weight || "",
            spo2: data.spo2 || "",
            recorded_at: data.recorded_at || "",
            vital_id: data.vital_id,
          });
        } else {
          setVitals({
            blood_pressure: "",
            temperature: "",
            heart_rate: "",
            height: "",
            weight: "",
            spo2: "",
            recorded_at: "",
          });
        }
      }
    } catch (err) {
      console.error("Error loading vitals:", err);
      setVitals({
        blood_pressure: "",
        temperature: "",
        heart_rate: "",
        height: "",
        weight: "",
        spo2: "",
        recorded_at: "",
      });
    }
    
    setShowModal(true);
  };

  // 3. Handle Input Change
  const handleChange = (e) => {
    // Allow changes always
    setVitals({ ...vitals, [e.target.name]: e.target.value });
  };

  // 4. Submit Vitals
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppt) return;

    try {
      // If vitals already recorded, it's an update
      if (recordedVitals[selectedAppt.appointment_id] && vitals.vital_id) {
        // Update endpoint
        const response = await fetch(`http://localhost:5001/vitals/${vitals.vital_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            blood_pressure: vitals.blood_pressure,
            temperature: vitals.temperature,
            heart_rate: vitals.heart_rate,
            height: vitals.height,
            weight: vitals.weight,
            spo2: vitals.spo2,
            appointment_id: selectedAppt.appointment_id,
          }),
        });

        if (response.ok) {
          alert("✅ Vitals Updated Successfully!");
          setShowModal(false);
          fetchAppointments();
        } else {
          alert("❌ Failed to update vitals.");
        }
      } else {
        // New record
        const response = await fetch("http://localhost:5001/vitals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patient_name: selectedAppt.patient_name,
            appointment_id: selectedAppt.appointment_id,
            blood_pressure: vitals.blood_pressure,
            temperature: vitals.temperature,
            heart_rate: vitals.heart_rate,
            height: vitals.height,
            weight: vitals.weight,
            spo2: vitals.spo2,
          }),
        });

        if (response.ok) {
          alert("✅ Vitals Recorded Successfully!");
          setShowModal(false);
          fetchAppointments(); // Refresh list
        } else {
          const errorData = await response.json();
          alert("❌ Failed to save: " + (errorData.error || "Unknown error"));
        }
      }
    } catch (err) {
      console.error("Error saving:", err);
      alert("Server Error");
    }
  };

  const filteredList = appointments.filter((appt) =>
    appt.patient_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group appointments by date
  const groupedByDate = filteredList.reduce((acc, appt) => {
    const dateKey = appt.appointment_date 
      ? new Date(appt.appointment_date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "No Date";
    
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(appt);
    return acc;
  }, {});

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
              <th style={{ padding: "15px", textAlign: "center" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="4"
                  style={{ padding: "20px", textAlign: "center" }}
                >
                  Loading...
                </td>
              </tr>
            ) : filteredList.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
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
              Object.entries(groupedByDate).map(([dateKey, appts]) => (
                <React.Fragment key={dateKey}>
                  {/* Date Header Row */}
                  <tr style={{ background: "#f3f4f6", borderTop: "2px solid #e5e7eb" }}>
                    <td
                      colSpan="4"
                      style={{
                        padding: "12px 15px",
                        fontWeight: "700",
                        color: "#374151",
                        fontSize: "0.95rem",
                      }}
                    >
                      📅 {dateKey}
                    </td>
                  </tr>
                  {/* Appointment Rows for this date */}
                  {appts.map((appt) => (
                    <tr key={appt.appointment_id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "15px", fontWeight: "600" }}>
                        {appt.patient_name}
                      </td>
                      <td style={{ padding: "15px", color: "#64748b" }}>
                        {appt.doctor_name}
                      </td>
                      <td style={{ padding: "15px", color: "#64748b" }}>
                        {appt.reason}
                      </td>

                      <td style={{ padding: "15px", textAlign: "center" }}>
                        <button
                          onClick={() => handleRecordClick(appt)}
                          style={{
                            background: recordedVitals[appt.appointment_id] ? "#10b981" : "white",
                            color: recordedVitals[appt.appointment_id] ? "white" : "#334155",
                            border: `1px solid ${recordedVitals[appt.appointment_id] ? "#10b981" : "#334155"}`,
                            borderRadius: "20px",
                            padding: "6px 20px",
                            cursor: "pointer",
                            fontWeight: "bold",
                          }}
                        >
                          {recordedVitals[appt.appointment_id] ? "Edit" : "Record"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
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

            {recordedVitals[selectedAppt.patient_name] && (
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #86efac",
                  borderRadius: "8px",
                  padding: "15px",
                  marginBottom: "20px",
                }}
              >
                <p style={{ margin: "0 0 10px 0", color: "#059669", fontWeight: "bold" }}>
                  ✓ Recorded at: {vitals.recorded_at}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.9rem", color: "#374151" }}>
                  <div><strong>BP:</strong> {vitals.blood_pressure}</div>
                  <div><strong>Temp:</strong> {vitals.temperature}°C</div>
                  <div><strong>HR:</strong> {vitals.heart_rate} bpm</div>
                  <div><strong>SPO2:</strong> {vitals.spo2}%</div>
                  <div><strong>Height:</strong> {vitals.height} cm</div>
                  <div><strong>Weight:</strong> {vitals.weight} kg</div>
                </div>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <div style={rowStyle}>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Blood Pressure (mmHg)</label>
                  <input
                    name="blood_pressure"
                    value={vitals.blood_pressure}
                    onChange={handleChange}
                    placeholder="e.g. 120/80"
                    style={inputStyle}
                    required
                  />
                </div>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Temperature (°C)</label>
                  <input
                    name="temperature"
                    type="number"
                    step="0.1"
                    value={vitals.temperature}
                    onChange={handleChange}
                    placeholder="e.g. 36.6"
                    style={inputStyle}
                    required
                  />
                </div>
              </div>
              <div style={rowStyle}>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Heart Rate (bpm)</label>
                  <input
                    name="heart_rate"
                    type="number"
                    value={vitals.heart_rate}
                    onChange={handleChange}
                    placeholder="e.g. 80"
                    style={inputStyle}
                    required
                  />
                </div>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Height (cm)</label>
                  <input
                    name="height"
                    type="number"
                    step="0.1"
                    value={vitals.height}
                    onChange={handleChange}
                    placeholder="e.g. 175"
                    style={inputStyle}
                  />
                </div>
              </div>
              <div style={rowStyle}>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Weight (kg)</label>
                  <input
                    name="weight"
                    type="number"
                    step="0.1"
                    value={vitals.weight}
                    onChange={handleChange}
                    placeholder="e.g. 70"
                    style={inputStyle}
                  />
                </div>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>SPO2 (%)</label>
                  <input
                    name="spo2"
                    type="number"
                    value={vitals.spo2}
                    onChange={handleChange}
                    placeholder="e.g. 98"
                    style={inputStyle}
                  />
                </div>
              </div>

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
                    opacity: 1,
                  }}
                >
                  {recordedVitals[selectedAppt.patient_name] ? "Update" : "Submit"}
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

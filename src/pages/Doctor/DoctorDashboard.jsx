import React, { useState, useEffect } from "react";

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctorName, setDoctorName] = useState("Doctor");
  const [status, setStatus] = useState("Available");

  // MODAL STATE
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [vitals, setVitals] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // 1. ROBUST USER FETCHING
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    const savedName = localStorage.getItem("userFullName");

    // Determine the actual name to use
    const activeName = user?.full_name || savedName || "Doctor";
    setDoctorName(activeName);

    // Fetch Data using the correct name
    if (activeName !== "Doctor") {
      fetchStatus(activeName);
      fetchAppointments(activeName);
    }
  }, []);

  // --- FETCH DATA FUNCTIONS ---
  const fetchStatus = (name) => {
    fetch(`http://localhost:5001/doctor/status?full_name=${name}`)
      .then((res) => res.json())
      .then((data) => setStatus(data.status || "Available"))
      .catch((err) => console.error("Error fetching status:", err));
  };

  const fetchAppointments = (name) => {
    fetch(`http://localhost:5001/appointments?doctor_name=${name}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAppointments(data);
        } else {
          setAppointments([]);
        }
      })
      .catch((err) => console.error("Error fetching appointments:", err));
  };

  // --- HANDLE PATIENT CLICK ---
  const handlePatientClick = async (appointment) => {
    setSelectedPatient(appointment);
    setVitals(null);
    setShowModal(true);

    try {
      const res = await fetch(
        `http://localhost:5001/vitals/appointment/${appointment.appointment_id}`
      );
      if (res.ok) {
        const data = await res.json();
        console.log(`Fetched vitals for appointment ${appointment.appointment_id}:`, data); // DEBUG
        setVitals(data);
      } else {
        console.log(`No vitals found for appointment ${appointment.appointment_id}`); // DEBUG
        setVitals(null);
      }
    } catch (err) {
      console.error("Error fetching vitals:", err);
      setVitals(null);
    }
  };

  // --- CHANGE STATUS ---
  const handleStatusChange = async (newStatus) => {
    setStatus(newStatus);
    const user = JSON.parse(localStorage.getItem("user"));
    const nameToUpdate =
      user?.full_name || localStorage.getItem("userFullName");

    if (nameToUpdate) {
      await fetch("http://localhost:5001/doctor/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: nameToUpdate, status: newStatus }),
      });
    }
  };

  return (
    <div
      style={{
        padding: "30px",
        fontFamily: "Inter, sans-serif",
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.8rem",
              fontWeight: "bold",
              color: "#111827",
              margin: 0,
            }}
          >
            Doctor Dashboard
          </h1>
          <p style={{ color: "#6b7280", margin: "5px 0 0" }}>
            Welcome, {doctorName}.
          </p>
        </div>
      </div>

      <h2
        style={{
          fontSize: "1.6rem",
          fontWeight: "bold",
          marginBottom: "24px",
          color: "#1e293b",
        }}
      >
        Upcoming Appointments
      </h2>

      {/* APPOINTMENT TABLE */}
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
            <tr style={{ backgroundColor: "#e5e5e5", textAlign: "left" }}>
              <th style={thStyle}>Patient</th>
              <th style={thStyle}>Time</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Reason</th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  style={{
                    padding: "30px",
                    textAlign: "center",
                    color: "#6b7280",
                  }}
                >
                  No appointments found.
                </td>
              </tr>
            ) : (
              appointments.map((appt) => (
                <tr key={appt.appointment_id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={tdStyle}>
                    <span
                      onClick={() => handlePatientClick(appt)}
                      style={{
                        fontWeight: "600",
                        color: "#2563eb",
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      {appt.patient_name}
                    </span>
                  </td>
                  <td
                    style={{ ...tdStyle, color: "#2563eb", fontWeight: "bold" }}
                  >
                    {appt.appointment_time}
                  </td>
                  <td style={tdStyle}>{appt.appointment_date.split("T")[0]}</td>
                  <td style={tdStyle}>{appt.reason}</td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        backgroundColor:
                          appt.status === "Checked In" ? "#dcfce7" : "#f3f4f6",
                        color:
                          appt.status === "Checked In" ? "#166534" : "#374151",
                        padding: "4px 12px",
                        borderRadius: "12px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                      }}
                    >
                      {appt.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- VITALS MODAL (NO DIAGNOSIS/PRESCRIPTION) --- */}
      {showModal && selectedPatient && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "16px",
              width: "500px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "1.5rem", color: "#1e293b" }}>
                Patient Vitals
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                }}
              >
                &times;
              </button>
            </div>

            <p style={{ marginBottom: "20px", color: "#64748b" }}>
              Viewing details for:{" "}
              <strong style={{ color: "#0f172a" }}>
                {selectedPatient.patient_name}
              </strong>
            </p>

            <div
              style={{
                backgroundColor: "#f8fafc",
                padding: "20px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                  fontSize: "1.1rem",
                  color: "#334151",
                  marginBottom: "15px",
                }}
              >
                🩺 Vital Signs
              </h3>
              {vitals ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "15px",
                  }}
                >
                  <div>
                    <strong>Height:</strong> {vitals.height} cm
                  </div>
                  <div>
                    <strong>Weight:</strong> {vitals.weight} kg
                  </div>
                  <div>
                    <strong>BP:</strong> {vitals.blood_pressure}
                  </div>
                  <div>
                    <strong>Heart Rate:</strong> {vitals.heart_rate} bpm
                  </div>
                  <div>
                    <strong>Temp:</strong> {vitals.temperature} °C
                  </div>
                  <div>
                    <strong>SPO2:</strong> {vitals.spo2} %
                  </div>
                  <div>
                    <strong>Time:</strong> {vitals.recorded_at}
                  </div>
                </div>
              ) : (
                <p style={{ color: "#ef4444", fontStyle: "italic", margin: 0 }}>
                  No vitals recorded by nurse yet.
                </p>
              )}
            </div>

            <div
              style={{
                marginTop: "25px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#e2e8f0",
                  color: "#334151",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles
const thStyle = {
  padding: "16px",
  fontSize: "0.9rem",
  fontWeight: "600",
  color: "#374151",
};
const tdStyle = { padding: "16px", fontSize: "0.95rem", color: "#4b5563" };

export default DoctorDashboard;

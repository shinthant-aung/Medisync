import React, { useState, useEffect } from "react";

const NursePatient = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingPatientId, setViewingPatientId] = useState(null);
  const [patientHistory, setPatientHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  // 1. Fetch Patients
  useEffect(() => {
    fetch("http://localhost:5001/patients")
      .then((res) => res.json())
      .then((data) => setPatients(data))
      .catch((err) => console.error("Error fetching patients:", err));
  }, []);

  const handleViewHistory = async (patient) => {
    setViewingPatientId(patient.patient_id);
    setHistoryLoading(true);
    try {
      // Fetch complete patient data
      const patientRes = await fetch(
        `http://localhost:5001/patients/${patient.patient_id}`
      );
      const completePatient = patientRes.ok ? await patientRes.json() : patient;

      const appointmentsRes = await fetch(
        `http://localhost:5001/patients/${patient.patient_id}/appointments`
      );
      const appointments = appointmentsRes.ok ? await appointmentsRes.json() : [];

      const recordsRes = await fetch(
        `http://localhost:5001/patients/${patient.patient_id}/medical-records`
      );
      const records = recordsRes.ok ? await recordsRes.json() : [];

      setPatientHistory({
        ...completePatient,
        appointments: appointments.sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date)),
        diagnoses: records.diagnoses || [],
        prescriptions: records.prescriptions || [],
      });
      setHistoryLoading(false);
    } catch (err) {
      console.error("Error fetching patient history:", err);
      setHistoryLoading(false);
    }
  };

  const handleCloseHistory = () => {
    setViewingPatientId(null);
    setPatientHistory(null);
  };

  // 2. Filter Patients
  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
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
          Patient List
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
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Gender</th>
              <th style={thStyle}>Phone</th>
              <th style={thStyle}>Date of Birth</th>
              <th style={thStyle}>Allergies</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "#64748b",
                  }}
                >
                  No patients found.
                </td>
              </tr>
            ) : (
              filteredPatients.map((patient) => (
                <tr key={patient.patient_id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "15px", fontWeight: "600" }}>
                    <span
                      onClick={() => handleViewHistory(patient)}
                      style={{
                        color: "#0284c7",
                        cursor: "pointer",
                        textDecoration: "underline",
                        fontWeight: "600",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) => (e.target.style.color = "#0369a1")}
                      onMouseLeave={(e) => (e.target.style.color = "#0284c7")}
                    >
                      {patient.name}
                    </span>
                  </td>
                  <td style={{ padding: "15px", color: "#64748b" }}>
                    {patient.gender || "-"}
                  </td>
                  <td style={{ padding: "15px", color: "#64748b" }}>
                    {patient.phone || "-"}
                  </td>
                  <td style={{ padding: "15px", color: "#64748b" }}>
                    {patient.date_of_birth
                      ? patient.date_of_birth.split("T")[0]
                      : "-"}
                  </td>
                  <td style={{ padding: "15px", color: "#64748b" }}>
                    {patient.allergy && patient.allergy !== "" ? (
                      <span style={{ color: "#ef4444", fontWeight: "500" }}>
                        {patient.allergy}
                      </span>
                    ) : (
                      <span style={{ color: "#9ca3af" }}>None</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Patient History Modal */}
      {viewingPatientId && patientHistory && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={handleCloseHistory}
        >
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "30px",
              maxWidth: "900px",
              width: "90%",
              maxHeight: "85vh",
              overflowY: "auto",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ margin: 0, color: "#1e293b" }}>Medical History - {patientHistory.name}</h2>
              <button
                onClick={handleCloseHistory}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                ×
              </button>
            </div>

            {/* Patient Info */}
            <div style={{ background: "#f1f5f9", padding: "16px", borderRadius: "8px", marginBottom: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "16px", fontSize: "14px" }}>
                <div>
                  <p style={{ margin: "0 0 4px 0", fontWeight: "600", color: "#475569" }}>Date of Birth</p>
                  <p style={{ margin: 0, color: "#1e293b" }}>
                    {patientHistory.date_of_birth
                      ? new Date(patientHistory.date_of_birth).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "-"}
                  </p>
                </div>
                <div>
                  <p style={{ margin: "0 0 4px 0", fontWeight: "600", color: "#475569" }}>Gender</p>
                  <p style={{ margin: 0, color: "#1e293b" }}>{patientHistory.gender || "-"}</p>
                </div>
                <div>
                  <p style={{ margin: "0 0 4px 0", fontWeight: "600", color: "#475569" }}>Phone</p>
                  <p style={{ margin: 0, color: "#1e293b" }}>{patientHistory.phone || "-"}</p>
                </div>
                <div>
                  <p style={{ margin: "0 0 4px 0", fontWeight: "600", color: "#ef4444" }}>Allergies</p>
                  <p style={{ margin: 0, color: "#1e293b" }}>{patientHistory.allergy || "-"}</p>
                </div>
              </div>
            </div>

            {/* Appointments */}
            {patientHistory.appointments && patientHistory.appointments.length > 0 && (
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ margin: "0 0 16px 0", color: "#1e293b", fontSize: "16px" }}>Appointments</h3>
                {patientHistory.appointments.map((apt) => (
                  <div
                    key={apt.appointment_id}
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      padding: "12px",
                      marginBottom: "12px",
                      fontSize: "14px",
                    }}
                  >
                    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "16px", alignItems: "start" }}>
                      <div style={{ color: "#0284c7", fontWeight: "600" }}>
                        {apt.appointment_date
                          ? new Date(apt.appointment_date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }) +
                            " " +
                            (apt.appointment_time ||
                              new Date(apt.appointment_date).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              }))
                          : "-"}
                      </div>
                      <div>
                        <p style={{ margin: "0 0 4px 0", color: "#1e293b", fontWeight: "500" }}>
                          {apt.doctor_name}
                        </p>
                        <p style={{ margin: "0 0 4px 0", color: "#64748b", fontSize: "13px" }}>
                          Reason: {apt.reason || "-"}
                        </p>
                      </div>
                      <div>
                        <span
                          style={{
                            backgroundColor:
                              apt.status === "completed"
                                ? "#dcfce7"
                                : apt.status === "Check-in"
                                ? "#fee2e2"
                                : "#dbeafe",
                            color:
                              apt.status === "completed"
                                ? "#166534"
                                : apt.status === "Check-in"
                                ? "#991b1b"
                                : "#0c4a6e",
                            padding: "4px 12px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          {apt.status || "pending"}
                        </span>
                      </div>
                    </div>

                    {/* Diagnoses for this appointment */}
                    <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #e2e8f0" }}>
                      <p style={{ margin: "0 0 8px 0", color: "#1e293b", fontWeight: "600", fontSize: "13px" }}>Diagnoses</p>
                      {patientHistory.diagnoses && patientHistory.diagnoses.length > 0 ? (
                        patientHistory.diagnoses.filter((diag) => diag.appointment_id === apt.appointment_id).length > 0 ? (
                          <div>
                            {patientHistory.diagnoses
                              .filter((diag) => diag.appointment_id === apt.appointment_id)
                              .map((diag, didx) => (
                                <div
                                  key={didx}
                                  style={{
                                    background: "#fef3c7",
                                    border: "1px solid #fde68a",
                                    borderRadius: "6px",
                                    padding: "8px",
                                    marginBottom: "8px",
                                    fontSize: "13px",
                                  }}
                                >
                                  <p style={{ margin: "0 0 4px 0", color: "#92400e", fontWeight: "600" }}>
                                    {diag.disease_name}
                                  </p>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p style={{ margin: 0, color: "#94a3b8", fontSize: "12px", fontStyle: "italic" }}>
                            No diagnosis yet
                          </p>
                        )
                      ) : (
                        <p style={{ margin: 0, color: "#94a3b8", fontSize: "12px", fontStyle: "italic" }}>
                          No diagnosis yet
                        </p>
                      )}
                    </div>

                    {/* Prescriptions for this appointment */}
                    <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #e2e8f0" }}>
                      <p style={{ margin: "0 0 8px 0", color: "#1e293b", fontWeight: "600", fontSize: "13px" }}>Prescriptions</p>
                      {patientHistory.prescriptions && patientHistory.prescriptions.length > 0 ? (
                        patientHistory.prescriptions.filter(
                          (presc) =>
                            presc.appointment_id === apt.appointment_id ||
                            presc.appointment_id_from_appt === apt.appointment_id
                        ).length > 0 ? (
                          <div>
                            {patientHistory.prescriptions
                              .filter(
                                (presc) =>
                                  presc.appointment_id === apt.appointment_id ||
                                  presc.appointment_id_from_appt === apt.appointment_id
                              )
                              .map((presc, pidx) => (
                                <div
                                  key={pidx}
                                  style={{
                                    background: "#f0fdf4",
                                    border: "1px solid #dcfce7",
                                    borderRadius: "6px",
                                    padding: "8px",
                                    marginBottom: "8px",
                                    fontSize: "13px",
                                  }}
                                >
                                  <p style={{ margin: "0 0 4px 0", color: "#15803d", fontWeight: "600" }}>
                                    {presc.medicine_name}
                                  </p>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p style={{ margin: 0, color: "#94a3b8", fontSize: "12px", fontStyle: "italic" }}>
                            No prescription yet
                          </p>
                        )
                      ) : (
                        <p style={{ margin: 0, color: "#94a3b8", fontSize: "12px", fontStyle: "italic" }}>
                          No prescription yet
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {(!patientHistory.appointments || patientHistory.appointments.length === 0) && (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8" }}>
                  <p>No medical history records found</p>
                </div>
              )}
          </div>
        </div>
      )}
    </>
  );
};

// --- STYLES ---
const thStyle = {
  padding: "15px",
};

const tdStyle = {
  padding: "15px",
};

export default NursePatient;

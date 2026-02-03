import React, { useState, useEffect } from "react";

const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [patientDetails, setPatientDetails] = useState({}); // Store prescription/diagnosis for each patient
  const [appointmentDates, setAppointmentDates] = useState({}); // Store appointment dates

  // MODAL STATE
  const [activeModal, setActiveModal] = useState(null); // 'prescription' or 'diagnosis'
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [inputText, setInputText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevent double submission
  const [editingId, setEditingId] = useState(null); // Track which prescription/diagnosis is being edited

  // HISTORY MODAL STATE
  const [viewingPatientId, setViewingPatientId] = useState(null);
  const [patientHistory, setPatientHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchPatientDetails = async (appointment) => {
    try {
      const url = `http://localhost:5001/appointment/${appointment.appointment_id}/prescription-diagnosis`;
      console.log("Fetching details for appointment:", appointment.appointment_id, "URL:", url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log("Fetched details:", data);
      
      setPatientDetails((prev) => ({
        ...prev,
        [appointment.appointment_id]: data,
      }));
    } catch (err) {
      console.error("Error fetching patient details:", err);
    }
  };

  const fetchPatients = () => {
    setLoading(true);
    
    // Get doctor name from localStorage
    const savedName = localStorage.getItem("userFullName");
    
    console.log("Doctor name:", savedName);
    
    if (!savedName) {
      console.log("No doctor name found");
      setPatients([]);
      setLoading(false);
      return;
    }
    
    // Use same endpoint as DoctorDashboard - filter by doctor_name
    fetch(`http://localhost:5001/appointments?doctor_name=${savedName}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Appointments data:", data);
        
        if (Array.isArray(data) && data.length > 0) {
          // Fetch prescription/diagnosis for each appointment
          data.forEach((appointment) => {
            fetchPatientDetails(appointment);
          });
          setPatients(data);
        } else {
          setPatients([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching appointments:", err);
        setPatients([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // SUBMIT HANDLER (Add or Edit)
  const handleSubmit = async () => {
    if (!inputText.trim()) return alert("Field cannot be empty.");
    if (isSubmitting) return; // Prevent double submission

    setIsSubmitting(true); // Set flag to prevent further submissions

    // Get doctor_id from localStorage
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    const doctor_id = user?.id;

    // Determine if editing or adding
    const isEditing = !!editingId;

    // Determine URL and method based on modal type and if editing
    let url, method;
    if (isEditing) {
      // Use PUT endpoint for editing
      url =
        activeModal === "prescription"
          ? `http://localhost:5001/doctor/prescription/${editingId}`
          : `http://localhost:5001/doctor/diagnosis/${editingId}`;
      method = "PUT";
    } else {
      // Use POST endpoint for adding
      url =
        activeModal === "prescription"
          ? "http://localhost:5001/doctor/prescription"
          : "http://localhost:5001/doctor/diagnosis";
      method = "POST";
    }

    // Determine Body key ('prescription' or 'diagnosis')
    const bodyData = isEditing 
      ? { [activeModal]: inputText }
      : { 
          patient_name: selectedPatient.patient_name,
          doctor_id: doctor_id,
          appointment_id: selectedPatient.appointment_id,
          [activeModal]: inputText
        };

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      if (response.ok) {
        alert(
          `✅ ${
            activeModal === "prescription" ? "Prescription" : "Diagnosis"
          } ${editingId ? "updated" : "added"}!`
        );
        setActiveModal(null);
        setInputText(""); // Clear input
        setEditingId(null);
        fetchPatients();
      } else {
        alert("❌ Failed to save.");
      }
    } catch (err) {
      console.error(err);
      alert("Server Error");
    } finally {
      setIsSubmitting(false); // Re-enable submission
    }
  };

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

  // Filter Logic (Safe Check) - use patient_name from appointments data
  const filteredPatients = Array.isArray(patients)
    ? patients.filter(
        (p) =>
          p.patient_name &&
          p.patient_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

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
              <th
                style={{
                  padding: "15px",
                  fontWeight: "600",
                  color: "#333",
                }}
              >
                Name
              </th>
              <th
                style={{
                  padding: "15px",
                  fontWeight: "600",
                  color: "#333",
                }}
              >
                Appointment Date
              </th>
              <th
                style={{
                  padding: "15px",
                  fontWeight: "600",
                  color: "#333",
                }}
              >
                Prescription
              </th>
              <th
                style={{
                  padding: "15px",
                  fontWeight: "600",
                  color: "#333",
                }}
              >
                Diagnosis
              </th>
              <th
                style={{
                  padding: "15px",
                  fontWeight: "600",
                  color: "#333",
                }}
              >
                Allergies
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="6"
                  style={{ textAlign: "center", padding: "20px", color: "#64748b" }}
                >
                  Loading...
                </td>
              </tr>
            ) : filteredPatients.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  style={{ textAlign: "center", padding: "20px", color: "#64748b" }}
                >
                  No patients found.
                </td>
              </tr>
            ) : (
              filteredPatients.map((patient) => (
                <tr
                  key={patient.appointment_id}
                  style={{ borderBottom: "1px solid #f1f5f9" }}
                >
                  <td
                    style={{
                      padding: "15px",
                      fontWeight: "600",
                      color: "#111827",
                    }}
                  >
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
                      {patient.patient_name}
                    </span>
                  </td>

                  {/* APPOINTMENT DATE */}
                  <td style={{ padding: "15px", color: "#64748b" }}>
                    {patient.appointment_date
                      ? new Date(patient.appointment_date).toLocaleDateString()
                      : "—"}
                  </td>

                  {/* PRESCRIPTION */}
                  <td style={{ padding: "15px" }}>
                    {patientDetails[patient.appointment_id]?.prescription ? (
                      <span
                        onClick={() => {
                          setSelectedPatient(patient);
                          setActiveModal("prescription");
                          setInputText(
                            patientDetails[patient.appointment_id].prescription.treatment
                          );
                          setEditingId(
                            patientDetails[patient.appointment_id].prescription.prescription_id
                          );
                        }}
                        style={{
                          color: "#4b5563",
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                      >
                        {patientDetails[patient.appointment_id].prescription.treatment}
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedPatient(patient);
                          setActiveModal("prescription");
                          setInputText("");
                          setEditingId(null);
                        }}
                        style={addBtnStyle}
                      >
                        + Add Prescription
                      </button>
                    )}
                  </td>

                  {/* DIAGNOSIS */}
                  <td style={{ padding: "15px" }}>
                    {patientDetails[patient.appointment_id]?.diagnosis ? (
                      <span
                        onClick={() => {
                          setSelectedPatient(patient);
                          setActiveModal("diagnosis");
                          setInputText(patientDetails[patient.appointment_id].diagnosis.diagnosis);
                          setEditingId(patientDetails[patient.appointment_id].diagnosis.record_id);
                        }}
                        style={{
                          color: "#059669",
                          fontWeight: "500",
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                      >
                        {patientDetails[patient.appointment_id].diagnosis.diagnosis}
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedPatient(patient);
                          setActiveModal("diagnosis");
                          setInputText("");
                          setEditingId(null);
                        }}
                        style={addBtnStyle}
                      >
                        + Add Diagnosis
                      </button>
                    )}
                  </td>

                  <td
                    style={{
                      padding: "15px",
                      color: patient.allergy ? "#dc2626" : "#6b7280",
                    }}
                  >
                    {patient.allergy || "None"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- SHARED MODAL --- */}
      {activeModal && selectedPatient && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "8px",
              width: "500px",
            }}
          >
            <h3 style={{ marginBottom: "15px" }}>
              {editingId ? "Edit" : "Add"}{" "}
              {activeModal === "prescription" ? "Prescription" : "Diagnosis"}{" "}
              for{" "}
              <span style={{ color: "#2563eb" }}>
                {selectedPatient.name}
              </span>
            </h3>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Enter ${activeModal} details...`}
              style={{
                width: "100%",
                height: "100px",
                padding: "10px",
                marginBottom: "20px",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "10px",
              }}
            >
              <button
                onClick={async () => {
                  if (editingId && window.confirm(`Delete this ${activeModal}?`)) {
                    try {
                      const endpoint = activeModal === "prescription" ? "prescription" : "diagnosis";
                      await fetch(`http://localhost:5001/doctor/${endpoint}/${editingId}`, {
                        method: "DELETE",
                      });
                      alert(`✅ ${activeModal.charAt(0).toUpperCase() + activeModal.slice(1)} deleted!`);
                      setActiveModal(null);
                      fetchPatients();
                    } catch (err) {
                      console.error("Delete error:", err);
                      alert("❌ Failed to delete");
                    }
                  }
                }}
                disabled={!editingId}
                style={{
                  padding: "8px 16px",
                  background: editingId ? "#ef4444" : "#d1d5db",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: editingId ? "pointer" : "not-allowed",
                  opacity: editingId ? 1 : 0.6,
                }}
              >
                Delete
              </button>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => setActiveModal(null)}
                  style={{
                    padding: "8px 16px",
                    border: "1px solid #cbd5e1",
                    background: "white",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  style={{
                    padding: "8px 16px",
                    background: isSubmitting ? "#cbd5e1" : "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    opacity: isSubmitting ? 0.6 : 1,
                  }}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
              <h2 style={{ margin: 0, color: "#1e293b" }}>Medical History - {patientHistory.patient_name}</h2>
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

const addBtnStyle = {
  background: "#eff6ff",
  color: "#2563eb",
  border: "1px solid #bfdbfe",
  padding: "6px 12px",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "0.85rem",
};

export default DoctorPatients;

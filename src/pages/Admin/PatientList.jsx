// src/pages/Admin/PatientList.jsx
import React, { useState, useEffect } from "react";

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [viewingPatientId, setViewingPatientId] = useState(null);
  const [patientHistory, setPatientHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    date_of_birth: "",
    phone: "",
    address: "",
    allergy: "",
  });

  const fetchPatients = () => {
    setLoading(true);
    fetch("http://localhost:5001/patients")
      .then((res) => res.json())
      .then((data) => {
        setPatients(data);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this patient? This cannot be undone."
      )
    ) {
      try {
        const response = await fetch(`http://localhost:5001/patients/${id}`, {
          method: "DELETE",
        });

        console.log("Delete response status:", response.status);
        console.log("Delete response ok:", response.ok);

        if (response.ok) {
          const data = await response.json();
          console.log("Delete success:", data);
          fetchPatients();
        } else {
          const text = await response.text();
          console.log("Delete error text:", text);
          try {
            const errorData = JSON.parse(text);
            alert(errorData.error || "Failed to delete patient.");
          } catch {
            alert("Failed to delete patient. Server response: " + text);
          }
        }
      } catch (err) {
        console.error("Error deleting:", err);
        alert("Server error while deleting: " + err.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editingId
        ? `http://localhost:5001/patients/${editingId}`
        : "http://localhost:5001/patients";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({
          name: "",
          gender: "",
          date_of_birth: "",
          phone: "",
          address: "",
          allergy: "",
        });
        setEditingId(null);
        setSuccessMessage(editingId ? "Patient updated successfully!" : "Patient added successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
        setShowModal(false);
        fetchPatients();
      } else {
        alert(editingId ? "Failed to update patient" : "Failed to add patient");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditClick = (patient) => {
    setEditingId(patient.patient_id);
    setFormData({
      name: patient.name,
      gender: patient.gender || "",
      date_of_birth: patient.date_of_birth ? patient.date_of_birth.split("T")[0] : "",
      phone: patient.phone || "",
      address: patient.address || "",
      allergy: patient.allergy || "",
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      name: "",
      gender: "",
      date_of_birth: "",
      phone: "",
      address: "",
      allergy: "",
    });
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

      // Fetch appointments
      const appointmentsRes = await fetch(
        `http://localhost:5001/patients/${patient.patient_id}/appointments`
      );
      const appointments = appointmentsRes.ok ? await appointmentsRes.json() : [];

      // Fetch vital signs
      const vitalsRes = await fetch(
        `http://localhost:5001/patients/${patient.patient_id}/vitals`
      );
      const vitals = vitalsRes.ok ? await vitalsRes.json() : [];

      // Fetch medical records (diagnoses and prescriptions)
      const recordsRes = await fetch(
        `http://localhost:5001/patients/${patient.patient_id}/medical-records`
      );
      const records = recordsRes.ok ? await recordsRes.json() : [];

      setPatientHistory({
        ...completePatient,
        appointments: appointments.sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date)),
        vitals: vitals.sort((a, b) => new Date(b.recorded_date) - new Date(a.recorded_date)),
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

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.phone && patient.phone.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "20px" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#1e293b", margin: 0 }}>
            Patient List
          </h1>
          <button
            onClick={() => setShowModal(true)}
            style={{
              background: "#0284c7",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#0369a1")}
            onMouseLeave={(e) => (e.target.style.background = "#0284c7")}
          >
            <span>+</span> Add Patient
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div
            style={{
              background: "#ecfdf5",
              border: "1px solid #86efac",
              color: "#166534",
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span>✓</span>
            {successMessage}
          </div>
        )}

        {/* Search Bar */}
        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="🔍 Search by name or phone..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "100%", maxWidth: "400px" }}
          />
        </div>

        {/* Patients Table */}
        <div
          style={{
            background: "white",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            overflow: "hidden",
          }}
        >
          {filteredPatients.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center" }}>
              <p style={{ color: "#94a3b8", fontSize: "15px" }}>
                {searchTerm ? "No patients found" : "No patients registered yet"}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "14px",
                }}
              >
                <thead>
                  <tr style={{ background: "#f1f5f9", borderBottom: "1px solid #e2e8f0" }}>
                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", color: "#475569" }}>
                      Name
                    </th>
                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", color: "#475569" }}>
                      Gender
                    </th>
                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", color: "#475569" }}>
                      Phone
                    </th>
                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", color: "#475569" }}>
                      Date of Birth
                    </th>
                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", color: "#475569" }}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient, idx) => (
                    <tr
                      key={patient.patient_id}
                      style={{
                        borderBottom: "1px solid #e2e8f0",
                        background: idx % 2 === 0 ? "#ffffff" : "#f8fafc",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = idx % 2 === 0 ? "#ffffff" : "#f8fafc")
                      }
                    >
                      <td style={{ padding: "16px", color: "#1e293b", fontWeight: "500" }}>
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
                      <td style={{ padding: "16px", color: "#64748b" }}>
                        {patient.gender || "-"}
                      </td>
                      <td style={{ padding: "16px", color: "#64748b" }}>
                        {patient.phone || "-"}
                      </td>
                      <td style={{ padding: "16px", color: "#64748b" }}>
                        {patient.date_of_birth
                          ? new Date(patient.date_of_birth).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "-"}
                      </td>
                      <td style={{ padding: "16px" }}>
                        <button
                          onClick={() => handleEditClick(patient)}
                          style={{
                            backgroundColor: "#dbeafe",
                            color: "#1e40af",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "0.85rem",
                            fontWeight: "600",
                            transition: "background 0.2s",
                            marginRight: "8px",
                          }}
                          onMouseEnter={(e) => (e.target.style.backgroundColor = "#bfdbfe")}
                          onMouseLeave={(e) => (e.target.style.backgroundColor = "#dbeafe")}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(patient.patient_id)}
                          style={{
                            backgroundColor: "#fee2e2",
                            color: "#991b1b",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "0.85rem",
                            fontWeight: "600",
                            transition: "background 0.2s",
                          }}
                          onMouseEnter={(e) => (e.target.style.backgroundColor = "#fecaca")}
                          onMouseLeave={(e) => (e.target.style.backgroundColor = "#fee2e2")}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Overlay */}
      {showModal && (
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
          onClick={() => handleCloseModal()}
        >
          {/* Modal Card */}
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "32px",
              maxWidth: "500px",
              width: "90%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 25px rgba(0, 0, 0, 0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#1e293b", margin: 0 }}>
                {editingId ? "Edit Patient" : "Add Patient"}
              </h2>
              <button
                onClick={() => handleCloseModal()}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#94a3b8",
                }}
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "18px" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "600",
                    color: "#334155",
                    fontSize: "13px",
                  }}
                >
                  Full Name <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "600",
                    color: "#334155",
                    fontSize: "13px",
                  }}
                >
                  Gender <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    background: "white",
                    cursor: "pointer",
                  }}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: "600",
                      color: "#334155",
                      fontSize: "13px",
                    }}
                  >
                    Date of Birth <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "14px",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: "600",
                      color: "#334155",
                      fontSize: "13px",
                    }}
                  >
                    Phone <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "14px",
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "600",
                    color: "#334155",
                    fontSize: "13px",
                  }}
                >
                  Address <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "600",
                    color: "#334155",
                    fontSize: "13px",
                  }}
                >
                  Allergies
                </label>
                <input
                  type="text"
                  name="allergy"
                  value={formData.allergy}
                  onChange={handleChange}
                  placeholder="e.g Penicillin, Peanuts"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                  }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "24px" }}>
                <button
                  type="button"
                  onClick={() => handleCloseModal()}
                  style={{
                    padding: "10px 16px",
                    background: "#f1f5f9",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor: "pointer",
                    color: "#334155",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => (e.target.style.background = "#e2e8f0")}
                  onMouseLeave={(e) => (e.target.style.background = "#f1f5f9")}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: "10px 16px",
                    background: isSubmitting ? "#94a3b8" : "#16a34a",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    !isSubmitting && (e.target.style.background = "#15803d")
                  }
                  onMouseLeave={(e) =>
                    !isSubmitting && (e.target.style.background = "#16a34a")
                  }
                >
                  {isSubmitting ? "Saving..." : editingId ? "Update Patient" : "Save Patient"}
                </button>
              </div>
            </form>
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
                                : apt.status === "upcoming"
                                ? "#dbeafe"
                                : "#fee2e2",
                            color:
                              apt.status === "completed"
                                ? "#166534"
                                : apt.status === "upcoming"
                                ? "#0c4a6e"
                                : "#991b1b",
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
    </div>
  );
};

export default PatientList;

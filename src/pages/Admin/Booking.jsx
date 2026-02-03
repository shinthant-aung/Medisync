import React, { useState, useEffect } from "react";

const Booking = () => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    patient_name: "",
    doctor_name: "",
    appointment_date: "",
    appointment_time: "",
    reason: "",
  });

  useEffect(() => {
    fetch("http://localhost:5001/patients")
      .then((res) => res.json())
      .then((data) => setPatients(data))
      .catch((err) => console.error("Error loading patients", err));

    fetch("http://localhost:5001/doctors")
      .then((res) => res.json())
      .then((data) => setDoctors(data))
      .catch((err) => console.error("Error loading doctors", err));

    fetchAppointments();
  }, []);

  const fetchAppointments = () => {
    fetch("http://localhost:5001/appointments")
      .then((res) => res.json())
      .then((data) => setAppointments(data))
      .catch((err) => console.error("Error loading appointments", err));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient_name || !formData.doctor_name) {
      alert("Please select both a patient and a doctor.");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingId
        ? `http://localhost:5001/appointments/${editingId}`
        : "http://localhost:5001/appointments";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({
          patient_name: "",
          doctor_name: "",
          appointment_date: "",
          appointment_time: "",
          reason: "",
        });
        setEditingId(null);
        setSuccessMessage(editingId ? "Appointment updated successfully!" : "Appointment booked successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
        setShowModal(false);
        fetchAppointments();
      } else {
        alert(editingId ? "Failed to update appointment." : "Failed to book appointment.");
      }
    } catch (err) {
      console.error(err);
      alert("Server Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (appointment) => {
    setEditingId(appointment.appointment_id);
    setFormData({
      patient_name: appointment.patient_name,
      doctor_name: appointment.doctor_name,
      appointment_date: appointment.appointment_date,
      appointment_time: appointment.appointment_time,
      reason: appointment.reason || "",
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      patient_name: "",
      doctor_name: "",
      appointment_date: "",
      appointment_time: "",
      reason: "",
    });
  };

  const filteredAppointments = appointments.filter(
    (apt) =>
      apt.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.doctor_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5001/appointments/${appointmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchAppointments();
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Server Error");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Check-ined":
        return { bg: "#ecfdf5", text: "#065f46" };
      case "Cancelled":
        return { bg: "#fef2f2", text: "#991b1b" };
      default:
        return { bg: "#eff6ff", text: "#0c4a6e" };
    }
  };

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
            Appointment List
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
            <span>+</span> Add Appointment
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
            placeholder="🔍 Search by name or doctor..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "100%", maxWidth: "400px" }}
          />
        </div>

        {/* Appointments Table */}
        <div
          style={{
            background: "white",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            overflow: "hidden",
          }}
        >
          {filteredAppointments.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center" }}>
              <p style={{ color: "#94a3b8", fontSize: "15px" }}>
                {searchTerm ? "No appointments found" : "No appointments scheduled yet"}
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
                      Patient
                    </th>
                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", color: "#475569" }}>
                      Doctor
                    </th>
                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", color: "#475569" }}>
                      Date
                    </th>
                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", color: "#475569" }}>
                      Time
                    </th>
                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", color: "#475569" }}>
                      Reason
                    </th>
                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", color: "#475569" }}>
                      Status
                    </th>
                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", color: "#475569" }}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((apt, idx) => {
                    const statusInfo = getStatusColor(apt.status);
                    return (
                      <tr
                        key={apt.appointment_id}
                        style={{
                          borderBottom: "1px solid #e2e8f0",
                          background: idx % 2 === 0 ? "#ffffff" : "#f8fafc",
                          transition: "background 0.2s",
                          position: "relative",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = idx % 2 === 0 ? "#ffffff" : "#f8fafc")
                        }
                      >
                        <td style={{ padding: "16px", color: "#1e293b", fontWeight: "500" }}>
                          {apt.patient_name}
                        </td>
                        <td style={{ padding: "16px", color: "#64748b" }}>{apt.doctor_name}</td>
                        <td style={{ padding: "16px", color: "#64748b" }}>
                          {new Date(apt.appointment_date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td style={{ padding: "16px", color: "#64748b" }}>{apt.appointment_time}</td>
                        <td style={{ padding: "16px", color: "#64748b" }}>
                          {apt.reason || "-"}
                        </td>
                        <td style={{ padding: "16px" }}>
                          <div style={{ position: "relative" }} ref={(el) => {
                            if (el && openDropdown === apt.appointment_id) {
                              window.statusButtonRect = el.getBoundingClientRect();
                            }
                          }}>
                            <button
                              onClick={() => setOpenDropdown(openDropdown === apt.appointment_id ? null : apt.appointment_id)}
                              style={{
                                padding: "8px 12px",
                                borderRadius: "6px",
                                fontSize: "13px",
                                fontWeight: "600",
                                background: statusInfo.bg,
                                color: statusInfo.text,
                                border: `2px solid ${statusInfo.text}`,
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              {apt.status || "Scheduled"}
                              <span style={{ fontSize: "10px" }}>▼</span>
                            </button>

                            {openDropdown === apt.appointment_id && (
                              <div
                                style={{
                                  position: "fixed",
                                  background: "white",
                                  border: "1px solid #cbd5e1",
                                  borderRadius: "8px",
                                  boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
                                  minWidth: "180px",
                                  zIndex: 9999,
                                  overflow: "hidden",
                                  top: `${window.statusButtonRect?.bottom + 4 || 0}px`,
                                  left: `${window.statusButtonRect?.left || 0}px`,
                                  animation: "slideDown 0.2s ease-out",
                                }}
                              >
                                {["Scheduled", "Check-in", "Cancelled"].map((status) => {
                                  const isActive = apt.status === status;
                                  const colors = {
                                    Scheduled: { bg: "#eff6ff", border: "#0c4a6e", text: "#0c4a6e" },
                                    "Check-in": { bg: "#ecfdf5", border: "#065f46", text: "#065f46" },
                                    Cancelled: { bg: "#fef2f2", border: "#991b1b", text: "#991b1b" },
                                  };
                                  const color = colors[status];

                                  return (
                                    <div
                                      key={status}
                                      onClick={() => {
                                        handleStatusChange(apt.appointment_id, status);
                                        setOpenDropdown(null);
                                      }}
                                      style={{
                                        padding: "12px 16px",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        background: isActive ? color.bg : "white",
                                        borderLeft: isActive ? `4px solid ${color.border}` : "4px solid transparent",
                                        borderBottom: status !== "Cancelled" ? "1px solid #f1f5f9" : "none",
                                        transition: "all 0.15s ease",
                                        color: color.text,
                                        fontWeight: isActive ? "700" : "500",
                                      }}
                                      onMouseEnter={(e) => {
                                        if (!isActive) {
                                          e.currentTarget.style.background = "#f8fafc";
                                          e.currentTarget.style.paddingLeft = "20px";
                                        }
                                      }}
                                      onMouseLeave={(e) => {
                                        if (!isActive) {
                                          e.currentTarget.style.background = "white";
                                          e.currentTarget.style.paddingLeft = "16px";
                                        }
                                      }}
                                    >
                                      <span style={{ fontSize: "16px" }}>●</span>
                                      <span>{status}</span>
                                      {isActive && <span style={{ marginLeft: "auto", fontSize: "14px" }}>✓</span>}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: "16px" }}>
                          <button
                            onClick={() => handleEditClick(apt)}
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
                            }}
                            onMouseEnter={(e) => (e.target.style.backgroundColor = "#bfdbfe")}
                            onMouseLeave={(e) => (e.target.style.backgroundColor = "#dbeafe")}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
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
                {editingId ? "Edit Appointment" : "Add Appointment"}
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
              {/* Patient */}
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
                  Patient <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  name="patient_name"
                  value={formData.patient_name}
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
                  <option value="">Select a patient...</option>
                  {patients.map((p) => (
                    <option key={p.patient_id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Doctor */}
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
                  Doctor <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  name="doctor_name"
                  value={formData.doctor_name}
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
                  <option value="">Select a doctor...</option>
                  {doctors.map((d) => (
                    <option key={d.doctor_id} value={d.name}>
                      {d.name} • {d.specialization || "General"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Time */}
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
                    Date <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="date"
                    name="appointment_date"
                    value={formData.appointment_date}
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
                    Time <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="time"
                    name="appointment_time"
                    value={formData.appointment_time}
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

              {/* Reason */}
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
                  Reason for Visit
                </label>
                <input
                  type="text"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="e.g. Annual check-up"
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
                  onClick={() => setShowModal(false)}
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
                    background: isSubmitting ? "#94a3b8" : "#0284c7",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    !isSubmitting && (e.target.style.background = "#0369a1")
                  }
                  onMouseLeave={(e) =>
                    !isSubmitting && (e.target.style.background = "#0284c7")
                  }
                >
                  {isSubmitting ? (editingId ? "Updating..." : "Booking...") : (editingId ? "Update Appointment" : "Book Appointment")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;

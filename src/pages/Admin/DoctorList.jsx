import React, { useState, useEffect } from "react";

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    specialization: "",
    phone: "",
    password: "",
  });

  const fetchDoctors = () => {
    setLoading(true);
    fetch("http://localhost:5001/doctors")
      .then((res) => res.json())
      .then((data) => {
        setDoctors(data);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure? This will delete the doctor's login account too."
      )
    ) {
      try {
        const response = await fetch(`http://localhost:5001/doctors/${id}`, {
          method: "DELETE",
        });

        console.log("Delete response status:", response.status);
        console.log("Delete response ok:", response.ok);

        if (response.ok) {
          const data = await response.json();
          console.log("Delete success:", data);
          fetchDoctors();
        } else {
          const text = await response.text();
          console.log("Delete error text:", text);
          try {
            const errorData = JSON.parse(text);
            alert(errorData.error || "Failed to delete doctor.");
          } catch {
            alert("Failed to delete doctor. Server response: " + text);
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
      const dataToSend = {
        ...formData,
        name: formData.name.startsWith("Dr.") ? formData.name : `Dr. ${formData.name}`,
      };
      
      const url = editingId
        ? `http://localhost:5001/doctors/${editingId}`
        : "http://localhost:5001/doctors";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });
      if (response.ok) {
        setFormData({
          name: "",
          email: "",
          specialization: "",
          phone: "",
          password: "",
        });
        setEditingId(null);
        setSuccessMessage(editingId ? "Doctor updated successfully!" : "Doctor added successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
        setShowModal(false);
        fetchDoctors();
      } else {
        alert(editingId ? "Error updating doctor." : "Error creating doctor.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditClick = (doctor) => {
    setEditingId(doctor.doctor_id);
    setFormData({
      name: doctor.name.startsWith("Dr.") ? doctor.name.substring(4) : doctor.name,
      email: doctor.email || "",
      specialization: doctor.specialization || "",
      phone: doctor.phone || "",
      password: "",
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      name: "",
      email: "",
      specialization: "",
      phone: "",
      password: "",
    });
  };

  const filteredDoctors = doctors.filter((doc) =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
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
            Doctor List
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
            <span>+</span> Add Doctor
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
            placeholder="🔍 Search by name..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "100%", maxWidth: "400px" }}
          />
        </div>

        {/* Doctors Table */}
        <div
          style={{
            background: "white",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            overflow: "hidden",
          }}
        >
          {filteredDoctors.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center" }}>
              <p style={{ color: "#94a3b8", fontSize: "15px" }}>
                {searchTerm ? "No doctors found" : "No doctors registered yet"}
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
                      Email
                    </th>
                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", color: "#475569" }}>
                      Specialization
                    </th>
                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", color: "#475569" }}>
                      Phone
                    </th>
                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", color: "#475569" }}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDoctors.map((doctor, idx) => (
                    <tr
                      key={doctor.doctor_id}
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
                        {doctor.name}
                      </td>
                      <td style={{ padding: "16px", color: "#64748b" }}>
                        {doctor.email || "-"}
                      </td>
                      <td style={{ padding: "16px", color: "#64748b" }}>
                        {doctor.specialization || "-"}
                      </td>
                      <td style={{ padding: "16px", color: "#64748b" }}>
                        {doctor.phone || "-"}
                      </td>
                      <td style={{ padding: "16px" }}>
                        <button
                          onClick={() => handleEditClick(doctor)}
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
                          onClick={() => handleDelete(doctor.doctor_id)}
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
          onClick={() => setShowModal(false)}
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
                {editingId ? "Edit Doctor" : "Add Doctor"}
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
                  placeholder="e.g. John Smith"
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
                  Email <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
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
                  Specialization <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  placeholder="e.g. Cardiology"
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
                  Password <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
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
                  {isSubmitting ? (editingId ? "Updating..." : "Creating...") : (editingId ? "Update Doctor" : "Create Doctor")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorList;

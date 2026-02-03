import React, { useState, useEffect } from "react";

const NurseList = () => {
  const [nurses, setNurses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const fetchData = () => {
    fetch("http://localhost:5001/nurses")
      .then((res) => res.json())
      .then((data) => setNurses(data))
      .catch((err) => console.error("Error fetching nurses:", err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editingId
        ? `http://localhost:5001/nurses/${editingId}`
        : "http://localhost:5001/nurses";
      const method = editingId ? "PUT" : "POST";

      await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
      });
      setEditingId(null);
      setSuccessMessage(editingId ? "Nurse updated successfully!" : "Nurse added successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error(editingId ? "Failed to update nurse" : "Failed to add nurse", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (nurse) => {
    setEditingId(nurse.nurse_id);
    setFormData({
      name: nurse.name,
      email: nurse.email || "",
      phone: nurse.phone || "",
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
      phone: "",
      password: "",
    });
  };

  const handleRemove = async (id) => {
    if (window.confirm("Are you sure you want to remove this nurse?")) {
      await fetch(`http://localhost:5001/nurses/${id}`, { method: "DELETE" });
      fetchData();
    }
  };

  const filteredNurses = nurses.filter(
    (nurse) =>
      nurse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (nurse.email && nurse.email.toLowerCase().includes(searchTerm.toLowerCase()))
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
            Nurse List
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
            <span>+</span> Add Nurse
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
            placeholder="🔍 Search by name or email..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "100%", maxWidth: "400px" }}
          />
        </div>

        {/* Nurses Table */}
        <div
          style={{
            background: "white",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            overflow: "hidden",
          }}
        >
          {filteredNurses.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center" }}>
              <p style={{ color: "#94a3b8", fontSize: "15px" }}>
                {searchTerm ? "No nurses found" : "No nurses registered yet"}
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
                      Phone
                    </th>
                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", color: "#475569" }}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNurses.map((nurse, idx) => (
                    <tr
                      key={nurse.nurse_id}
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
                        {nurse.name}
                      </td>
                      <td style={{ padding: "16px", color: "#64748b" }}>
                        {nurse.email || "-"}
                      </td>
                      <td style={{ padding: "16px", color: "#64748b" }}>
                        {nurse.phone || "-"}
                      </td>
                      <td style={{ padding: "16px" }}>
                        <button
                          onClick={() => handleEditClick(nurse)}
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
                          onClick={() => handleRemove(nurse.nurse_id)}
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
                {editingId ? "Edit Nurse" : "Add Nurse"}
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
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                  {isSubmitting
                    ? editingId
                      ? "Updating..."
                      : "Creating..."
                    : editingId
                    ? "Update Nurse"
                    : "Create Nurse"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NurseList;

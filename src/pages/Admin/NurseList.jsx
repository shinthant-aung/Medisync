import React, { useState, useEffect } from "react";

const NurseList = () => {
  const [nurses, setNurses] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    assigned_doctor: "",
    username: "",
    password: "",
  });

  const fetchData = () => {
    fetch("http://localhost:5001/nurses")
      .then((res) => res.json())
      .then((data) => setNurses(data))
      .catch((err) => console.error("Error fetching nurses:", err));

    fetch("http://localhost:5001/doctors")
      .then((res) => res.json())
      .then((data) => setDoctors(data))
      .catch((err) => console.error("Error fetching doctors:", err));
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch("http://localhost:5001/nurses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setShowModal(false);
      setFormData({
        full_name: "",
        email: "",
        assigned_doctor: "",
        username: "",
        password: "",
      });
      fetchData();
    } catch (error) {
      console.error("Failed to add nurse", error);
    }
  };

  const handleRemove = async (id) => {
    if (window.confirm("Are you sure you want to remove this nurse?")) {
      await fetch(`http://localhost:5001/nurses/${id}`, { method: "DELETE" });
      fetchData();
    }
  };

  const filteredNurses = nurses.filter(
    (nurse) =>
      nurse.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nurse.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // HELPER: Determine Color
  const getStatusStyle = (status) => {
    const currentStatus = status || "Available";
    if (currentStatus === "Available") {
      return { bg: "#dcfce7", text: "#166534" }; // Green
    }
    // Returns Red for 'Busy', 'On Break', or anything else
    return { bg: "#fee2e2", text: "#991b1b" };
  };

  return (
    <div
      style={{
        padding: "30px",
        backgroundColor: "#ffffff",
        minHeight: "100vh",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1
          style={{
            fontSize: "1.8rem",
            fontWeight: "bold",
            color: "#1e293b",
            margin: 0,
          }}
        >
          Nurse List
        </h1>
        <button
          onClick={() => setShowModal(true)}
          style={{
            backgroundColor: "#3b82f6",
            color: "white",
            padding: "10px 20px",
            borderRadius: "6px",
            border: "none",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          + Add Nurse
        </button>
      </div>

      {/* SEARCH */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ position: "relative", maxWidth: "300px" }}>
          <span
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#64748b",
            }}
          >
            🔍
          </span>
          <input
            type="text"
            placeholder="Search nurse..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 10px 10px 35px",
              borderRadius: "6px",
              border: "1px solid #e2e8f0",
              backgroundColor: "#f8fafc",
              fontSize: "0.95rem",
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* TABLE */}
      <div
        style={{
          borderRadius: "8px",
          overflow: "hidden",
          border: "1px solid #e2e8f0",
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
            <tr style={{ backgroundColor: "#e2e8f0", textAlign: "left" }}>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Assigned Doctor</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredNurses.map((nurse) => {
              // Calculate style for this specific nurse
              const statusStyle = getStatusStyle(nurse.status);

              return (
                <tr
                  key={nurse.id}
                  style={{ borderBottom: "1px solid #f1f5f9" }}
                >
                  <td style={tdStyle}>
                    <span style={{ fontWeight: "500" }}>{nurse.full_name}</span>
                  </td>
                  <td style={tdStyle}>{nurse.email}</td>
                  <td style={tdStyle}>
                    {nurse.assigned_doctor || "Unassigned"}
                  </td>

                  {/* STATUS BADGE (Updated Logic) */}
                  <td style={tdStyle}>
                    <span
                      style={{
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.text,
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                      }}
                    >
                      {nurse.status || "Available"}
                    </span>
                  </td>

                  <td style={tdStyle}>
                    <button
                      onClick={() => handleRemove(nurse.id)}
                      style={{
                        backgroundColor: "#fee2e2",
                        color: "#991b1b",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "#f8fafc",
            zIndex: 2000,
            display: "flex",
            flexDirection: "column",
            padding: "40px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              maxWidth: "600px",
              width: "100%",
              margin: "0 auto 20px auto",
            }}
          >
            <h2
              style={{
                fontSize: "1.8rem",
                fontWeight: "bold",
                color: "#1e293b",
                margin: 0,
              }}
            >
              Add New Nurse
            </h2>
            <button
              onClick={() => setShowModal(false)}
              style={{
                backgroundColor: "#64748b",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>

          <div
            style={{
              backgroundColor: "white",
              padding: "40px",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "600px",
              margin: "0 auto",
              border: "1px solid #e2e8f0",
            }}
          >
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <input
                placeholder="Full Name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                required
                style={inputStyle}
              />
              <input
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                style={inputStyle}
              />

              <select
                value={formData.assigned_doctor}
                onChange={(e) =>
                  setFormData({ ...formData, assigned_doctor: e.target.value })
                }
                style={inputStyle}
              >
                <option value="">Select Assigned Doctor (Optional)</option>
                {doctors.length > 0 ? (
                  doctors.map((doc) => (
                    <option key={doc.id} value={doc.full_name}>
                      {doc.full_name}{" "}
                      {doc.specialty ? `(${doc.specialty})` : ""}
                    </option>
                  ))
                ) : (
                  <option disabled>No doctors available</option>
                )}
              </select>

              <input
                placeholder="Username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
                style={inputStyle}
              />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                style={inputStyle}
              />

              <button
                type="submit"
                style={{
                  marginTop: "10px",
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "white",
                  color: "black",
                  border: "1px solid #000",
                  borderRadius: "6px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles
const thStyle = {
  padding: "15px 20px",
  fontSize: "0.85rem",
  fontWeight: "600",
  color: "#475569",
  borderBottom: "1px solid #e2e8f0",
};
const tdStyle = { padding: "15px 20px", fontSize: "0.95rem", color: "#334155" };
const inputStyle = {
  width: "100%",
  padding: "12px 15px",
  borderRadius: "6px",
  border: "1px solid #e2e8f0",
  backgroundColor: "#f8fafc",
  outline: "none",
  fontSize: "0.95rem",
};

export default NurseList;

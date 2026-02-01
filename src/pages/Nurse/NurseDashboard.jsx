import React, { useState, useEffect } from "react";

const NurseDashboard = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nurseName, setNurseName] = useState("Nurse");
  const [status, setStatus] = useState("Available"); // Default state

  useEffect(() => {
    // 1. Get User Info safely
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    const savedName = localStorage.getItem("userFullName");

    // Fallback logic to get email
    const email = user ? user.email : localStorage.getItem("userEmail");

    if (user || savedName) {
      setNurseName(user?.full_name || savedName || "Nurse");
    }

    // 2. FETCH STATUS FROM DB (The Fix)
    if (email) {
      fetch(`http://localhost:5001/nurse/status?email=${email}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.status) {
            console.log("Fetched Status from DB:", data.status); // Debug
            setStatus(data.status); // <--- This restores 'Busy' from the database
          }
        })
        .catch((err) => console.error("Error fetching status:", err));
    }

    // 3. Fetch Dashboard Data
    fetch("http://localhost:5001/nurse/dashboard")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPrescriptions(data);
        setLoading(false);
      })
      .catch((err) => setLoading(false));
  }, []);

  const handleStatusChange = async (newStatus) => {
    setStatus(newStatus); // Update UI instantly

    const user = JSON.parse(localStorage.getItem("user"));
    const email = user ? user.email : localStorage.getItem("userEmail");

    if (email) {
      await fetch("http://localhost:5001/nurse/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, status: newStatus }),
      });
      // Force a refresh of the Admin Dashboard if it's open elsewhere
    }
  };

  // ... (Rest of your render code remains the same)

  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return dateString.toString().split("T")[0];
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Inter, sans-serif" }}>
      {/* HEADER CARD */}
      <div
        style={{
          background: "white",
          padding: "25px",
          borderRadius: "12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.8rem",
              fontWeight: "bold",
              margin: 0,
              color: "#1e293b",
            }}
          >
            Nurse Dashboard
          </h1>
          <p style={{ margin: "5px 0 0", color: "#64748b" }}>
            Welcome, {nurseName}.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ color: "#64748b", fontWeight: "500" }}>
            My Status:
          </span>
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border: "1px solid #cbd5e1",
              background: status === "Available" ? "#dcfce7" : "#fee2e2",
              color: status === "Available" ? "#166534" : "#991b1b",

              fontWeight: "bold",
              cursor: "pointer",
              outline: "none",
              fontSize: "0.95rem",
            }}
          >
            <option value="Available">🟢 Available</option>
            <option value="Busy">🔴 Busy</option>
            <option value="On Break">🔴 On Break</option>
          </select>
        </div>
      </div>

      <h2
        style={{
          fontSize: "1.5rem",
          fontWeight: "bold",
          marginBottom: "20px",
          color: "#1e293b",
        }}
      >
        Prescription Log
      </h2>

      {/* Table Section */}
      <div
        className="table-container"
        style={{
          background: "white",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          border: "1px solid #e2e8f0",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                background: "#f1f5f9",
                textAlign: "left",
                color: "#475569",
              }}
            >
              <th
                style={{
                  padding: "16px",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                }}
              >
                Patient ↓
              </th>
              <th
                style={{
                  padding: "16px",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                }}
              >
                Doctor
              </th>
              <th
                style={{
                  padding: "16px",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                }}
              >
                Date
              </th>
              <th
                style={{
                  padding: "16px",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                }}
              >
                Time
              </th>
              <th
                style={{
                  padding: "16px",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                }}
              >
                Prescription
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="5"
                  style={{
                    padding: "30px",
                    textAlign: "center",
                    color: "#64748b",
                  }}
                >
                  Loading records...
                </td>
              </tr>
            ) : prescriptions.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  style={{
                    padding: "30px",
                    textAlign: "center",
                    color: "#94a3b8",
                  }}
                >
                  No recent prescriptions found.
                </td>
              </tr>
            ) : (
              prescriptions.map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td
                    style={{
                      padding: "16px",
                      fontWeight: "600",
                      color: "#0f172a",
                    }}
                  >
                    {item.patient_name}
                  </td>
                  <td style={{ padding: "16px", color: "#64748b" }}>
                    {item.doctor_name}
                  </td>
                  <td style={{ padding: "16px", color: "#64748b" }}>
                    {formatDate(item.appointment_date)}
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      color: "#64748b",
                      fontWeight: "500",
                    }}
                  >
                    {item.appointment_time}
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div
                      style={{
                        background: "#eff6ff",
                        color: "#1e40af",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        display: "inline-block",
                        fontSize: "0.9rem",
                        fontWeight: "500",
                      }}
                    >
                      {item.prescriptions}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NurseDashboard;

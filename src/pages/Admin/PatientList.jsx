// src/pages/Admin/PatientList.jsx
import React, { useState, useEffect } from "react";

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false); // Toggle between List and Form
  const [searchTerm, setSearchTerm] = useState(""); // Search State

  // Form Data State
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    date_of_birth: "",
    phone: "",
    address: "",
  });

  // 1. Fetch Patients Function (Reusable)
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

  // Load data on first render
  useEffect(() => {
    fetchPatients();
  }, []);

  // 2. Handle Delete (Remove Patient)
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

        if (response.ok) {
          // If delete was successful, refresh the list
          fetchPatients();
        } else {
          alert("Failed to delete patient.");
        }
      } catch (err) {
        console.error("Error deleting:", err);
        alert("Server error while deleting.");
      }
    }
  };

  // 3. Handle Form Submit (Add Patient)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5001/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Patient Added Successfully!");
        setShowForm(false); // Switch back to list view
        fetchPatients(); // Refresh list to show new person
        setFormData({
          name: "",
          gender: "",
          date_of_birth: "",
          phone: "",
          address: "",
        }); // Clear form
      } else {
        alert("Failed to add patient");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server");
    }
  };

  // Handle Input Change for Form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 4. Filter Logic (Search)
  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.phone && patient.phone.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <div
        className="search-bar-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 className="page-title">
          {showForm ? "Register New Patient" : "Patient List"}
        </h2>

        {/* Toggle Button (Add / Cancel) */}
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: "10px 20px",
            backgroundColor: showForm ? "#64748b" : "#2563eb", // Grey if cancelling, Blue if adding
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {showForm ? "Cancel" : "+ Add Patient"}
        </button>
      </div>

      {/* Search Input (Only show if not adding a patient) */}
      {!showForm && (
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
      )}

      {/* CONDITIONAL RENDERING: Show Form OR Table */}
      {showForm ? (
        /* --- ADD PATIENT FORM --- */
        <div
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            maxWidth: "600px",
            margin: "20px auto",
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{ display: "grid", gap: "20px" }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                }}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "500",
                  }}
                >
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "500",
                  }}
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                  }}
                />
              </div>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                backgroundColor: "#16a34a",
                color: "white",
                padding: "12px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "1rem",
              }}
            >
              Save Patient
            </button>
          </form>
        </div>
      ) : (
        /* --- PATIENT LIST TABLE --- */
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Gender</th>
                <th>Phone</th>
                <th>Date of Birth</th>
                <th style={{ width: "100px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{ padding: "20px", textAlign: "center" }}
                  >
                    Loading...
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
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
                  <tr key={patient.patient_id}>
                    <td style={{ fontWeight: "500" }}>{patient.name}</td>
                    <td style={{ color: "#64748b" }}>{patient.gender || "-"}</td>
                    <td>{patient.phone || "-"}</td>
                    <td>
                      {patient.date_of_birth
                        ? patient.date_of_birth.split("T")[0]
                        : "-"}
                    </td>
                    <td>
                      {/* DELETE BUTTON */}
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
                        }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PatientList;

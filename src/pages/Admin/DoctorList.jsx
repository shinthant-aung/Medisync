import React, { useState, useEffect } from "react";

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Form Data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    specialization: "",
    phone: "",
    password: "",
  });

  // 1. Fetch Doctors
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

  // 2. DELETE FUNCTION
  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure? This will delete the doctor's login account too."
      )
    ) {
      try {
        await fetch(`http://localhost:5001/doctors/${id}`, {
          method: "DELETE",
        });
        fetchDoctors(); // Refresh list
      } catch (err) {
        console.error("Error deleting:", err);
      }
    }
  };

  // 3. Create Account
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Add "Dr." prefix if not already present
      const dataToSend = {
        ...formData,
        name: formData.name.startsWith("Dr.") ? formData.name : `Dr. ${formData.name}`,
      };
      
      const response = await fetch("http://localhost:5001/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });
      if (response.ok) {
        alert("Doctor Created!");
        setShowForm(false);
        setFormData({
          name: "",
          email: "",
          specialization: "",
          phone: "",
          password: "",
        });
        fetchDoctors();
      } else {
        alert("Error creating doctor.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const filteredDoctors = doctors.filter((doc) =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
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
          {showForm ? "Add New Doctor" : "Doctor List"}
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: "10px 20px",
            background: showForm ? "#64748b" : "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {showForm ? "Cancel" : "+ Add Doctor"}
        </button>
      </div>

      {!showForm && (
        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="🔍 Search doctor..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {showForm ? (
        /* Form Code (Simplified for brevity - keep your existing form here) */
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
            style={{ display: "grid", gap: "15px" }}
          >
            <input
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="nurse-input"
            />
            <input
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="nurse-input"
            />
            <input
              name="specialization"
              placeholder="Specialization (e.g., Cardiology)"
              value={formData.specialization}
              onChange={handleChange}
              required
              className="nurse-input"
            />
            <input
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
              className="nurse-input"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="nurse-input"
            />
            <button type="submit" className="submit-btn">
              Create Doctor
            </button>
          </form>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Specialization</th>
                <th>Phone</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5">Loading...</td>
                </tr>
              ) : (
                filteredDoctors.map((doctor) => (
                  <tr key={doctor.doctor_id}>
                    <td style={{ fontWeight: "500" }}>{doctor.name}</td>
                    <td style={{ color: "#64748b" }}>{doctor.email || "-"}</td>
                    <td>{doctor.specialization || "-"}</td>
                    <td>{doctor.phone || "-"}</td>
                    <td>
                      {/* REMOVE BUTTON */}
                      <button
                        onClick={() => handleDelete(doctor.doctor_id)}
                        style={{
                          background: "#fee2e2",
                          color: "#991b1b",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: "0.8rem",
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

export default DoctorList;

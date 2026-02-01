import React, { useState, useEffect } from "react";

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Form Data
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    specialty: "",
    username: "",
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
      const response = await fetch("http://localhost:5001/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert("Doctor Created!");
        setShowForm(false);
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
    doc.full_name.toLowerCase().includes(searchTerm.toLowerCase())
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
              name="full_name"
              placeholder="Full Name"
              onChange={handleChange}
              required
              className="nurse-input"
            />
            <input
              name="email"
              placeholder="Email"
              onChange={handleChange}
              required
              className="nurse-input"
            />
            <select
              name="specialty"
              onChange={handleChange}
              required
              className="nurse-input"
            >
              <option value="">Select Specialty</option>
              <option value="Cardiologist">Cardiologist</option>
              <option value="Neurologist">Neurologist</option>
              <option value="General">General</option>
            </select>
            <input
              name="username"
              placeholder="Username"
              onChange={handleChange}
              required
              className="nurse-input"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              onChange={handleChange}
              required
              className="nurse-input"
            />
            <button type="submit" className="submit-btn">
              Create Account
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
                <th>Role</th>
                <th>Status</th>
                <th>Action</th> {/* NEW COLUMN */}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5">Loading...</td>
                </tr>
              ) : (
                filteredDoctors.map((doctor) => (
                  <tr key={doctor.id}>
                    <td style={{ fontWeight: "500" }}>{doctor.full_name}</td>
                    <td style={{ color: "#64748b" }}>{doctor.email}</td>
                    <td>{doctor.specialty}</td>
                    <td>
                      <span
                        style={{
                          padding: "5px 10px",
                          borderRadius: "15px",
                          fontSize: "0.8rem",
                          backgroundColor:
                            doctor.availability_status === "Available"
                              ? "#dcfce7"
                              : "#fee2e2",
                          color:
                            doctor.availability_status === "Available"
                              ? "#166534"
                              : "#991b1b",
                        }}
                      >
                        {doctor.availability_status}
                      </span>
                    </td>
                    <td>
                      {/* REMOVE BUTTON */}
                      <button
                        onClick={() => handleDelete(doctor.id)}
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

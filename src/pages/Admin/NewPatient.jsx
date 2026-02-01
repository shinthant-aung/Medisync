import React, { useState } from "react";

const NewPatient = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    gender: "",
    date_of_birth: "",
    email: "",
    allergies: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5001/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Patient Registered Successfully!");
        // Clear form
        setFormData({
          full_name: "",
          gender: "",
          date_of_birth: "",
          email: "",
          allergies: "",
        });
      } else {
        alert("Failed to register patient");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px" }}>
      <h2 style={{ marginBottom: "10px" }}>Register New Patient</h2>
      <p style={{ color: "#64748b", marginBottom: "30px" }}>
        Enter the new patient's details below.
      </p>

      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
        }}
      >
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "20px" }}>
          {/* Full Name */}
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
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Enter Full Name"
              required
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                background: "#f8fafc",
              }}
            />
          </div>

          {/* Gender & DOB Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >
            {/* GENDER SELECT FIX */}
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
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: "white",
                }}
              >
                <option value="" disabled>
                  Select gender
                </option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Others">Others</option>
              </select>
            </div>

            {/* Date of Birth */}
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
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: "#f8fafc",
                }}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "500",
              }}
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g patient@example.com"
              required
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                background: "#f8fafc",
              }}
            />
          </div>

          {/* Allergies */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "500",
              }}
            >
              Known Allergies
            </label>
            <input
              type="text"
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
              placeholder="e.g Peanuts, Aspirin"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                background: "#f8fafc",
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              justifySelf: "end",
              padding: "12px 40px",
              background: "white",
              border: "1px solid #0f172a",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
              marginTop: "10px",
            }}
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewPatient;

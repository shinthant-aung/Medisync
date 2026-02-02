import React, { useState, useEffect } from "react";

const Booking = () => {
  // 1. Data for Dropdowns
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // 2. Form Inputs State
  const [formData, setFormData] = useState({
    patient_name: "",
    doctor_name: "",
    appointment_date: "",
    appointment_time: "",
    reason: "",
  });

  // 3. Fetch Data on Load
  useEffect(() => {
    // Get Patients
    fetch("http://localhost:5001/patients")
      .then((res) => res.json())
      .then((data) => setPatients(data))
      .catch((err) => console.error("Error loading patients", err));

    // Get Doctors
    fetch("http://localhost:5001/doctors")
      .then((res) => res.json())
      .then((data) => setDoctors(data))
      .catch((err) => console.error("Error loading doctors", err));
  }, []);

  // 4. Handle Typing/Selecting
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 5. Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Basic Validation
      if (!formData.patient_name || !formData.doctor_name) {
        alert("Please select both a patient and a doctor.");
        return;
      }

      const response = await fetch("http://localhost:5001/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Appointment Booked Successfully!");
        setFormData({
          patient_name: "",
          doctor_name: "",
          appointment_date: "",
          appointment_time: "",
          reason: "",
        });
      } else {
        alert("Failed to book appointment.");
      }
    } catch (err) {
      console.error(err);
      alert("Server Error");
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "10px" }}>Booking</h2>
      <p style={{ color: "#64748b", marginBottom: "30px" }}>
        Fill in the details to schedule a new patient visit.
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
          {/* Patient Dropdown */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "500",
              }}
            >
              Patient
            </label>
            <select
              name="patient_name"
              value={formData.patient_name}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                background: "white",
              }}
            >
              <option value="">Select a patient</option>
              {patients.map((p) => (
                <option key={p.patient_id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Doctor Dropdown */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "500",
              }}
            >
              Doctor
            </label>
            <select
              name="doctor_name"
              value={formData.doctor_name}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                background: "white",
              }}
            >
              <option value="">Select a doctor</option>
              {doctors.map((d) => (
                <option key={d.doctor_id} value={d.name}>
                  {d.name} ({d.specialization || "N/A"})
                </option>
              ))}
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
                Date
              </label>
              <input
                type="date"
                name="appointment_date"
                value={formData.appointment_date}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
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
                Time
              </label>
              <input
                type="time"
                name="appointment_time"
                value={formData.appointment_time}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
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
              Reason For Visit
            </label>
            <input
              type="text"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="e.g Annual check-up, flu symptoms"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              justifySelf: "end",
              padding: "12px 30px",
              background: "white",
              border: "1px solid #000",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Booking;

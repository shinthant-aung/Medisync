import React from "react";

const NewPatient = () => {
  return (
    <div>
      <h2 className="page-title">Register New Patient</h2>
      <p style={{ color: "#64748b", marginBottom: "20px" }}>
        Enter the new patient's details below.
      </p>

      <div className="form-card">
        <form>
          <div className="form-group" style={{ marginBottom: "15px" }}>
            <label>Full Name</label>
            <input
              type="text"
              className="admin-input"
              placeholder="Enter Full Name"
            />
          </div>

          <div className="form-grid">
            <div>
              <label>Gender</label>
              <select className="admin-select">
                <option>Select gender</option>
              </select>
            </div>
            <div>
              <label>Date of Birth</label>
              <input type="date" className="admin-input" />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "15px" }}>
            <label>Email</label>
            <input
              type="email"
              className="admin-input"
              placeholder="e.g patient@example.com"
            />
          </div>

          <div className="form-group" style={{ marginBottom: "15px" }}>
            <label>Known Allergies</label>
            <input
              type="text"
              className="admin-input"
              placeholder="e.g Peanuts, Aspirin"
            />
          </div>

          <button type="submit" className="submit-btn">
            Submit
          </button>
          <div style={{ clear: "both" }}></div>
        </form>
      </div>
    </div>
  );
};
export default NewPatient;

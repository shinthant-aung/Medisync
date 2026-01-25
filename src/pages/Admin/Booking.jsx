import React from "react";

const Booking = () => {
  return (
    <div>
      <h2 className="page-title">Booking</h2>
      <p style={{ color: "#64748b", marginBottom: "20px" }}>
        Fill in the details to schedule a new patient visit.
      </p>

      <div className="form-card">
        <form>
          <div className="form-group" style={{ marginBottom: "20px" }}>
            <label>Patient</label>
            <select className="admin-select">
              <option>Select a patient</option>
            </select>
          </div>

          <div className="form-grid">
            <div>
              <label>Doctor</label>
              <select className="admin-select">
                <option>Select a doctor</option>
              </select>
            </div>
            <div>
              <label>Date</label>
              <input type="date" className="admin-input" />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "20px" }}>
            <label>Time</label>
            <input type="time" className="admin-input" />
          </div>

          <div className="form-group" style={{ marginBottom: "20px" }}>
            <label>Reason For Visit</label>
            <input
              type="text"
              className="admin-input"
              placeholder="e.g Annual check-up, flu symptoms"
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
export default Booking;

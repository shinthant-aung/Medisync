// src/pages/Nurse/NurseCheckIn.jsx
import React, { useState } from "react";

const NurseCheckIn = () => {
  // State to determine if we are showing the list or the form
  const [isRecording, setIsRecording] = useState(false);

  // VIEW 1: If "Recording" mode is active, show the Vitals Form
  if (isRecording) {
    return (
      <div>
        <h2 style={{ textAlign: "center", marginBottom: "30px" }}>
          Vital Records for Patient_Name
        </h2>

        <div className="vitals-card">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setIsRecording(false);
            }}
          >
            <div className="vitals-grid">
              <div>
                <label>Height</label>
                <input
                  type="text"
                  className="nurse-input"
                  placeholder="Placeholder"
                />
              </div>
              <div>
                <label>Weight</label>
                <input
                  type="text"
                  className="nurse-input"
                  placeholder="Placeholder"
                />
              </div>
              <div>
                <label>Pulse Rate</label>
                <input
                  type="text"
                  className="nurse-input"
                  placeholder="Placeholder"
                />
              </div>
              <div>
                <label>Temperature</label>
                <input
                  type="text"
                  className="nurse-input"
                  placeholder="Placeholder"
                />
              </div>
              <div>
                <label>Blood Pressure</label>
                <input
                  type="text"
                  className="nurse-input"
                  placeholder="Placeholder"
                />
              </div>
              <div>
                <label>SP02</label>
                <input
                  type="text"
                  className="nurse-input"
                  placeholder="Placeholder"
                />
              </div>
              <div className="full-width">
                <label>Prescriptions</label>
                <textarea
                  className="nurse-input"
                  placeholder="Placeholder"
                ></textarea>
              </div>
            </div>

            {/* Buttons */}
            <button type="submit" className="submit-btn">
              Submit
            </button>
            <button
              type="button"
              onClick={() => setIsRecording(false)}
              style={{
                float: "right",
                marginRight: "10px",
                marginTop: "10px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Cancel
            </button>
            <div style={{ clear: "both" }}></div>
          </form>
        </div>
      </div>
    );
  }

  // VIEW 2: Otherwise, show the Patient List
  return (
    <div>
      <div className="header-row">
        <h2>Patient Check-in</h2>
        <input
          type="text"
          placeholder="Search medicine..."
          className="search-input"
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr 100px",
          background: "#e5e5e5",
          padding: "15px",
          fontWeight: "bold",
        }}
      >
        <div>Patient ↓</div>
        <div>Doctor</div>
        <div>Reason</div>
        <div>Diagnosis</div>
        <div>Action</div>
      </div>

      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr 100px",
            padding: "15px",
            borderBottom: "1px solid #eee",
            alignItems: "center",
          }}
        >
          <div className="row-bar" style={{ width: "70%" }}></div>
          <div className="row-bar" style={{ width: "70%" }}></div>
          <div className="row-bar" style={{ width: "70%" }}></div>
          <div className="row-bar" style={{ width: "70%" }}></div>

          {/* Clicking this button switches to the Vitals Form above */}
          <button className="record-btn" onClick={() => setIsRecording(true)}>
            Record
          </button>
        </div>
      ))}
    </div>
  );
};
export default NurseCheckIn;

import React from "react";

const DoctorPatientList = () => {
  return (
    <div>
      <div className="header-row">
        <h2>Patient</h2>
        <input
          type="text"
          placeholder="Search medicine..."
          className="search-input"
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          background: "#e5e5e5",
          padding: "15px",
          fontWeight: "bold",
          fontSize: "0.9rem",
        }}
      >
        <div>Name</div>
        <div>Prescription</div>
        <div>Allergies</div>
        <div>Next Appointment</div>
      </div>

      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            padding: "20px 15px",
            borderBottom: "1px solid #eee",
            alignItems: "center",
          }}
        >
          <div
            className="row-bar"
            style={{ width: "70%", background: "#555", height: "8px" }}
          ></div>
          <div className="row-bar" style={{ width: "70%" }}></div>
          <div className="row-bar" style={{ width: "70%" }}></div>
          <div className="row-bar" style={{ width: "70%" }}></div>
        </div>
      ))}
    </div>
  );
};
export default DoctorPatientList;

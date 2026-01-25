import React from "react";

const DoctorMedicine = () => {
  return (
    <div>
      <div className="header-row">
        <h2>Medicine</h2>
        <input
          type="text"
          placeholder="Search medicine..."
          className="search-input"
        />
      </div>

      {/* Table Header */}
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
        <div>Medicine Name</div>
        <div>Diagnosis & Treatment Relevant</div>
        <div>Patient-Safety Information</div>
        <div>Quantity</div>
      </div>

      {/* Table Rows */}
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
          <div className="row-bar" style={{ width: "80%" }}></div>
          <div className="row-bar" style={{ width: "80%" }}></div>
          <div className="row-bar" style={{ width: "80%" }}></div>
          <div className="qty-control">
            <div className="circle-btn">-</div>
            <div className="row-bar" style={{ width: "60px" }}></div>
            <div className="circle-btn">+</div>
          </div>
        </div>
      ))}

      <button className="enter-btn">Enter</button>
    </div>
  );
};
export default DoctorMedicine;

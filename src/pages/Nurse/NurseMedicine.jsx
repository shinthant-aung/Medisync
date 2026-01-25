import React from "react";

const NurseMedicine = () => {
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.5fr 1.5fr 80px",
          background: "#e5e5e5",
          padding: "15px",
          fontWeight: "bold",
          fontSize: "0.9rem",
        }}
      >
        <div>Name</div>
        <div>Diagnosis & Treatment Relevant</div>
        <div>Patient-Safety Information</div>
        <div>Qty</div>
      </div>

      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.5fr 1.5fr 80px",
            padding: "20px 15px",
            borderBottom: "1px solid #eee",
            alignItems: "center",
          }}
        >
          <div className="row-bar" style={{ width: "80%" }}></div>
          <div className="row-bar" style={{ width: "80%" }}></div>
          <div className="row-bar" style={{ width: "80%" }}></div>
          <div className="row-bar" style={{ width: "100%" }}></div>
        </div>
      ))}
    </div>
  );
};
export default NurseMedicine;

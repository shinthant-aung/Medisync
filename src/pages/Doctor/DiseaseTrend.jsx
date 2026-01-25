import React from "react";

const DiseaseTrend = () => {
  return (
    <div>
      <div className="header-row">
        <h2>Disease Trend Monitor</h2>
        <input
          type="text"
          placeholder="Search for..."
          className="search-input"
        />
      </div>

      <div className="charts-grid">
        {/* Pie Charts */}
        <div className="chart-box">
          <div
            style={{ display: "flex", justifyContent: "center", gap: "20px" }}
          >
            <div className="pie-placeholder"></div>
            <div className="pie-placeholder"></div>
          </div>
          <p style={{ fontSize: "0.85rem", marginTop: "15px" }}>
            Diseases that are mostly happened in this month
          </p>
        </div>

        {/* Bar Chart 1 */}
        <div className="chart-box">
          <div className="chart-placeholder">
            <div className="bar" style={{ height: "40%" }}></div>
            <div className="bar" style={{ height: "70%" }}></div>
            <div className="bar" style={{ height: "50%" }}></div>
            <div className="bar" style={{ height: "30%" }}></div>
            <div className="bar" style={{ height: "80%" }}></div>
          </div>
          <p style={{ fontSize: "0.85rem", marginTop: "15px" }}>
            How many people get Diabetes in this month
          </p>
        </div>

        {/* Bar Chart 2 */}
        <div className="chart-box">
          <div className="chart-placeholder">
            <div className="bar" style={{ height: "60%" }}></div>
            <div className="bar" style={{ height: "40%" }}></div>
            <div className="bar" style={{ height: "90%" }}></div>
            <div className="bar" style={{ height: "50%" }}></div>
          </div>
          <p style={{ fontSize: "0.85rem", marginTop: "15px" }}>
            How many people get Heart attack in this month
          </p>
        </div>

        {/* Bar Chart 3 */}
        <div className="chart-box">
          <div className="chart-placeholder">
            <div className="bar" style={{ height: "30%" }}></div>
            <div className="bar" style={{ height: "60%" }}></div>
            <div className="bar" style={{ height: "40%" }}></div>
            <div className="bar" style={{ height: "70%" }}></div>
          </div>
          <p style={{ fontSize: "0.85rem", marginTop: "15px" }}>
            How many people get Flu in this month
          </p>
        </div>
      </div>
    </div>
  );
};
export default DiseaseTrend;

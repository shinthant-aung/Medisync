import React from "react";

const AdminDashboard = () => {
  return (
    <div>
      <div
        className="form-card"
        style={{ marginBottom: "20px", borderLeft: "4px solid #3b82f6" }}
      >
        <h2>Welcome</h2>
        <p style={{ color: "#64748b" }}>
          You can manage patient appointments, register new patients, and handle
          administrative tasks.
        </p>
      </div>

      <div className="search-bar-header">
        <h2 className="page-title">Today's Appointments</h2>
        <input
          type="text"
          placeholder="Search medicine..."
          className="search-input"
        />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Patient Name</th>
              <th>Date & Time</th>
              <th>Doctor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {/* Dummy Rows to look like wireframe */}
            {[1, 2, 3, 4].map((i) => (
              <tr key={i}>
                <td>
                  <div
                    className="skeleton-bar"
                    style={{
                      width: "60%",
                      height: "20px",
                      background: "#94a3b8",
                    }}
                  ></div>
                </td>
                <td>
                  <div className="skeleton-bar"></div>
                </td>
                <td>
                  <div className="skeleton-bar"></div>
                </td>
                <td>
                  <div className="skeleton-bar"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default AdminDashboard;

import React from "react";

const PatientList = () => {
  return (
    <div>
      <div className="search-bar-header">
        <h2 className="page-title">Patient List</h2>
        <input type="text" placeholder="Search..." className="search-input" />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Last Visit Date</th>
              <th>Next Appointment</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i}>
                <td>
                  <div
                    className="skeleton-bar"
                    style={{
                      height: "15px",
                      background: "#64748b",
                      width: "60%",
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
export default PatientList;

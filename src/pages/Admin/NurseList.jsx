import React from "react";

const NurseList = () => {
  return (
    <div>
      <div className="search-bar-header">
        <h2 className="page-title">Nurse List</h2>
        <input type="text" placeholder="Search..." className="search-input" />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Assigned Doctor</th>
              <th>Availability Status</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4].map((i) => (
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
export default NurseList;

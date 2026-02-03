import React, { useState, useEffect } from "react";

const DoctorPatientList = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [appointmentDates, setAppointmentDates] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch("http://localhost:5001/patients");
      const data = await response.json();
      console.log("All patients data:", data); // DEBUG - show all patient data
      setPatients(data);

      // Fetch appointment dates for each patient
      const appointmentMap = {};
      for (const patient of data) {
        try {
          const appointmentResponse = await fetch(
            `http://localhost:5001/appointments/${patient.patient_id}`
          );
          console.log(`Response status for patient ${patient.patient_id}:`, appointmentResponse.status); // DEBUG
          if (appointmentResponse.ok) {
            const appointmentInfo = await appointmentResponse.json();
            console.log(`Appointment for ${patient.name} (ID: ${patient.patient_id}):`, appointmentInfo); // DEBUG
            if (appointmentInfo) {
              appointmentMap[patient.patient_id] = appointmentInfo;
            }
          } else {
            console.log(`Response NOT ok for patient ${patient.patient_id}`); // DEBUG
          }
        } catch (err) {
          console.error(`Error fetching appointment for patient ${patient.patient_id}:`, err);
        }
      }
      console.log("Final appointmentMap:", appointmentMap); // DEBUG
      setAppointmentDates(appointmentMap);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching patients:", err);
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      style={{
        padding: "30px",
        fontFamily: "Inter, sans-serif",
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", margin: 0 }}>
          Patient List
        </h1>
        <input
          type="text"
          placeholder="Search patient..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "10px 15px",
            fontSize: "1rem",
            borderRadius: "6px",
            border: "1px solid #e2e8f0",
            width: "250px",
          }}
        />
      </div>

      {/* TABLE */}
      <div
        style={{
          background: "white",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#e2e2e2", color: "#333", textAlign: "left" }}>
              <th style={{ padding: "15px" }}>Name</th>
              <th style={{ padding: "15px" }}>Appointment Date</th>
              <th style={{ padding: "15px" }}>Prescription</th>
              <th style={{ padding: "15px" }}>Diagnosis</th>
              <th style={{ padding: "15px" }}>Allergies</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ padding: "20px", textAlign: "center" }}>
                  Loading...
                </td>
              </tr>
            ) : filteredPatients.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>
                  No patients found.
                </td>
              </tr>
            ) : (
              filteredPatients.map((patient) => {
                const appointmentInfo = appointmentDates[patient.patient_id];
                const appointmentDate = appointmentInfo?.appointment_date
                  ? new Date(appointmentInfo.appointment_date).toLocaleDateString()
                  : "—";

                return (
                  <tr key={patient.patient_id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "15px", fontWeight: "600" }}>
                      <button
                        onClick={() => console.log(`Clicked patient: ${patient.name}`)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#0284c7",
                          cursor: "pointer",
                          textDecoration: "underline",
                          fontSize: "1rem",
                          fontWeight: "600",
                        }}
                      >
                        {patient.name}
                      </button>
                    </td>
                    <td style={{ padding: "15px", color: "#64748b" }}>
                      {appointmentDate}
                    </td>
                    <td style={{ padding: "15px", color: "#0284c7" }}>
                      {patient.prescription || "—"}
                    </td>
                    <td style={{ padding: "15px", color: "#10b981" }}>
                      {patient.diagnosis || "—"}
                    </td>
                    <td style={{ padding: "15px" }}>
                      {patient.allergy && patient.allergy !== "" ? (
                        <span style={{ color: "#ef4444", fontWeight: "500" }}>
                          {patient.allergy}
                        </span>
                      ) : (
                        <span style={{ color: "#94a3b8" }}>None</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DoctorPatientList;

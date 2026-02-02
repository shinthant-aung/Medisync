import React, { useState, useEffect } from "react";

const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // MODAL STATE
  const [activeModal, setActiveModal] = useState(null); // 'prescription' or 'diagnosis'
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [inputText, setInputText] = useState("");

  const fetchPatients = () => {
    setLoading(true);
    
    // Get doctor_id from localStorage
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    const doctor_id = user?.id;
    
    console.log("Doctor user object:", user);
    console.log("Doctor ID:", doctor_id);
    
    // If no doctor_id, show empty list
    if (!doctor_id) {
      console.log("No doctor_id found in localStorage");
      setPatients([]);
      setLoading(false);
      return;
    }
    
    const url = `http://localhost:5001/doctor/${doctor_id}/patients`;
    console.log("Fetching from URL:", url);
    
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        console.log("Patients data received:", data);
        // SAFETY CHECK: Ensure data is actually an array before using it
        if (Array.isArray(data)) {
          setPatients(data);
        } else {
          console.error("API Error:", data);
          setPatients([]); // Set empty list to prevent white screen
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Network Error:", err);
        setPatients([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // OPEN MODAL HANDLER
  const handleOpenModal = (patient, type) => {
    setSelectedPatient(patient);
    setActiveModal(type);
    setInputText("");
  };

  // SUBMIT HANDLER
  const handleSubmit = async () => {
    if (!inputText.trim()) return alert("Field cannot be empty.");

    // Determine URL based on modal type
    const url =
      activeModal === "prescription"
        ? "http://localhost:5001/doctor/prescription"
        : "http://localhost:5001/doctor/diagnosis";

    // Determine Body key ('prescription' or 'diagnosis')
    const bodyData = { patient_name: selectedPatient.name };
    bodyData[activeModal] = inputText;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      if (response.ok) {
        alert(
          `✅ ${
            activeModal === "prescription" ? "Prescription" : "Diagnosis"
          } added!`
        );
        setActiveModal(null);
        fetchPatients();
      } else {
        alert("❌ Failed to save.");
      }
    } catch (err) {
      console.error(err);
      alert("Server Error");
    }
  };

  // Filter Logic (Safe Check)
  const filteredPatients = Array.isArray(patients)
    ? patients.filter(
        (p) =>
          p.name &&
          p.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ fontSize: "2rem", fontWeight: "bold", color: "#111827" }}>
          Patient List
        </h2>
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Search patient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "10px 40px 10px 15px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              width: "300px",
              outline: "none",
            }}
          />
          <span
            style={{
              position: "absolute",
              right: "15px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
            }}
          >
            🔍
          </span>
        </div>
      </div>

      {/* TABLE */}
      <div
        style={{
          background: "white",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                background: "#f3f4f6",
                textAlign: "left",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <th
                style={{
                  padding: "15px 20px",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Name
              </th>
              <th
                style={{
                  padding: "15px 20px",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Prescription
              </th>
              <th
                style={{
                  padding: "15px 20px",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Diagnosis
              </th>
              <th
                style={{
                  padding: "15px 20px",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Allergies
              </th>
              <th
                style={{
                  padding: "15px 20px",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Next Appointment
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="5"
                  style={{ textAlign: "center", padding: "30px" }}
                >
                  Loading...
                </td>
              </tr>
            ) : filteredPatients.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  style={{ textAlign: "center", padding: "30px" }}
                >
                  No patients found.
                </td>
              </tr>
            ) : (
              filteredPatients.map((patient) => (
                <tr
                  key={patient.id}
                  style={{ borderBottom: "1px solid #f3f4f6" }}
                >
                  <td
                    style={{
                      padding: "15px 20px",
                      fontWeight: "600",
                      color: "#111827",
                    }}
                  >
                    {patient.name}
                  </td>

                  {/* PRESCRIPTION */}
                  <td style={{ padding: "15px 20px" }}>
                    {patient.latest_prescription ? (
                      <span style={{ color: "#4b5563" }}>
                        {patient.latest_prescription}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleOpenModal(patient, "prescription")}
                        style={addBtnStyle}
                      >
                        + Add Prescription
                      </button>
                    )}
                  </td>

                  {/* DIAGNOSIS */}
                  <td style={{ padding: "15px 20px" }}>
                    {patient.latest_diagnosis ? (
                      <span style={{ color: "#059669", fontWeight: "500" }}>
                        {patient.latest_diagnosis}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleOpenModal(patient, "diagnosis")}
                        style={addBtnStyle}
                      >
                        + Add Diagnosis
                      </button>
                    )}
                  </td>

                  <td
                    style={{
                      padding: "15px 20px",
                      color: patient.allergies ? "#dc2626" : "#6b7280",
                    }}
                  >
                    {patient.allergies || "None"}
                  </td>
                  <td style={{ padding: "15px 20px", color: "#4b5563" }}>
                    {patient.next_appointment
                      ? patient.next_appointment.split("T")[0]
                      : "None"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- SHARED MODAL --- */}
      {activeModal && selectedPatient && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "8px",
              width: "500px",
            }}
          >
            <h3 style={{ marginBottom: "15px" }}>
              Add{" "}
              {activeModal === "prescription" ? "Prescription" : "Diagnosis"}{" "}
              for{" "}
              <span style={{ color: "#2563eb" }}>
                {selectedPatient.name}
              </span>
            </h3>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Enter ${activeModal} details...`}
              style={{
                width: "100%",
                height: "100px",
                padding: "10px",
                marginBottom: "20px",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                onClick={() => setActiveModal(null)}
                style={{
                  padding: "8px 16px",
                  border: "1px solid #cbd5e1",
                  background: "white",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                style={{
                  padding: "8px 16px",
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const addBtnStyle = {
  background: "#eff6ff",
  color: "#2563eb",
  border: "1px solid #bfdbfe",
  padding: "6px 12px",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "0.85rem",
};

export default DoctorPatients;

import React, { useState, useEffect } from "react";

const NurseMedicine = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // MODAL STATE
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    diagnosis_relevant: "",
    patient_safety: "",
    qty: "",
  });

  // 1. Fetch Medicines
  const fetchMedicines = () => {
    fetch("http://localhost:5001/medicines")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMedicines(data);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  // 2. Handle Quantity Update (+ / -)
  const updateQty = async (id, currentQty, change) => {
    const newQty = parseInt(currentQty) + change;
    if (newQty < 0) return;

    try {
      const response = await fetch(`http://localhost:5001/medicines/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qty: newQty.toString() }),
      });

      if (response.ok) {
        fetchMedicines();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Handle Remove Medicine (NEW)
  const handleRemove = async (id) => {
    if (!window.confirm("Are you sure you want to delete this medicine?"))
      return;

    try {
      const response = await fetch(`http://localhost:5001/medicines/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // alert("✅ Medicine Removed"); // Optional alert
        fetchMedicines(); // Refresh list immediately
      } else {
        alert("❌ Failed to delete");
      }
    } catch (err) {
      console.error(err);
      alert("Server Error");
    }
  };

  // 4. Handle Form Input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 5. Submit New Medicine
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5001/medicines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("✅ Medicine Added!");
        setShowModal(false);
        setFormData({
          name: "",
          diagnosis_relevant: "",
          patient_safety: "",
          qty: "",
        });
        fetchMedicines();
      } else {
        alert("❌ Failed to add.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredMedicines = medicines.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h2
          style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#111827" }}
        >
          Medicine Inventory
        </h2>

        <div style={{ display: "flex", gap: "15px" }}>
          <button
            onClick={() => setShowModal(true)}
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            + Add Medicine
          </button>

          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Search medicine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: "10px 40px 10px 15px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                width: "250px",
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
                background: "#d1d5db",
                textAlign: "left",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <th style={{ padding: "15px", width: "20%" }}>Name</th>
              <th style={{ padding: "15px", width: "25%" }}>
                Diagnosis & Treatment Relevant
              </th>
              <th style={{ padding: "15px", width: "25%" }}>
                Patient-Safety Information
              </th>
              <th style={{ padding: "15px", width: "20%" }}>Qty</th>
              <th
                style={{ padding: "15px", width: "10%", textAlign: "center" }}
              >
                Action
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
            ) : filteredMedicines.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  style={{ textAlign: "center", padding: "30px" }}
                >
                  No medicines found.
                </td>
              </tr>
            ) : (
              filteredMedicines.map((med) => (
                <tr key={med.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "15px", fontWeight: "600" }}>
                    {med.name}
                  </td>
                  <td style={{ padding: "15px", color: "#4b5563" }}>
                    {med.diagnosis_relevant}
                  </td>
                  <td style={{ padding: "15px", color: "#4b5563" }}>
                    {med.patient_safety}
                  </td>

                  {/* QTY */}
                  <td style={{ padding: "15px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <button
                        onClick={() => updateQty(med.id, med.qty, -1)}
                        style={qtyBtnStyle}
                      >
                        -
                      </button>
                      <span
                        style={{
                          fontWeight: "bold",
                          color:
                            parseInt(med.qty) === 0 ? "#dc2626" : "#111827",
                          minWidth: "80px",
                          textAlign: "center",
                        }}
                      >
                        {parseInt(med.qty) === 0 ? "Out of Stock" : med.qty}
                      </span>
                      <button
                        onClick={() => updateQty(med.id, med.qty, 1)}
                        style={qtyBtnStyle}
                      >
                        +
                      </button>
                    </div>
                  </td>

                  {/* REMOVE BUTTON (NEW) */}
                  <td style={{ padding: "15px", textAlign: "center" }}>
                    <button
                      onClick={() => handleRemove(med.id)}
                      style={{
                        background: "#fee2e2",
                        color: "#dc2626",
                        border: "1px solid #fca5a5",
                        borderRadius: "6px",
                        padding: "8px 12px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "0.9rem",
                      }}
                      title="Remove Medicine"
                    >
                      remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- ADD MODAL --- */}
      {showModal && (
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
            <h2 style={{ marginBottom: "20px", textAlign: "center" }}>
              Add New Medicine
            </h2>
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="Medicine Name"
              />
              <input
                name="diagnosis_relevant"
                value={formData.diagnosis_relevant}
                onChange={handleChange}
                style={inputStyle}
                placeholder="Diagnosis Relevant"
              />
              <input
                name="patient_safety"
                value={formData.patient_safety}
                onChange={handleChange}
                style={inputStyle}
                placeholder="Safety Info"
              />
              <input
                name="qty"
                type="number"
                value={formData.qty}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="Quantity"
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "10px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "10px 20px",
                    border: "1px solid #ccc",
                    background: "white",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 20px",
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles
const inputStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "5px",
  border: "1px solid #ccc",
};
const qtyBtnStyle = {
  background: "#e5e7eb",
  border: "1px solid #d1d5db",
  borderRadius: "4px",
  width: "30px",
  height: "30px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "1.2rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export default NurseMedicine;

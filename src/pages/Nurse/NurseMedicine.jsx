import React, { useState, useEffect } from "react";

const NurseMedicine = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // MODAL STATE
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    medicine_name: "",
    stock_quantity: "",
    expiry_date: "",
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
        body: JSON.stringify({ stock_quantity: newQty.toString() }),
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

  // 4. Submit New Medicine
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
          medicine_name: "",
          stock_quantity: "",
          expiry_date: "",
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
    m.medicine_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "20px" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#1e293b", margin: 0 }}>
            Medicine Inventory
          </h1>
          <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
            {/* Search Bar */}
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search medicine..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: "10px 40px 10px 15px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "14px",
                  outline: "none",
                  width: "280px",
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

            {/* Add Button */}
            <button
              onClick={() => setShowModal(true)}
              style={{
                background: "#0284c7",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "8px",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "background 0.2s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => (e.target.style.background = "#0369a1")}
              onMouseLeave={(e) => (e.target.style.background = "#0284c7")}
            >
              + Add Medicine
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div
          style={{
            background: "white",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            overflow: "hidden",
          }}
        >
          {filteredMedicines.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center" }}>
              <p style={{ color: "#94a3b8", fontSize: "15px" }}>
                {searchTerm ? "No medicines found" : "No medicines registered yet"}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "14px",
                }}
              >
                <thead>
                  <tr style={{ background: "#f1f5f9", borderBottom: "1px solid #e2e8f0" }}>
                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", color: "#475569" }}>
                      Medicine Name
                    </th>
                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", color: "#475569" }}>
                      Stock Quantity
                    </th>
                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", color: "#475569" }}>
                      Expiry Date
                    </th>
                    <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", color: "#475569" }}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan="4"
                        style={{
                          padding: "40px",
                          textAlign: "center",
                          color: "#94a3b8",
                        }}
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : (
                    filteredMedicines.map((med, idx) => (
                      <tr
                        key={med.medicine_id}
                        style={{
                          borderBottom: "1px solid #e2e8f0",
                          background: idx % 2 === 0 ? "#ffffff" : "#f8fafc",
                          transition: "background 0.2s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = idx % 2 === 0 ? "#ffffff" : "#f8fafc")
                        }
                      >
                        <td style={{ padding: "16px", color: "#1e293b", fontWeight: "500" }}>
                          {med.medicine_name}
                        </td>
                        <td style={{ padding: "16px", color: "#64748b" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <button
                              onClick={() => updateQty(med.medicine_id, med.stock_quantity, -1)}
                              style={{
                                background: "#e2e8f0",
                                border: "1px solid #cbd5e1",
                                borderRadius: "4px",
                                width: "28px",
                                height: "28px",
                                cursor: "pointer",
                                fontWeight: "bold",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              −
                            </button>
                            <span
                              style={{
                                fontWeight: "600",
                                color:
                                  parseInt(med.stock_quantity) === 0 ? "#dc2626" : "#1e293b",
                                minWidth: "60px",
                                textAlign: "center",
                              }}
                            >
                              {parseInt(med.stock_quantity) === 0 ? "Out" : med.stock_quantity}
                            </span>
                            <button
                              onClick={() => updateQty(med.medicine_id, med.stock_quantity, 1)}
                              style={{
                                background: "#e2e8f0",
                                border: "1px solid #cbd5e1",
                                borderRadius: "4px",
                                width: "28px",
                                height: "28px",
                                cursor: "pointer",
                                fontWeight: "bold",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td style={{ padding: "16px", color: "#64748b" }}>
                          {med.expiry_date
                            ? new Date(med.expiry_date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "-"}
                        </td>
                        <td style={{ padding: "16px" }}>
                          <button
                            onClick={() => handleRemove(med.medicine_id)}
                            style={{
                              backgroundColor: "#fee2e2",
                              color: "#dc2626",
                              border: "1px solid #fecaca",
                              padding: "6px 12px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "0.85rem",
                              fontWeight: "600",
                              transition: "background 0.2s",
                            }}
                            onMouseEnter={(e) => (e.target.style.backgroundColor = "#fecaca")}
                            onMouseLeave={(e) => (e.target.style.backgroundColor = "#fee2e2")}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODAL */}
        {showModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
            onClick={() => setShowModal(false)}
          >
            <div
              style={{
                background: "white",
                padding: "30px",
                borderRadius: "8px",
                maxWidth: "500px",
                width: "100%",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                position: "relative",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* CLOSE BUTTON */}
              <button
                onClick={() => setShowModal(false)}
                style={{
                  position: "absolute",
                  top: "15px",
                  right: "15px",
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#94a3b8",
                  padding: "0",
                  width: "30px",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>

              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#1e293b",
                  marginBottom: "20px",
                  marginTop: 0,
                }}
              >
                Add New Medicine
              </h3>

              <form
                onSubmit={handleSubmit}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "15px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#475569",
                      marginBottom: "6px",
                    }}
                  >
                    Medicine Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter medicine name"
                    value={formData.medicine_name}
                    onChange={(e) =>
                      setFormData({ ...formData, medicine_name: e.target.value })
                    }
                    required
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#475569",
                      marginBottom: "6px",
                    }}
                  >
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    placeholder="Enter stock quantity"
                    value={formData.stock_quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, stock_quantity: e.target.value })
                    }
                    required
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#475569",
                      marginBottom: "6px",
                    }}
                  >
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) =>
                      setFormData({ ...formData, expiry_date: e.target.value })
                    }
                    required
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      background: "#0284c7",
                      color: "white",
                      border: "none",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      fontWeight: "600",
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.background = "#0369a1")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.background = "#0284c7")
                    }
                  >
                    Add Medicine
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{
                      flex: 1,
                      background: "#f1f5f9",
                      color: "#475569",
                      border: "1px solid #e2e8f0",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      fontWeight: "600",
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#e2e8f0")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "#f1f5f9")
                    }
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NurseMedicine;

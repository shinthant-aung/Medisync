import React, { useState, useEffect } from "react";

const DiseaseTrend = () => {
  const [diseaseData, setDiseaseData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5001/disease-trends")
      .then((res) => res.json())
      .then((data) => {
        // Consolidate diseases with the same name (case-insensitive)
        const consolidated = {};
        data.forEach((disease) => {
          const key = disease.diagnosis.toLowerCase().trim();
          if (consolidated[key]) {
            consolidated[key].count += parseInt(disease.count, 10);
          } else {
            consolidated[key] = {
              diagnosis: disease.diagnosis,
              count: parseInt(disease.count, 10),
            };
          }
        });
        
        // Convert back to array and sort by count
        const consolidated_array = Object.values(consolidated)
          .sort((a, b) => b.count - a.count);
        
        setDiseaseData(consolidated_array);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching disease trends:", err);
        setDiseaseData([]);
        setLoading(false);
      });
  }, []);

  const total = diseaseData.reduce((sum, d) => sum + parseInt(d.count, 10), 0);
  const colors = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
  ];

  const drawPieChart = () => {
    if (diseaseData.length === 0) return null;

    // If only one disease, draw a full circle
    if (diseaseData.length === 1) {
      return (
        <svg width="250" height="250" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r="80"
            fill={colors[0]}
            stroke="white"
            strokeWidth="2"
          />
        </svg>
      );
    }

    let currentAngle = 0;
    const slices = diseaseData.map((disease, index) => {
      const sliceAngle = (disease.count / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;

      const radius = 80;
      const centerX = 100;
      const centerY = 100;

      const startX =
        centerX +
        radius * Math.cos(((startAngle - 90) * Math.PI) / 180);
      const startY =
        centerY +
        radius * Math.sin(((startAngle - 90) * Math.PI) / 180);
      const endX =
        centerX +
        radius * Math.cos(((endAngle - 90) * Math.PI) / 180);
      const endY =
        centerY +
        radius * Math.sin(((endAngle - 90) * Math.PI) / 180);

      const largeArc = sliceAngle > 180 ? 1 : 0;

      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${startX} ${startY}`,
        `A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`,
        "Z",
      ].join(" ");

      currentAngle = endAngle;

      return (
        <path
          key={index}
          d={pathData}
          fill={colors[index % colors.length]}
          stroke="white"
          strokeWidth="2"
        />
      );
    });

    return (
      <svg width="250" height="250" viewBox="0 0 200 200">
        {slices}
      </svg>
    );
  };

  const getDiseasePercentage = (count) => {
    return total > 0 ? (((parseInt(count, 10)) / total) * 100).toFixed(1) : 0;
  };

  const mostCommon = diseaseData.length > 0 ? diseaseData[0] : null;

  return (
    <div style={{ padding: "30px", background: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: "40px" }}>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: "700",
            color: "#1e293b",
            margin: "0 0 10px 0",
          }}
        >
          📊 Disease Trend Monitor
        </h1>
        <p style={{ color: "#64748b", fontSize: "1rem", margin: 0 }}>
          Track and analyze disease patterns across all medical records
        </p>
      </div>

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <p style={{ fontSize: "1.1rem", color: "#64748b" }}>
            Loading disease trends...
          </p>
        </div>
      ) : diseaseData.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <p style={{ fontSize: "1.1rem", color: "#64748b" }}>
            No disease records found.
          </p>
        </div>
      ) : (
        <div>
          {/* Key Metrics */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
              marginBottom: "30px",
            }}
          >
            <div
              style={{
                background: "white",
                padding: "20px",
                borderRadius: "12px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <p style={{ color: "#64748b", fontSize: "0.9rem", margin: "0 0 10px 0" }}>
                Total Cases
              </p>
              <p
                style={{
                  fontSize: "2rem",
                  fontWeight: "700",
                  color: "#1e293b",
                  margin: 0,
                }}
              >
                {total}
              </p>
            </div>

            <div
              style={{
                background: "white",
                padding: "20px",
                borderRadius: "12px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <p style={{ color: "#64748b", fontSize: "0.9rem", margin: "0 0 10px 0" }}>
                Unique Diseases
              </p>
              <p
                style={{
                  fontSize: "2rem",
                  fontWeight: "700",
                  color: "#1e293b",
                  margin: 0,
                }}
              >
                {diseaseData.length}
              </p>
            </div>

            {mostCommon && (
              <div
                style={{
                  background: "white",
                  padding: "20px",
                  borderRadius: "12px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <p style={{ color: "#64748b", fontSize: "0.9rem", margin: "0 0 10px 0" }}>
                  Most Common
                </p>
                <p
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: "700",
                    color: "#3b82f6",
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {mostCommon.diagnosis}
                </p>
              </div>
            )}
          </div>

          {/* Charts Section */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "30px",
              marginBottom: "30px",
            }}
          >
            {/* Pie Chart */}
            <div
              style={{
                background: "white",
                padding: "30px",
                borderRadius: "12px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <h3 style={{ color: "#1e293b", marginTop: 0, marginBottom: "20px" }}>
                Disease Distribution
              </h3>
              <div style={{ marginBottom: "20px" }}>
                {drawPieChart()}
              </div>
            </div>

            {/* Legend & Statistics */}
            <div
              style={{
                background: "white",
                padding: "30px",
                borderRadius: "12px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <h3 style={{ color: "#1e293b", marginTop: 0, marginBottom: "20px" }}>
                Disease Breakdown
              </h3>
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {diseaseData.map((disease, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: "16px",
                      paddingBottom: "16px",
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "16px",
                            height: "16px",
                            backgroundColor: colors[index % colors.length],
                            borderRadius: "4px",
                          }}
                        ></div>
                        <span
                          style={{
                            fontWeight: "500",
                            color: "#1e293b",
                            fontSize: "0.95rem",
                          }}
                        >
                          {disease.diagnosis}
                        </span>
                      </div>
                      <span
                        style={{
                          fontWeight: "700",
                          color: colors[index % colors.length],
                          fontSize: "0.95rem",
                        }}
                      >
                        {disease.count}
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div
                      style={{
                        width: "100%",
                        height: "6px",
                        backgroundColor: "#e2e8f0",
                        borderRadius: "3px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${getDiseasePercentage(disease.count)}%`,
                          backgroundColor: colors[index % colors.length],
                          transition: "width 0.3s ease",
                        }}
                      ></div>
                    </div>
                    <p
                      style={{
                        fontSize: "0.85rem",
                        color: "#94a3b8",
                        margin: "6px 0 0 0",
                      }}
                    >
                      {getDiseasePercentage(disease.count)}% of total
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Diseases Bar Charts */}
          {diseaseData.slice(0, 3).length > 0 && (
            <div style={{ background: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <h3 style={{ color: "#1e293b", marginTop: 0, marginBottom: "30px" }}>
                Top Diseases
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                  gap: "20px",
                }}
              >
                {diseaseData.slice(0, 3).map((disease, index) => {
                  const maxCount = Math.max(...diseaseData.map((d) => d.count));
                  const percentage = (disease.count / maxCount) * 100;

                  return (
                    <div key={index}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "10px",
                        }}
                      >
                        <h4
                          style={{
                            margin: 0,
                            color: "#1e293b",
                            fontSize: "1rem",
                          }}
                        >
                          {disease.diagnosis}
                        </h4>
                        <span
                          style={{
                            fontWeight: "700",
                            color: colors[index % colors.length],
                          }}
                        >
                          {disease.count} case{disease.count !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div
                        style={{
                          width: "100%",
                          height: "30px",
                          backgroundColor: "#e2e8f0",
                          borderRadius: "6px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${percentage}%`,
                            backgroundColor: colors[index % colors.length],
                            transition: "width 0.3s ease",
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DiseaseTrend;

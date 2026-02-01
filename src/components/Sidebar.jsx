import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname.toLowerCase();

  // Determine Role based on the current URL
  const isNurse = path.includes("/nurse");
  const isDoctor = path.includes("/doctor");
  const isAdmin = path.includes("/admin");

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div
      style={{
        width: "260px",
        height: "100vh",
        background: "white",
        borderRight: "1px solid #e2e8f0",
        display: "flex",
        flexDirection: "column",
        padding: "20px",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* 1. TOP SECTION (Empty Space, Logo Removed) */}
      <div style={{ marginTop: "40px" }}></div>

      {/* 2. NAVIGATION MENU */}
      <nav
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {/* --- NURSE LINKS --- */}
        {isNurse && (
          <>
            <Link
              to="/nurse/dashboard"
              style={getLinkStyle(path === "/nurse/dashboard")}
            >
              <span style={{ fontSize: "1.2rem" }}>🏠</span> Dashboard
            </Link>
            <Link
              to="/nurse/checkin"
              style={getLinkStyle(path === "/nurse/checkin")}
            >
              <span style={{ fontSize: "1.2rem" }}>📝</span> Check In
            </Link>
            <Link
              to="/nurse/medicine"
              style={getLinkStyle(path === "/nurse/medicine")}
            >
              <span style={{ fontSize: "1.2rem" }}>💊</span> Medicine
            </Link>
          </>
        )}

        {/* --- DOCTOR LINKS --- */}
        {isDoctor && (
          <>
            <Link
              to="/doctor/dashboard"
              style={getLinkStyle(path.includes("/doctor/dashboard"))}
            >
              <span style={{ fontSize: "1.2rem" }}>🏠</span> Dashboard
            </Link>
            <Link
              to="/doctor/patients"
              style={getLinkStyle(path.includes("/doctor/patients"))}
            >
              <span style={{ fontSize: "1.2rem" }}>📋</span> My Patients
            </Link>
            <Link
              to="/disease-trend"
              style={getLinkStyle(path.includes("/disease"))}
            >
              <span style={{ fontSize: "1.2rem" }}>📈</span> Disease Trend
            </Link>
          </>
        )}

        {/* --- ADMIN LINKS --- */}
        {isAdmin && (
          <>
            <Link
              to="/admin/dashboard"
              style={getLinkStyle(path.includes("/admin/dashboard"))}
            >
              <span style={{ fontSize: "1.2rem" }}>📊</span> Dashboard
            </Link>
            <Link
              to="/admin/users"
              style={getLinkStyle(path.includes("/admin/users"))}
            >
              <span style={{ fontSize: "1.2rem" }}>👥</span> Users
            </Link>
            {/* Add other Admin links here if needed */}
          </>
        )}
      </nav>

      {/* 3. BOTTOM SECTION (Logout Only - Black Color) */}
      <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "20px" }}>
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            width: "100%",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "12px",
            borderRadius: "8px",
            color: "#000000", // Black Color
            fontWeight: "bold",
            fontSize: "1rem",
            transition: "background 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#f1f5f9")}
          onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
};

const getLinkStyle = (isActive) => ({
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "12px 15px",
  textDecoration: "none",
  color: isActive ? "#2563eb" : "#64748b",
  background: isActive ? "#eff6ff" : "transparent",
  borderRadius: "8px",
  fontWeight: isActive ? "600" : "500",
  fontSize: "1rem",
  transition: "all 0.2s ease",
});

export default Sidebar;

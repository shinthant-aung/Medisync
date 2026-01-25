import React, { useState } from "react";

// Import the Login Component
import Login from "./pages/Login/Login";

// Import the Layouts for each Role
import AdminLayout from "./pages/Admin/AdminLayout";
import DoctorLayout from "./pages/Doctor/DoctorLayout";
import NurseLayout from "./pages/Nurse/NurseLayout";

function App() {
  // State to track the current user role (null = not logged in)
  const [userRole, setUserRole] = useState(null);

  // Function to handle login: Sets the role based on what was selected in Login.jsx
  const handleLogin = (role) => {
    setUserRole(role);
  };

  // Function to handle logout: Clears the role to return to the Login screen
  const handleLogout = () => {
    setUserRole(null);
  };

  return (
    <div className="App">
      {/* 1. If no user is logged in, show the Login Page */}
      {!userRole && <Login onLogin={handleLogin} />}

      {/* 2. If Admin is logged in, show Admin Layout */}
      {userRole === "admin" && <AdminLayout onLogout={handleLogout} />}

      {/* 3. If Doctor is logged in, show Doctor Layout */}
      {userRole === "doctor" && <DoctorLayout onLogout={handleLogout} />}

      {/* 4. If Nurse is logged in, show Nurse Layout */}
      {userRole === "nurse" && <NurseLayout onLogout={handleLogout} />}
    </div>
  );
}

export default App;

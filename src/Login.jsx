import React, { useState } from 'react';
import './Login/Login.css';

const Login = () => {
  // State to track if a role is selected
  const [role, setRole] = useState(''); 
  
  // State for the login form inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Handler for role selection
  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  // Handler for form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`Logging in as ${role} with username: ${username}`);
    alert(`This is where we connect to Node.js later.\nRole: ${role}\nUser: ${username}`);
  };

  return (
    <div className="login-container">
      {/* Logo Section */}
      <div className="logo-circle">Logo</div>
      <h2>MediSync</h2>
      <p className="subtitle">Sign in to access your dashboard</p>
      
      {!role ? (
        /* STEP 1: SELECT ROLE VIEW */
        <div className="step-role">
          <div className="form-group">
            <label>Select Your Role</label>
            <select 
              value={role} 
              onChange={handleRoleChange} 
              className="role-select"
            >
              <option value="" disabled>Choose Role</option>
              <option value="doctor">Doctor</option>
              <option value="nurse">Nurse</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      ) : (
        /* STEP 2: LOGIN FORM VIEW */
        <form className="step-login" onSubmit={handleSubmit}>
          <h3>Log In ({role.charAt(0).toUpperCase() + role.slice(1)})</h3>
          
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="options-row">
            <label>
              <input type="checkbox" /> Remember me
            </label>
            <a href="#forgot">Forgot Password?</a>
          </div>

          <button type="submit" className="primary-btn">Log In</button>
          
          {/* Button to go back and change role */}
          <div className="back-link" onClick={() => setRole('')}>
            ← Change Role
          </div>
        </form>
      )}
    </div>
  );
};

export default Login;
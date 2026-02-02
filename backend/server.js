// backend/server.js
const express = require("express");
const cors = require("cors");
const pool = require("./db"); // Import the database connection

const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());

// ==========================================
// DEBUG: Test Database Connection
// ==========================================
app.get("/debug/test", async (req, res) => {
  try {
    const result = await pool.query("SELECT 1");
    res.json({ status: "Connected to database", result: result.rows });
  } catch (err) {
    console.error("Database connection error:", err.message);
    res.status(500).json({ error: "Database connection failed", details: err.message });
  }
});

// ==========================================
// DEBUG: Check what's in the admin/doctor/nurse tables
// ==========================================
app.get("/debug/users", async (req, res) => {
  try {
    const admins = await pool.query("SELECT admin_id, name, email FROM admin");
    const doctors = await pool.query("SELECT doctor_id, name, email FROM doctor");
    const nurses = await pool.query("SELECT nurse_id, name, email FROM nurse");

    res.json({
      admins: admins.rows,
      doctors: doctors.rows,
      nurses: nurses.rows,
    });
  } catch (err) {
    console.error("Debug error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 1. GET ADMIN DASHBOARD STATS (FIXED DOCTOR COUNT)
// ==========================================
app.get("/admin/dashboard", async (req, res) => {
  try {
    const patients = await pool.query("SELECT COUNT(*) FROM patient");

    // Count all doctors
    const doctors = await pool.query(
      "SELECT COUNT(*) FROM doctor"
    );

    // Count all nurses
    const nurses = await pool.query(
      "SELECT COUNT(*) FROM nurse"
    );

    res.json({
      total_patients: parseInt(patients.rows[0].count, 10) || 0,
      active_doctors: parseInt(doctors.rows[0].count, 10) || 0,
      active_nurses: parseInt(nurses.rows[0].count, 10) || 0,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ==========================================
// 2. LOGIN ROUTE (Using Email)
// ==========================================
app.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    console.log(`Login attempt: email=${email}, role=${role}`);

    let result;

    // Query the appropriate table based on role
    if (role === "admin") {
      console.log("Querying admin table...");
      result = await pool.query(
        "SELECT admin_id as id, name as full_name, email, password FROM admin WHERE email = $1",
        [email]
      );

      console.log(`Admin query result: ${result.rows.length} rows found`);

      if (result.rows.length === 0) {
        return res
          .status(401)
          .json({ success: false, message: "Email not found in admin table" });
      }

      const user = result.rows[0];
      console.log(`Admin found: ${user.full_name}`);

      // Check password for admin
      if (password === user.password) {
        console.log("Admin password correct!");
        res.json({
          success: true,
          user: {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
          },
        });
      } else {
        console.log("Admin password incorrect!");
        res.status(401).json({ success: false, message: "Wrong password" });
      }
    } else if (role === "doctor") {
      console.log("Querying doctor table...");
      result = await pool.query(
        "SELECT doctor_id as id, name as full_name, email, password FROM doctor WHERE email = $1",
        [email]
      );

      console.log(`Doctor query result: ${result.rows.length} rows found`);

      if (result.rows.length === 0) {
        return res
          .status(401)
          .json({ success: false, message: "Email not found in doctor table" });
      }

      const user = result.rows[0];
      console.log(`Doctor found: ${user.full_name}`);
      
      // Check password for doctor
      if (password === user.password) {
        console.log("Doctor password correct!");
        res.json({
          success: true,
          user: {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
          },
        });
      } else {
        console.log("Doctor password incorrect!");
        res.status(401).json({ success: false, message: "Wrong password" });
      }
    } else if (role === "nurse") {
      console.log("Querying nurse table...");
      result = await pool.query(
        "SELECT nurse_id as id, name as full_name, email, password FROM nurse WHERE email = $1",
        [email]
      );

      console.log(`Nurse query result: ${result.rows.length} rows found`);

      if (result.rows.length === 0) {
        return res
          .status(401)
          .json({ success: false, message: "Email not found in nurse table" });
      }

      const user = result.rows[0];
      console.log(`Nurse found: ${user.full_name}`);
      
      // Check password for nurse
      if (password === user.password) {
        console.log("Nurse password correct!");
        res.json({
          success: true,
          user: {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
          },
        });
      } else {
        console.log("Nurse password incorrect!");
        res.status(401).json({ success: false, message: "Wrong password" });
      }
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid role" });
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ==========================================
// 3. GET PATIENTS
// ==========================================
app.get("/patients", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM patient ORDER BY patient_id ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ==========================================
// 3.5 GET DOCTOR'S PATIENTS (Only patients assigned to specific doctor)
// ==========================================
app.get("/doctor/:doctor_id/patients", async (req, res) => {
  try {
    const { doctor_id } = req.params;
    
    console.log(`Fetching patients for doctor_id: ${doctor_id}`);
    
    // Get distinct patients who have appointments with this doctor
    const result = await pool.query(`
      SELECT DISTINCT p.* 
      FROM patient p
      INNER JOIN appointment a ON p.patient_id = a.patient_id
      WHERE a.doctor_id = $1
      ORDER BY p.patient_id ASC
    `, [doctor_id]);
    
    console.log(`Found ${result.rows.length} patients for doctor ${doctor_id}`);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching doctor patients:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ==========================================
// 4. GET DOCTORS
// ==========================================
app.get("/doctors", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM doctor ORDER BY doctor_id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ==========================================
// 5. GET NURSES
// ==========================================
app.get("/nurses", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM nurse ORDER BY nurse_id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ==========================================
// 6. ADD NEW PATIENT
// ==========================================
app.post("/patients", async (req, res) => {
  try {
    const { name, gender, date_of_birth, phone, address } = req.body;

    const newPatient = await pool.query(
      `INSERT INTO patient 
        (name, gender, date_of_birth, phone, address) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *`,
      [name, gender, date_of_birth, phone, address]
    );

    res.json(newPatient.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ==========================================
// 7. RECORD VITALS
// ==========================================
app.post("/vitals", async (req, res) => {
  try {
    const {
      patient_name,
      blood_pressure,
      temperature,
      heart_rate,
      height,
      weight,
      spo2,
    } = req.body;

    // Get patient_id from patient name
    const patientResult = await pool.query(
      "SELECT patient_id FROM patient WHERE name = $1",
      [patient_name]
    );

    if (patientResult.rows.length === 0) {
      return res.status(400).json({ error: "Patient not found" });
    }

    const patient_id = patientResult.rows[0].patient_id;
    
    // Get nurse_id (using default 1 for now, TODO: Get from session/token)
    const nurse_id = 1;

    const newRecord = await pool.query(
      `INSERT INTO vital_signs 
        (patient_id, nurse_id, blood_pressure, temperature, heart_rate, height, weight, spo2, recorded_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP) RETURNING *`,
      [
        patient_id,
        nurse_id,
        blood_pressure,
        temperature,
        heart_rate,
        height || null,
        weight || null,
        spo2 || null,
      ]
    );

    // Update appointment status to 'Checked In'
    await pool.query(
      `UPDATE appointment 
       SET status = 'Checked In' 
       WHERE patient_id = $1 AND status = 'Scheduled'`,
      [patient_id]
    );

    res.json({ success: true, record: newRecord.rows[0] });
  } catch (err) {
    console.error("Error saving vitals:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ==========================================
// 7.5 GET VITALS FOR A PATIENT
// ==========================================
app.get("/vitals/:patient_name", async (req, res) => {
  try {
    const { patient_name } = req.params;
    
    // Get patient_id from patient name
    const patientResult = await pool.query(
      "SELECT patient_id FROM patient WHERE name = $1",
      [patient_name]
    );
    
    if (patientResult.rows.length === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }
    
    const patient_id = patientResult.rows[0].patient_id;
    
    // Get latest vital record for the patient
    const result = await pool.query(
      "SELECT * FROM vital_signs WHERE patient_id = $1 ORDER BY vital_id DESC LIMIT 1",
      [patient_id]
    );

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: "No vitals found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================================
// 8. GET APPOINTMENTS
// ==========================================
app.get("/appointments", async (req, res) => {
  try {
    const { doctor_name } = req.query;
    let query = `
      SELECT 
        a.appointment_id,
        a.patient_id,
        a.doctor_id,
        a.appointment_date,
        a.appointment_time,
        a.status,
        p.name as patient_name,
        d.name as doctor_name
      FROM appointment a
      LEFT JOIN patient p ON a.patient_id = p.patient_id
      LEFT JOIN doctor d ON a.doctor_id = d.doctor_id
    `;
    let params = [];

    if (doctor_name) {
      query += " WHERE d.name = $1";
      params.push(doctor_name);
    }

    query += " ORDER BY a.appointment_date, a.appointment_time ASC";
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================================
// 9. GET MEDICINES
// ==========================================
app.get("/medicines", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM medicine ORDER BY medicine_name ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ==========================================
// 10. DASHBOARD STATS (General)
// ==========================================
app.get("/stats", async (req, res) => {
  try {
    const pCount = await pool.query("SELECT COUNT(*) FROM patient");
    const dCount = await pool.query("SELECT COUNT(*) FROM doctor");
    const aCount = await pool.query("SELECT COUNT(*) FROM appointment");

    res.json({
      patients: pCount.rows[0].count,
      doctors: dCount.rows[0].count,
      appointments: aCount.rows[0].count,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================================
// 11. ADD NEW DOCTOR
// ==========================================
app.post("/doctors", async (req, res) => {
  try {
    const { name, email, specialization, phone, password } = req.body;
    const admin_id = 1; // Default admin for new doctors
    
    const newDoctor = await pool.query(
      "INSERT INTO doctor (name, email, specialization, phone, password, admin_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [name, email, specialization, phone, password || "password", admin_id]
    );
    res.json(newDoctor.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ==========================================
// 12. ADD NEW NURSE
// ==========================================
app.post("/nurses", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const admin_id = 1; // Default admin for new nurses
    
    const newNurse = await pool.query(
      "INSERT INTO nurse (name, email, phone, password, admin_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, email, phone, password || "password", admin_id]
    );
    res.json(newNurse.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ==========================================
// 13. DELETE DOCTOR
// ==========================================
app.delete("/doctors/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT email FROM doctor WHERE doctor_id = $1", [
      id,
    ]);
    if (result.rows.length > 0) {
      // Delete related records first (cascade delete)
      await pool.query("DELETE FROM medical_record WHERE doctor_id = $1", [id]);
      await pool.query("DELETE FROM appointment WHERE doctor_id = $1", [id]);
      // Now delete the doctor
      await pool.query("DELETE FROM doctor WHERE doctor_id = $1", [id]);
      res.json({ success: true, message: "Doctor account deleted successfully" });
    } else {
      res.status(404).json({ error: "Doctor not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ==========================================
// 14. DELETE NURSE
// ==========================================
app.delete("/nurses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT email FROM nurse WHERE nurse_id = $1", [
      id,
    ]);
    if (result.rows.length > 0) {
      // Delete related vital signs records first
      await pool.query("DELETE FROM vital_signs WHERE nurse_id = $1", [id]);
      // Now delete the nurse
      await pool.query("DELETE FROM nurse WHERE nurse_id = $1", [id]);
      res.json({ success: true, message: "Nurse account deleted successfully" });
    } else {
      res.status(404).json({ error: "Nurse not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ==========================================
// 15. CREATE APPOINTMENT
// ==========================================
app.post("/appointments", async (req, res) => {
  try {
    const {
      patient_name,
      doctor_name,
      appointment_date,
      appointment_time,
    } = req.body;

    // Get patient_id from patient name
    const patientResult = await pool.query(
      "SELECT patient_id FROM patient WHERE name = $1",
      [patient_name]
    );

    if (patientResult.rows.length === 0) {
      return res.status(400).json({ error: "Patient not found" });
    }

    const patient_id = patientResult.rows[0].patient_id;

    // Get doctor_id from doctor name
    const doctorResult = await pool.query(
      "SELECT doctor_id FROM doctor WHERE name = $1",
      [doctor_name]
    );

    if (doctorResult.rows.length === 0) {
      return res.status(400).json({ error: "Doctor not found" });
    }

    const doctor_id = doctorResult.rows[0].doctor_id;

    // Get current admin_id (assuming it's 1 or we can get it from session)
    const admin_id = 1; // TODO: Get from session/token

    const newAppt = await pool.query(
      "INSERT INTO appointment (patient_id, doctor_id, appointment_date, appointment_time, status, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [
        patient_id,
        doctor_id,
        appointment_date,
        appointment_time,
        "Scheduled",
        admin_id,
      ]
    );
    res.json(newAppt.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ==========================================
// 16. DELETE PATIENT
// ==========================================
app.delete("/patients/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const patientResult = await pool.query(
      "SELECT name FROM patient WHERE patient_id = $1",
      [id]
    );

    if (patientResult.rows.length > 0) {
      // Delete related records first (cascade delete)
      await pool.query("DELETE FROM vital_signs WHERE patient_id = $1", [id]);
      await pool.query("DELETE FROM medical_record WHERE patient_id = $1", [id]);
      await pool.query("DELETE FROM appointment WHERE patient_id = $1", [id]);
      // Now delete the patient
      await pool.query("DELETE FROM patient WHERE patient_id = $1", [id]);
      res.json({ success: true, message: "Patient deleted successfully" });
    } else {
      res.status(404).json({ error: "Patient not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ==========================================
// 17. UPDATE DOCTOR STATUS
// ==========================================
app.put("/doctor/status", async (req, res) => {
  try {
    const { full_name, status } = req.body;
    // Status is not persisted in database, just return success
    res.json({ message: "Status updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================================
// 18. GET DOCTOR STATUS
// ==========================================
app.get("/doctor/status", async (req, res) => {
  try {
    const { full_name } = req.query;
    // Status is not stored in database, return default
    res.json({ status: "Available" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================================
// 19. GET NURSE DASHBOARD DATA
// ==========================================
app.get("/nurse/dashboard", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        mr.record_id as id,
        p.name as patient_name,
        mr.treatment as prescriptions,
        d.name as doctor_name,
        a.appointment_time,
        a.appointment_date
      FROM medical_record mr
      LEFT JOIN patient p ON mr.patient_id = p.patient_id
      LEFT JOIN doctor d ON mr.doctor_id = d.doctor_id
      LEFT JOIN appointment a ON mr.patient_id = a.patient_id AND mr.doctor_id = a.doctor_id
      WHERE mr.treatment IS NOT NULL AND mr.treatment <> ''
      ORDER BY mr.record_id DESC
      LIMIT 10
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Dashboard Error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================================
// 20. DOCTOR ADD PRESCRIPTION
// ==========================================
app.post("/doctor/prescription", async (req, res) => {
  try {
    const { patient_name, prescription } = req.body;
    
    // Get patient_id from patient name
    const patientResult = await pool.query(
      "SELECT patient_id FROM patient WHERE name = $1",
      [patient_name]
    );
    
    if (patientResult.rows.length === 0) {
      return res.status(400).json({ error: "Patient not found" });
    }
    
    const patient_id = patientResult.rows[0].patient_id;
    
    // Get doctor_id from authenticated doctor (using default 1 for now)
    const doctor_id = 1; // TODO: Get from session/token
    
    // Insert into medical_record with prescription as treatment
    const result = await pool.query(
      `INSERT INTO medical_record (patient_id, doctor_id, treatment, created_at) 
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP) 
       RETURNING *`,
      [patient_id, doctor_id, prescription]
    );
    res.json({ success: true, message: "Prescription added", data: result.rows[0] });
  } catch (err) {
    console.error("Error adding prescription:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ==========================================
// 21. DOCTOR ADD DIAGNOSIS
// ==========================================
app.post("/doctor/diagnosis", async (req, res) => {
  try {
    const { patient_name, diagnosis } = req.body;
    
    // Get patient_id from patient name
    const patientResult = await pool.query(
      "SELECT patient_id FROM patient WHERE name = $1",
      [patient_name]
    );
    
    if (patientResult.rows.length === 0) {
      return res.status(400).json({ error: "Patient not found" });
    }
    
    const patient_id = patientResult.rows[0].patient_id;
    
    // Get doctor_id from authenticated doctor (using default 1 for now)
    const doctor_id = 1; // TODO: Get from session/token
    
    // Insert into medical_record with diagnosis
    const result = await pool.query(
      `INSERT INTO medical_record (patient_id, doctor_id, diagnosis, created_at) 
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP) 
       RETURNING *`,
      [patient_id, doctor_id, diagnosis]
    );
    
    res.json({ success: true, message: "Diagnosis added", data: result.rows[0] });
  } catch (err) {
    console.error("Error adding diagnosis:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ==========================================
// 22. MEDICINE ROUTES (Add, Update, Delete)
// ==========================================
app.post("/medicines", async (req, res) => {
  try {
    const { medicine_name, stock_quantity, expiry_date } = req.body;
    const newMed = await pool.query(
      `INSERT INTO medicine (medicine_name, stock_quantity, expiry_date) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [medicine_name, stock_quantity || 0, expiry_date || null]
    );
    res.json(newMed.rows[0]);
  } catch (err) {
    console.error("Error adding medicine:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

app.put("/medicines/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { stock_quantity } = req.body;
    const update = await pool.query(
      "UPDATE medicine SET stock_quantity = $1 WHERE medicine_id = $2 RETURNING *",
      [stock_quantity, id]
    );
    res.json(update.rows[0]);
  } catch (err) {
    console.error("Error updating quantity:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

app.delete("/medicines/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM medicine WHERE medicine_id = $1", [id]);
    res.json({ message: "Medicine deleted successfully" });
  } catch (err) {
    console.error("Error deleting medicine:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ==========================================
// 23. NURSE STATUS ROUTES (Updated)
// ==========================================

// GET STATUS (UPDATED: Checks by Email now)
app.get("/nurse/status", async (req, res) => {
  try {
    const { email } = req.query; // Fetches by Email

    if (!email) return res.json({ status: "Available" });

    const result = await pool.query(
      "SELECT status FROM nurses WHERE email = $1",
      [email]
    );

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.json({ status: "Available" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE STATUS (UPDATED: Uses Email)
app.put("/nurse/status", async (req, res) => {
  try {
    const { email, status } = req.body;

    console.log("Received Status Update Request:", { email, status });

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const result = await pool.query(
      "UPDATE nurses SET status = $1 WHERE email = $2 RETURNING *",
      [status, email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Nurse not found" });
    }

    res.json({ success: true, nurse: result.rows[0] });
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================================
// START SERVER (Single Instance)
// ==========================================
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// ==========================================
// 25. GET PATIENT HISTORY (Completed Appointments)
// ==========================================
// app.get("/patient/history", async (req, res) => {
//   try {
//     const { patient_name } = req.query;
//     const result = await pool.query(
//       "SELECT * FROM appointments WHERE patient_name = $1 AND status = 'Completed' ORDER BY appointment_date DESC",
//       [patient_name]
//     );
//     res.json(result.rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// ==========================================
// 26. COMPLETE APPOINTMENT
// ==========================================
// app.put("/appointments/complete/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     await pool.query(
//       "UPDATE appointments SET status = 'Completed' WHERE id = $1",
//       [id]
//     );
//     res.json({ success: true, message: "Appointment completed" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

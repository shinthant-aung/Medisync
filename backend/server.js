// backend/server.js
const express = require("express");
const cors = require("cors");
const pool = require("./db"); // Import the database connection

const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());

// ==========================================
// 1. GET ADMIN DASHBOARD STATS (FIXED DOCTOR COUNT)
// ==========================================
app.get("/admin/dashboard", async (req, res) => {
  try {
    const patients = await pool.query("SELECT COUNT(*) FROM patients");

    // FIX 1: Only count doctors who are 'Available'
    const doctors = await pool.query(
      "SELECT COUNT(*) FROM doctors WHERE availability_status = 'Available'"
    );

    // FIX 2: Only count nurses who are 'Available'
    const nurses = await pool.query(
      "SELECT COUNT(*) FROM nurses WHERE status = 'Available'"
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
// 2. LOGIN ROUTE
// ==========================================
app.post("/login", async (req, res) => {
  try {
    const { username, password, role } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1 AND role = $2",
      [username, role]
    );

    if (result.rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    const user = result.rows[0];

    if (password === user.password) {
      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          email: user.email, // Sends email to frontend
        },
      });
    } else {
      res.status(401).json({ success: false, message: "Wrong password" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================================
// 3. GET PATIENTS
// ==========================================
app.get("/patients", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, 
       (SELECT prescriptions FROM vitals v WHERE v.patient_name = p.full_name ORDER BY id DESC LIMIT 1) as latest_prescription,
       (SELECT diagnosis FROM appointments a WHERE a.patient_name = p.full_name AND a.diagnosis IS NOT NULL ORDER BY appointment_date DESC LIMIT 1) as latest_diagnosis,
       (SELECT appointment_date FROM appointments a WHERE a.patient_name = p.full_name AND a.appointment_date >= CURRENT_DATE ORDER BY appointment_date ASC LIMIT 1) as next_appointment
      FROM patients p
      ORDER BY p.id ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================================
// 4. GET DOCTORS
// ==========================================
app.get("/doctors", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM doctors ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================================
// 5. GET NURSES
// ==========================================
app.get("/nurses", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM nurses ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================================
// 6. ADD NEW PATIENT
// ==========================================
app.post("/patients", async (req, res) => {
  try {
    const { full_name, email, gender, date_of_birth, allergies } = req.body;

    const newPatient = await pool.query(
      `INSERT INTO patients 
        (full_name, email, gender, date_of_birth, allergies, last_visit_date, next_appointment_date) 
        VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, NULL) 
        RETURNING *`,
      [full_name, email, gender, date_of_birth, allergies]
    );

    res.json(newPatient.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================================
// 7. RECORD VITALS
// ==========================================
app.post("/vitals", async (req, res) => {
  try {
    const {
      patient_name,
      height,
      weight,
      pulse_rate,
      temperature,
      blood_pressure,
      spo2,
      prescriptions,
      allergies,
    } = req.body;

    const newRecord = await pool.query(
      `INSERT INTO vitals 
        (patient_name, height, weight, pulse_rate, temperature, blood_pressure, spo2, prescriptions) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        patient_name,
        height,
        weight,
        pulse_rate,
        temperature,
        blood_pressure,
        spo2,
        prescriptions,
      ]
    );

    await pool.query(
      `UPDATE appointments 
       SET status = 'Checked In' 
       WHERE patient_name = $1 AND status = 'Scheduled'`,
      [patient_name]
    );

    if (allergies && allergies.trim() !== "") {
      await pool.query(
        "UPDATE patients SET allergies = $1 WHERE full_name = $2",
        [allergies, patient_name]
      );
    }

    res.json({ success: true, record: newRecord.rows[0] });
  } catch (err) {
    console.error("Error saving vitals:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================================
// 7.5 GET VITALS FOR A PATIENT
// ==========================================
app.get("/vitals/:patient_name", async (req, res) => {
  try {
    const { patient_name } = req.params;
    const result = await pool.query(
      "SELECT * FROM vitals WHERE patient_name = $1 ORDER BY id DESC LIMIT 1",
      [patient_name]
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
    let query = "SELECT * FROM appointments";
    let params = [];

    if (doctor_name) {
      query += " WHERE doctor_name = $1";
      params.push(doctor_name);
    }

    query += " ORDER BY appointment_date, appointment_time ASC";
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
      "SELECT * FROM medicines ORDER BY name ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================================
// 10. DASHBOARD STATS (General)
// ==========================================
app.get("/stats", async (req, res) => {
  try {
    const pCount = await pool.query("SELECT COUNT(*) FROM patients");
    const dCount = await pool.query(
      "SELECT COUNT(*) FROM doctors WHERE availability_status = 'Available'"
    );
    const aCount = await pool.query("SELECT COUNT(*) FROM appointments");

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
    const { full_name, email, specialty, username, password } = req.body;
    await pool.query(
      "INSERT INTO users (username, password, role, full_name, email) VALUES ($1, $2, $3, $4, $5)",
      [username, password, "doctor", full_name, email]
    );
    const newDoctor = await pool.query(
      "INSERT INTO doctors (full_name, email, specialty, availability_status) VALUES ($1, $2, $3, 'Available') RETURNING *",
      [full_name, email, specialty]
    );
    res.json(newDoctor.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================================
// 12. ADD NEW NURSE
// ==========================================
app.post("/nurses", async (req, res) => {
  try {
    const { full_name, email, assigned_doctor, username, password } = req.body;
    await pool.query(
      "INSERT INTO users (username, password, role, full_name, email) VALUES ($1, $2, $3, $4, $5)",
      [username, password, "nurse", full_name, email]
    );
    await pool.query(
      "INSERT INTO nurses (full_name, email, assigned_doctor, availability_status) VALUES ($1, $2, $3, 'Available') RETURNING *",
      [full_name, email, assigned_doctor]
    );
    res.json({ message: "Nurse created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================================
// 13. DELETE DOCTOR
// ==========================================
app.delete("/doctors/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT email FROM doctors WHERE id = $1", [
      id,
    ]);
    if (result.rows.length > 0) {
      const email = result.rows[0].email;
      await pool.query("DELETE FROM users WHERE email = $1", [email]);
      await pool.query("DELETE FROM doctors WHERE id = $1", [id]);
    }
    res.json({ message: "Doctor account deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================================
// 14. DELETE NURSE
// ==========================================
app.delete("/nurses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT email FROM nurses WHERE id = $1", [
      id,
    ]);
    if (result.rows.length > 0) {
      const email = result.rows[0].email;
      await pool.query("DELETE FROM users WHERE email = $1", [email]);
      await pool.query("DELETE FROM nurses WHERE id = $1", [id]);
    }
    res.json({ message: "Nurse account deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
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
      reason,
    } = req.body;
    const newAppt = await pool.query(
      "INSERT INTO appointments (patient_name, doctor_name, appointment_date, appointment_time, reason, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [
        patient_name,
        doctor_name,
        appointment_date,
        appointment_time,
        reason,
        "Scheduled",
      ]
    );
    res.json(newAppt.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================================
// 16. DELETE PATIENT
// ==========================================
app.delete("/patients/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const patientResult = await pool.query(
      "SELECT full_name FROM patients WHERE id = $1",
      [id]
    );

    if (patientResult.rows.length > 0) {
      const patientName = patientResult.rows[0].full_name;
      await pool.query("DELETE FROM appointments WHERE patient_name = $1", [
        patientName,
      ]);
      await pool.query("DELETE FROM vitals WHERE patient_name = $1", [
        patientName,
      ]);
      await pool.query("DELETE FROM patients WHERE id = $1", [id]);
    }
    res.json({ message: "Patient and history deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================================
// 17. UPDATE DOCTOR STATUS
// ==========================================
app.put("/doctor/status", async (req, res) => {
  try {
    const { full_name, status } = req.body;
    const result = await pool.query(
      "UPDATE doctors SET availability_status = $1 WHERE full_name = $2 RETURNING *",
      [status, full_name]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.json({ message: "Status updated", doctor: result.rows[0] });
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
    const result = await pool.query(
      "SELECT availability_status FROM doctors WHERE full_name = $1",
      [full_name]
    );
    if (result.rows.length > 0) {
      res.json({ status: result.rows[0].availability_status });
    } else {
      res.json({ status: "Available" });
    }
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
      SELECT v.id, v.patient_name, v.prescriptions, 
      COALESCE(
        (SELECT doctor_name FROM appointments a WHERE a.patient_name = v.patient_name ORDER BY appointment_date DESC LIMIT 1),
        'Unknown Doctor'
      ) as doctor_name,
      COALESCE(
        (SELECT appointment_time FROM appointments a WHERE a.patient_name = v.patient_name ORDER BY appointment_date DESC LIMIT 1),
        '-'
      ) as appointment_time,
      COALESCE(
        (SELECT appointment_date FROM appointments a WHERE a.patient_name = v.patient_name ORDER BY appointment_date DESC LIMIT 1),
        NULL
      ) as appointment_date
      FROM vitals v
      WHERE v.prescriptions IS NOT NULL AND v.prescriptions <> ''
      ORDER BY v.id DESC
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
    const result = await pool.query(
      `INSERT INTO vitals (patient_name, prescriptions) 
       VALUES ($1, $2) 
       RETURNING *`,
      [patient_name, prescription]
    );
    res.json({ success: true, message: "Sent to Nurse", data: result.rows[0] });
  } catch (err) {
    console.error("Error adding prescription:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================================
// 21. DOCTOR ADD DIAGNOSIS
// ==========================================
app.post("/doctor/diagnosis", async (req, res) => {
  try {
    const { patient_name, diagnosis } = req.body;
    const result = await pool.query(
      `UPDATE appointments 
       SET diagnosis = $1 
       WHERE patient_name = $2 
       AND (status = 'Scheduled' OR status = 'Checked In')
       RETURNING *`,
      [diagnosis, patient_name]
    );

    if (result.rows.length === 0) {
      await pool.query(
        `UPDATE appointments SET diagnosis = $1 WHERE patient_name = $2 ORDER BY appointment_date DESC LIMIT 1`,
        [diagnosis, patient_name]
      );
    }
    res.json({ success: true, message: "Diagnosis added" });
  } catch (err) {
    console.error("Error adding diagnosis:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================================
// 22. MEDICINE ROUTES (Add, Update, Delete)
// ==========================================
app.post("/medicines", async (req, res) => {
  try {
    const { name, diagnosis_relevant, patient_safety, qty } = req.body;
    const newMed = await pool.query(
      `INSERT INTO medicines (name, diagnosis_relevant, patient_safety, qty) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [name, diagnosis_relevant, patient_safety, qty]
    );
    res.json(newMed.rows[0]);
  } catch (err) {
    console.error("Error adding medicine:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/medicines/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { qty } = req.body;
    const update = await pool.query(
      "UPDATE medicines SET qty = $1 WHERE id = $2 RETURNING *",
      [qty, id]
    );
    res.json(update.rows[0]);
  } catch (err) {
    console.error("Error updating quantity:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/medicines/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM medicines WHERE id = $1", [id]);
    res.json({ message: "Medicine deleted successfully" });
  } catch (err) {
    console.error("Error deleting medicine:", err);
    res.status(500).json({ error: "Server error" });
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

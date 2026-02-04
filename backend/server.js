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

    // Count only scheduled appointments (not checked-in or cancelled)
    const appointments = await pool.query(
      "SELECT COUNT(*) FROM appointment WHERE status = 'Scheduled'"
    );

    res.json({
      total_patients: parseInt(patients.rows[0].count, 10) || 0,
      active_doctors: parseInt(doctors.rows[0].count, 10) || 0,
      active_nurses: parseInt(nurses.rows[0].count, 10) || 0,
      total_appointments: parseInt(appointments.rows[0].count, 10) || 0,
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
      SELECT patient_id, name, gender, age, TO_CHAR(date_of_birth, 'YYYY-MM-DD') as date_of_birth, phone, address, allergy FROM patient ORDER BY patient_id ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// GET SINGLE PATIENT BY ID
app.get("/patients/:patient_id", async (req, res) => {
  try {
    const { patient_id } = req.params;
    const result = await pool.query(`
      SELECT patient_id, name, gender, age, TO_CHAR(date_of_birth, 'YYYY-MM-DD') as date_of_birth, phone, address, allergy FROM patient WHERE patient_id = $1
    `, [patient_id]);
    
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: "Patient not found" });
    }
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
    const { name, gender, date_of_birth, phone, address, allergy } = req.body;

    const newPatient = await pool.query(
      `INSERT INTO patient 
        (name, gender, date_of_birth, phone, address, allergy) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING *`,
      [name, gender, date_of_birth, phone, address, allergy]
    );

    res.json(newPatient.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ==========================================
// UPDATE PATIENT
// ==========================================
app.put("/patients/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, gender, date_of_birth, phone, address, allergy } = req.body;

    const updatedPatient = await pool.query(
      `UPDATE patient 
        SET name = $1, gender = $2, date_of_birth = $3, phone = $4, address = $5, allergy = $6 
        WHERE patient_id = $7 
        RETURNING *`,
      [name, gender, date_of_birth, phone, address, allergy, id]
    );

    if (updatedPatient.rows.length === 0) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.json(updatedPatient.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ==========================================
// GET PATIENT'S APPOINTMENTS FOR HISTORY
// ==========================================
app.get("/patients/:patient_id/appointments", async (req, res) => {
  try {
    const { patient_id } = req.params;
    const result = await pool.query(
      `SELECT a.appointment_id, TO_CHAR(a.appointment_date, 'YYYY-MM-DD') as appointment_date, a.appointment_time, 
              a.reason, a.status, a.doctor_id, d.name as doctor_name
       FROM appointment a
       LEFT JOIN doctor d ON a.doctor_id = d.doctor_id
       WHERE a.patient_id = $1
       ORDER BY a.appointment_date DESC`,
      [patient_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ==========================================
// GET PATIENT'S VITAL SIGNS FOR HISTORY
// ==========================================
app.get("/patients/:patient_id/vitals", async (req, res) => {
  try {
    const { patient_id } = req.params;
    const result = await pool.query(
      `SELECT v.vital_id, 
              DATE(v.recorded_at) as recorded_date,
              TO_CHAR(v.recorded_at, 'HH24:MI:SS') as recorded_time,
              v.temperature, v.blood_pressure, v.heart_rate, v.SPO2 as oxygen_level
       FROM vital_signs v
       WHERE v.patient_id = $1
       ORDER BY v.recorded_at DESC`,
      [patient_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ==========================================
// GET PATIENT'S MEDICAL RECORDS (DIAGNOSES & PRESCRIPTIONS)
// ==========================================
app.get("/patients/:patient_id/medical-records", async (req, res) => {
  try {
    const { patient_id } = req.params;
    
    // Fetch diagnoses from medical_record
    const diagnosesResult = await pool.query(
      `SELECT m.record_id, m.diagnosis as disease_name, m.created_date as date_recorded,
              m.appointment_id, d.name as doctor_name, a.appointment_date, a.appointment_time
       FROM medical_record m
       LEFT JOIN doctor d ON m.doctor_id = d.doctor_id
       LEFT JOIN appointment a ON m.appointment_id = a.appointment_id
       WHERE m.patient_id = $1
       ORDER BY m.created_date DESC`,
      [patient_id]
    );

    // Fetch prescriptions with appointment details
    const prescriptionsResult = await pool.query(
      `SELECT DISTINCT ON (p.prescription_id) p.prescription_id, p.treatment as medicine_name, 
              p.created_at as date_prescribed, p.appointment_id, p.patient_id, p.doctor_id,
              d.name as doctor_name, 
              a.appointment_date, a.appointment_time, a.appointment_id as appointment_id_from_appt
       FROM prescription p
       LEFT JOIN doctor d ON p.doctor_id = d.doctor_id
       LEFT JOIN appointment a ON (
         p.appointment_id = a.appointment_id 
         OR (p.appointment_id IS NULL AND p.patient_id = a.patient_id AND p.doctor_id = a.doctor_id)
       )
       WHERE p.patient_id = $1
       ORDER BY p.prescription_id, a.appointment_date DESC NULLS LAST
       LIMIT (SELECT COUNT(*) FROM prescription WHERE patient_id = $1)`,
      [patient_id]
    );

    res.json({
      diagnoses: diagnosesResult.rows,
      prescriptions: prescriptionsResult.rows,
    });
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
      doctor_id,
      appointment_id,
      blood_pressure,
      temperature,
      heart_rate,
      height,
      weight,
      spo2,
    } = req.body;

    console.log("Received vitals request:", req.body);

    // Get patient_id from patient name
    const patientResult = await pool.query(
      "SELECT patient_id FROM patient WHERE name = $1",
      [patient_name]
    );

    if (patientResult.rows.length === 0) {
      return res.status(400).json({ error: "Patient not found" });
    }

    const patient_id = patientResult.rows[0].patient_id;
    console.log("Found patient_id:", patient_id);
    console.log("Values to insert:", {
      patient_id,
      appointment_id: appointment_id || null,
      blood_pressure,
      temperature: parseFloat(temperature),
      heart_rate: parseFloat(heart_rate),
      height: parseFloat(height),
      weight: parseFloat(weight),
      spo2: parseFloat(spo2),
    });

    const newRecord = await pool.query(
      `INSERT INTO vital_signs 
        (patient_id, appointment_id, blood_pressure, temperature, heart_rate, height, weight, spo2, recorded_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP) 
        RETURNING vital_id, patient_id, appointment_id, height, weight, blood_pressure, temperature, heart_rate, spo2, TO_CHAR(recorded_at, 'HH24:MI:SS') as recorded_at`,
      [
        patient_id,
        appointment_id || null,
        blood_pressure,
        parseFloat(temperature) || null,
        parseFloat(heart_rate) || null,
        parseFloat(height) || null,
        parseFloat(weight) || null,
        parseFloat(spo2) || null,
      ]
    );

    console.log("Insert successful:", newRecord.rows[0]);

    // Update appointment status to 'Check-in'
    if (appointment_id) {
      await pool.query(
        `UPDATE appointment 
         SET status = 'Check-in' 
         WHERE appointment_id = $1`,
        [appointment_id]
      );
    }

    res.json({ success: true, record: newRecord.rows[0] });
  } catch (err) {
    console.error("Error saving vitals:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ==========================================
// 7.4 GET VITALS BY APPOINTMENT ID (supports both path and query params)
// ==========================================
app.get("/vitals", async (req, res) => {
  try {
    const { appointment_id } = req.query;
    
    if (!appointment_id) {
      return res.status(400).json({ error: "appointment_id is required" });
    }
    
    console.log("Fetching vitals for appointment:", appointment_id);
    
    // Get vital record for this appointment
    const result = await pool.query(
      `SELECT vital_id, patient_id, appointment_id, height, weight, blood_pressure, temperature, heart_rate, spo2, recorded_at FROM vital_signs WHERE appointment_id = $1 LIMIT 1`,
      [appointment_id]
    );

    console.log("Vitals result:", result.rows);

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.json(null);
    }
  } catch (err) {
    console.error("Error fetching vitals:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

app.get("/vitals/appointment/:appointment_id", async (req, res) => {
  try {
    const { appointment_id } = req.params;
    console.log("Fetching vitals for appointment:", appointment_id);
    
    // Get vital record for this appointment
    const result = await pool.query(
      `SELECT vital_id, patient_id, appointment_id, height, weight, blood_pressure, temperature, heart_rate, spo2, TO_CHAR(recorded_at, 'HH24:MI:SS') as recorded_at FROM vital_signs WHERE appointment_id = $1 LIMIT 1`,
      [appointment_id]
    );

    console.log("Vitals result:", result.rows);

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: "No vitals found for this appointment" });
    }
  } catch (err) {
    console.error("Error fetching vitals:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// 7.5 GET VITALS FOR A PATIENT
// ==========================================
app.get("/vitals/:patient_name", async (req, res) => {
  try {
    const { patient_name } = req.params;
    console.log("Fetching vitals for patient:", patient_name); // DEBUG
    
    // Get patient_id from patient name
    const patientResult = await pool.query(
      "SELECT patient_id FROM patient WHERE name = $1",
      [patient_name]
    );
    
    console.log("Patient lookup result:", patientResult.rows); // DEBUG
    
    if (patientResult.rows.length === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }
    
    const patient_id = patientResult.rows[0].patient_id;
    console.log("Patient ID:", patient_id); // DEBUG
    
    // Get latest vital record for the patient
    const result = await pool.query(
      `SELECT vital_id, patient_id, appointment_id, height, weight, blood_pressure, temperature, heart_rate, spo2, TO_CHAR(recorded_at, 'HH24:MI:SS') as recorded_at FROM vital_signs WHERE patient_id = $1 ORDER BY vital_id DESC LIMIT 1`,
      [patient_id]
    );

    console.log("Vitals result:", result.rows); // DEBUG

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
// 7.6 UPDATE VITALS FOR A PATIENT
// ==========================================
app.put("/vitals/:vital_id", async (req, res) => {
  try {
    const { vital_id } = req.params;
    const {
      blood_pressure,
      temperature,
      heart_rate,
      height,
      weight,
      spo2,
      doctor_id,
      appointment_id,
    } = req.body;

    const result = await pool.query(
      `UPDATE vital_signs 
       SET blood_pressure = $1, temperature = $2, heart_rate = $3, height = $4, weight = $5, spo2 = $6, appointment_id = $7
       WHERE vital_id = $8
       RETURNING vital_id, patient_id, appointment_id, height, weight, blood_pressure, temperature, heart_rate, spo2, TO_CHAR(recorded_at, 'HH24:MI:SS') as recorded_at`,
      [
        blood_pressure,
        temperature,
        heart_rate,
        height || null,
        weight || null,
        spo2 || null,
        appointment_id || null,
        vital_id,
      ]
    );

    if (result.rows.length > 0) {
      res.json({ success: true, record: result.rows[0] });
    } else {
      res.status(404).json({ message: "Vital record not found" });
    }
  } catch (err) {
    console.error("Error updating vitals:", err);
    res.status(500).json({ error: "Server error", details: err.message });
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
        TO_CHAR(a.appointment_date, 'YYYY-MM-DD') as appointment_date,
        a.appointment_time,
        a.reason,
        a.status,
        p.name as patient_name,
        p.allergy,
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

    query += " ORDER BY a.appointment_date DESC, a.appointment_time DESC";
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================================
// 8A. GET APPOINTMENT BY PATIENT ID
// ==========================================
app.get("/appointments/:patient_id", async (req, res) => {
  try {
    const { patient_id } = req.params;
    console.log("Fetching appointment for patient_id:", patient_id); // DEBUG
    const result = await pool.query(
      `SELECT appointment_id, patient_id, doctor_id, appointment_date, appointment_time, reason, status
       FROM appointment
       WHERE patient_id = $1
       ORDER BY appointment_date DESC
       LIMIT 1`,
      [patient_id]
    );
    
    console.log("Appointment query result:", result.rows); // DEBUG
    
    if (result.rows.length === 0) {
      console.log("No appointment found for patient_id:", patient_id); // DEBUG
      res.json(null);
    } else {
      console.log("Returning appointment:", result.rows[0]); // DEBUG
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error("Error fetching appointment:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ==========================================
// 8. UPDATE APPOINTMENT STATUS
// ==========================================
app.put("/appointments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Scheduled", "Check-in", "Cancelled"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const result = await pool.query(
      "UPDATE appointment SET status = $1 WHERE appointment_id = $2 RETURNING *",
      [status, id]
    );

    if (result.rows.length > 0) {
      res.json({ success: true, appointment: result.rows[0] });
    } else {
      res.status(404).json({ error: "Appointment not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: err.message });
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
    
    const newDoctor = await pool.query(
      "INSERT INTO doctor (name, email, specialization, phone, password) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, email, specialization, phone, password || "password"]
    );
    res.json(newDoctor.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ==========================================
// UPDATE DOCTOR
// ==========================================
app.put("/doctors/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, specialization, phone, password } = req.body;
    
    const updatedDoctor = await pool.query(
      "UPDATE doctor SET name = $1, email = $2, specialization = $3, phone = $4, password = COALESCE(NULLIF($5, ''), password) WHERE doctor_id = $6 RETURNING *",
      [name, email, specialization, phone, password, id]
    );
    
    if (updatedDoctor.rows.length === 0) {
      return res.status(404).json({ error: "Doctor not found" });
    }
    
    res.json(updatedDoctor.rows[0]);
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
    
    const newNurse = await pool.query(
      "INSERT INTO nurse (name, email, phone, password) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, email, phone, password || "password"]
    );
    res.json(newNurse.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ==========================================
// 12B. UPDATE NURSE
// ==========================================
app.put("/nurses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, password } = req.body;
    
    const updatedNurse = await pool.query(
      "UPDATE nurse SET name = $1, email = $2, phone = $3, password = COALESCE(NULLIF($4, ''), password) WHERE nurse_id = $5 RETURNING *",
      [name, email, phone, password, id]
    );
    
    if (updatedNurse.rows.length === 0) {
      return res.status(404).json({ error: "Nurse not found" });
    }
    
    res.json(updatedNurse.rows[0]);
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
      await pool.query("DELETE FROM prescription WHERE doctor_id = $1", [id]);
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
      reason,
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

    const newAppt = await pool.query(
      "INSERT INTO appointment (patient_id, doctor_id, appointment_date, appointment_time, reason, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [
        patient_id,
        doctor_id,
        appointment_date,
        appointment_time,
        reason,
        "Scheduled",
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
      await pool.query("DELETE FROM prescription WHERE patient_id = $1", [id]);
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
        pr.prescription_id as id,
        COALESCE(p.name, 'N/A') as patient_name,
        pr.treatment as prescriptions,
        COALESCE(d.name, 'N/A') as doctor_name,
        COALESCE(a.appointment_date::VARCHAR, pr.created_at::DATE::VARCHAR) as appointment_date,
        COALESCE(TO_CHAR(a.appointment_time, 'HH24:MI:SS'), TO_CHAR(pr.created_at, 'HH24:MI:SS')) as appointment_time
      FROM prescription pr
      LEFT JOIN patient p ON pr.patient_id = p.patient_id
      LEFT JOIN doctor d ON pr.doctor_id = d.doctor_id
      LEFT JOIN appointment a ON pr.appointment_id = a.appointment_id
      WHERE pr.treatment IS NOT NULL AND pr.treatment <> ''
      ORDER BY pr.prescription_id DESC
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
    const { patient_name, prescription, doctor_id, appointment_id } = req.body;
    
    // Get patient_id from patient name
    const patientResult = await pool.query(
      "SELECT patient_id FROM patient WHERE name = $1",
      [patient_name]
    );
    
    if (patientResult.rows.length === 0) {
      return res.status(400).json({ error: "Patient not found" });
    }
    
    const patient_id = patientResult.rows[0].patient_id;
    
    // Use doctor_id from request (sent by frontend)
    if (!doctor_id) {
      return res.status(400).json({ error: "Doctor ID missing" });
    }
    
    // Insert into prescription table with patient_id, doctor_id, and appointment_id
    const result = await pool.query(
      `INSERT INTO prescription (treatment, patient_id, doctor_id, appointment_id, created_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING *`,
      [prescription, patient_id, doctor_id, appointment_id || null]
    );
    res.json({ success: true, message: "Prescription added", data: result.rows[0] });
  } catch (err) {
    console.error("Error adding prescription:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ==========================================
// 20.5 UPDATE PRESCRIPTION
// ==========================================
app.put("/doctor/prescription/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { prescription } = req.body;

    if (!prescription) {
      return res.status(400).json({ error: "Prescription text required" });
    }

    const result = await pool.query(
      `UPDATE prescription SET treatment = $1 WHERE prescription_id = $2 RETURNING *`,
      [prescription, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Prescription not found" });
    }

    res.json({ success: true, message: "Prescription updated", data: result.rows[0] });
  } catch (err) {
    console.error("Error updating prescription:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ==========================================
// 21. DOCTOR ADD DIAGNOSIS
// ==========================================
app.post("/doctor/diagnosis", async (req, res) => {
  try {
    const { patient_name, diagnosis, doctor_id, appointment_id } = req.body;
    
    // Get patient_id from patient name
    const patientResult = await pool.query(
      "SELECT patient_id FROM patient WHERE name = $1",
      [patient_name]
    );
    
    if (patientResult.rows.length === 0) {
      return res.status(400).json({ error: "Patient not found" });
    }
    
    const patient_id = patientResult.rows[0].patient_id;
    
    // Use doctor_id from request (sent by frontend)
    if (!doctor_id) {
      return res.status(400).json({ error: "Doctor ID missing" });
    }
    
    // Insert into medical_record with diagnosis and appointment_id
    const result = await pool.query(
      `INSERT INTO medical_record (patient_id, doctor_id, appointment_id, diagnosis, created_date) 
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) 
       RETURNING *`,
      [patient_id, doctor_id, appointment_id || null, diagnosis]
    );
    
    res.json({ success: true, message: "Diagnosis added", data: result.rows[0] });
  } catch (err) {
    console.error("Error adding diagnosis:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ==========================================
// 21.5 UPDATE DIAGNOSIS
// ==========================================
app.put("/doctor/diagnosis/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { diagnosis } = req.body;

    if (!diagnosis) {
      return res.status(400).json({ error: "Diagnosis text required" });
    }

    const result = await pool.query(
      `UPDATE medical_record SET diagnosis = $1 WHERE record_id = $2 RETURNING *`,
      [diagnosis, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Diagnosis not found" });
    }

    res.json({ success: true, message: "Diagnosis updated", data: result.rows[0] });
  } catch (err) {
    console.error("Error updating diagnosis:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ==========================================
// 21.6 DELETE PRESCRIPTION
// ==========================================
app.delete("/doctor/prescription/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM prescription WHERE prescription_id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Prescription not found" });
    }

    res.json({ success: true, message: "Prescription deleted", data: result.rows[0] });
  } catch (err) {
    console.error("Error deleting prescription:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ==========================================
// 21.7 DELETE DIAGNOSIS
// ==========================================
app.delete("/doctor/diagnosis/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM medical_record WHERE record_id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Diagnosis not found" });
    }

    res.json({ success: true, message: "Diagnosis deleted", data: result.rows[0] });
  } catch (err) {
    console.error("Error deleting diagnosis:", err);
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

    // Check if nurse exists
    const result = await pool.query(
      "SELECT nurse_id FROM nurse WHERE email = $1",
      [email]
    );

    if (result.rows.length > 0) {
      res.json({ status: "Available" });
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

    // Check if nurse exists
    const result = await pool.query(
      "SELECT nurse_id FROM nurse WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Nurse not found" });
    }

    res.json({ success: true, status: "Updated" });
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
// 24. GET PATIENT'S PRESCRIPTION AND DIAGNOSIS
// ==========================================
// ==========================================
// 24.5 GET PRESCRIPTION/DIAGNOSIS BY APPOINTMENT ID
// ==========================================
app.get("/appointment/:appointment_id/prescription-diagnosis", async (req, res) => {
  try {
    const { appointment_id } = req.params;
    
    // Get prescription for this appointment
    const prescriptionResult = await pool.query(`
      SELECT prescription_id, treatment 
      FROM prescription 
      WHERE appointment_id = $1 
      LIMIT 1
    `, [appointment_id]);
    
    // Get diagnosis for this appointment
    const diagnosisResult = await pool.query(`
      SELECT record_id, diagnosis 
      FROM medical_record 
      WHERE appointment_id = $1 
      LIMIT 1
    `, [appointment_id]);
    
    res.json({
      prescription: prescriptionResult.rows.length > 0 ? prescriptionResult.rows[0] : null,
      diagnosis: diagnosisResult.rows.length > 0 ? diagnosisResult.rows[0] : null
    });
  } catch (err) {
    console.error("Error fetching prescription/diagnosis:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ==========================================
// 24. GET PATIENT PRESCRIPTION/DIAGNOSIS
// ==========================================
app.get("/patient/:patient_id/prescription-diagnosis", async (req, res) => {
  try {
    const { patient_id } = req.params;
    
    // Get latest prescription for patient
    const prescriptionResult = await pool.query(`
      SELECT prescription_id, treatment 
      FROM prescription 
      WHERE patient_id = $1 
      ORDER BY prescription_id DESC 
      LIMIT 1
    `, [patient_id]);
    
    // Get latest diagnosis for patient
    const diagnosisResult = await pool.query(`
      SELECT record_id, diagnosis 
      FROM medical_record 
      WHERE patient_id = $1 
      ORDER BY record_id DESC 
      LIMIT 1
    `, [patient_id]);
    
    res.json({
      prescription: prescriptionResult.rows.length > 0 ? prescriptionResult.rows[0] : null,
      diagnosis: diagnosisResult.rows.length > 0 ? diagnosisResult.rows[0] : null
    });
  } catch (err) {
    console.error("Error fetching prescription/diagnosis:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ==========================================
// 25. GET DISEASE TRENDS
// ==========================================
app.get("/disease-trends", async (req, res) => {
  try {
    // Get count of each disease in medical_record
    const result = await pool.query(`
      SELECT 
        diagnosis,
        COUNT(*) as count
      FROM medical_record
      WHERE diagnosis IS NOT NULL AND diagnosis <> ''
      GROUP BY diagnosis
      ORDER BY count DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching disease trends:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

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

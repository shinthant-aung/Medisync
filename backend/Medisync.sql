
-- 1. Create Tables for Users (Admin, Doctor, Nurse)
CREATE TABLE admin (
    admin_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE doctor (
    doctor_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100) UNIQUE NOT NULL,
	password VARCHAR(255) NOT NULL
);

CREATE TABLE nurse (
    nurse_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100) UNIQUE NOT NULL,
	password VARCHAR(255) NOT NULL
);

-- 2. Create Patient Table
CREATE TABLE patient (
    patient_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    gender VARCHAR(10),
	age INT,
    date_of_birth DATE,
    phone VARCHAR(20),
    address TEXT,
	allergy text
);

-- 3. Create Appointment Table (Links Patient, Doctor, and Admin)
CREATE TABLE appointment (
    appointment_id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patient(patient_id),
    doctor_id INT REFERENCES doctor(doctor_id),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(20) CHECK (status IN ('Scheduled', 'Check-in', 'Cancelled')) DEFAULT 'Scheduled',
	reason VARCHAR(200)
);

CREATE TABLE prescription (
    prescription_id SERIAL PRIMARY KEY,
	patient_id INT REFERENCES patient(patient_id),
	doctor_id INT REFERENCES doctor(doctor_id),
	appointment_id INT REFERENCES appointment(appointment_id),
    treatment  TEXT,
    dosage VARCHAR(100),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Medical Records & Vitals
CREATE TABLE medical_record (
    record_id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patient(patient_id),
    doctor_id INT REFERENCES doctor(doctor_id),
	prescription_id INT REFERENCES prescription(prescription_id),
	appointment_id INT REFERENCES appointment(appointment_id),
    diagnosis TEXT,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vital_signs (
    vital_id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patient(patient_id),
    doctor_id INT REFERENCES doctor(doctor_id),
	appointment_id INT REFERENCES appointment(appointment_id),
	height FLOAT,
	weight FLOAT,
    blood_pressure VARCHAR(20),
    temperature DECIMAL(4,1),
    heart_rate FLOAT,
	SPO2 FLOAT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create Pharmacy/Inventory Tables
CREATE TABLE medicine (
    medicine_id SERIAL PRIMARY KEY,
    medicine_name VARCHAR(100) NOT NULL,
    stock_quantity INT DEFAULT 0,
    expiry_date DATE
);


-- 1. Insert Admins (Must be first, as they register others)
INSERT INTO admin (name, email, password) VALUES 
('Shin Thant Aung', 'shin@admin.com', 'admin');

ALTER TABLE prescription DROP COLUMN dosage;
ALTER TABLE vital_signs DROP COLUMN doctor_id;
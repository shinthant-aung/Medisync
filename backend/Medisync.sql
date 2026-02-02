
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
	password VARCHAR(255) NOT NULL,
    admin_id INT REFERENCES admin(admin_id) -- Links to the Admin who registered them
);

CREATE TABLE nurse (
    nurse_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100) UNIQUE NOT NULL,
	password VARCHAR(255) NOT NULL,
    admin_id INT REFERENCES admin(admin_id)
);

-- 2. Create Patient Table
CREATE TABLE patient (
    patient_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    gender VARCHAR(10),
	age INT,
    date_of_birth DATE,
    phone VARCHAR(20),
    address TEXT
);

-- 3. Create Appointment Table (Links Patient, Doctor, and Admin)
CREATE TABLE appointment (
    appointment_id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patient(patient_id),
    doctor_id INT REFERENCES doctor(doctor_id),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(20) CHECK (status IN ('Scheduled', 'Completed', 'Cancelled')) DEFAULT 'Scheduled',
    created_by INT REFERENCES admin(admin_id)
);

CREATE TABLE prescription (
    prescription_id SERIAL PRIMARY KEY,
    treatment  TEXT,
    dosage VARCHAR(100)
);

-- 4. Create Medical Records & Vitals
CREATE TABLE medical_record (
    record_id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patient(patient_id),
    doctor_id INT REFERENCES doctor(doctor_id),
    diagnosis TEXT,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vital_signs (
    vital_id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patient(patient_id),
    nurse_id INT REFERENCES nurse(nurse_id),
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
('Saw Lin Htet Oo', 'saw@admin.com', 'hashed_pw_1'), 
('Shin Thant Aung', 'shin@admin.com', 'hashed_pw_2'),
('Kaung Myat Thu', 'kaung@admin.com', 'hashed_pw_3');

-- 2. Insert Staff (Doctors and Nurses link to Admin)
INSERT INTO doctor (name, specialization, phone, email,password, admin_id) VALUES
('Dr. John Smith', 'Cardiology', '0912345678', 'john@doc.com', 'doc', 1),
('Dr. Emily Wong', 'Dermatology', '0987654321', 'emiliy@doc.com','doc', 1),
('Dr. Michael Tan', 'Pediatrics', '0922334455', 'michael@doc.com','doc', 2);

INSERT INTO nurse (name, phone, email,password, admin_id) VALUES
('Nurse Anna Lim', '0911111111', 'anna@nurse.com','nurse',1),
('Nurse David Ong', '0922222222', 'david@nurse.com','nurse', 2);

-- 3. Insert Patients
INSERT INTO patient (name, gender, age, date_of_birth, phone, address) VALUES
('Peter Parker', 'Male',12, '1998-08-10', '0933333333', 'Bangkok, Thailand'),
('Mary Jane', 'Female',18, '2000-03-15', '0944444444', 'Chiang Mai, Thailand'),
('Tony Stark', 'Male',30, '1985-05-29', '0955555555', 'Phuket, Thailand');

-- 4. Insert Medicines (Must be before Prescriptions)
INSERT INTO medicine (medicine_name, stock_quantity, expiry_date) VALUES
('Paracetamol', 500, '2027-12-31'),
('Amoxicillin', 300, '2026-08-15'),
('Antihistamine Cream', 200, '2026-05-20');

-- 5. Insert Appointments (Links Patient, Doctor, Admin)
INSERT INTO appointment (patient_id, doctor_id, appointment_date, appointment_time, status, created_by) VALUES
(1, 1, '2026-02-01', '10:00', 'Scheduled', 1),
(2, 2, '2026-02-02', '11:30', 'Scheduled', 1),
(3, 3, '2026-02-03', '14:00', 'Completed', 2);

-- 6. Insert Medical Records (Must be before Prescriptions)
INSERT INTO medical_record (patient_id, doctor_id, diagnosis) VALUES
(1, 1, 'High blood pressure'),
(2, 2, 'Skin allergy'),
(3, 3, 'Common cold');

-- 7. Insert Prescriptions (Links Medical Record and Medicine)
INSERT INTO prescription (treatment, dosage) VALUES
('Para', '500mg twice a day'), -- Links to High Blood Pressure record & Paracetamol
('Amo', 'Apply twice daily'), -- Links to Skin Allergy record & Antihistamine Cream
('Fluzar', '500mg once a day');  -- Links to Common Cold record & Paracetamol

-- 8. Insert Vital Signs (Links Patient and Nurse)
INSERT INTO vital_signs (patient_id, nurse_id, height, weight, blood_pressure, temperature, heart_rate, SPO2) VALUES
(1, 1,190,90, '120/80', 36.7, 72, 100),
(2, 1,180, 100,'118/76', 36.5, 70,100),
(3, 2,180,50, '110/70', 37.0, 75,100);

-- 1. Create the standard list of diseases
CREATE TABLE diseases (
    disease_id SERIAL PRIMARY KEY,
    disease_name VARCHAR(100) UNIQUE NOT NULL
);

-- 2. Populate it with common diseases for your drop-down
INSERT INTO diseases (disease_name) VALUES 
('Flu'), ('Diabetes'), ('Hypertension'), ('Heart Attack'), ('Covid-19'), ('Migraine'), ('Skin Allergy'), ('Common Cold');

-- 3. Modify 'medical_record' to link to this new table
-- We add a new column for the standard ID
ALTER TABLE medical_record ADD COLUMN disease_id INT REFERENCES diseases(disease_id);

-- (Optional) If you want to migrate your old text data to the new ID system:
UPDATE medical_record SET disease_id = (SELECT disease_id FROM diseases WHERE disease_name = 'High blood pressure') WHERE diagnosis = 'High blood pressure';
UPDATE medical_record SET disease_id = (SELECT disease_id FROM diseases WHERE disease_name = 'Skin allergy') WHERE diagnosis = 'Skin allergy';
UPDATE medical_record SET disease_id = (SELECT disease_id FROM diseases WHERE disease_name = 'Common Cold') WHERE diagnosis = 'Common cold';




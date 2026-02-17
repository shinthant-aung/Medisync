// backend/db.js
const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres", // Default user is usually 'postgres'
  host: "localhost",
  database: "Medisync", // The name we just gave our database
  password: "password", // <--- REPLACE THIS WITH YOUR PGADMIN PASSWORD
  port: 5432, // Default PostgreSQL port
});

module.exports = pool;

import pkg from "pg";

const { Pool } = pkg;

export const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "W3lcome!",
  database: "DatosVehiculos",
  port: 5432
});
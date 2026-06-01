import "dotenv/config";
import mysql from "mysql2/promise";

const database = process.env.DB_NAME || "booking";

const baseConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
  charset: "utf8mb4"
};

let bootstrapped = false;

export const pool = mysql.createPool({
  ...baseConfig,
  database
});

export async function ensureDatabase() {
  if (bootstrapped) return;

  const bootstrap = await mysql.createConnection(baseConfig);
  await bootstrap.query(
    `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await bootstrap.end();
  bootstrapped = true;
}

export async function query<T = any>(sql: string, params: any[] = []) {
  const [rows] = await pool.execute(sql, params);
  return rows as T[];
}

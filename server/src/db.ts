import "dotenv/config";
import mysql from "mysql2/promise";
import type { Connection } from "mysql2/promise";

const isProduction = process.env.NODE_ENV === "production";

function requiredEnv(name: string, fallback = "") {
  const value = process.env[name] || fallback;
  if (isProduction && !value) {
    throw new Error(`${name} is required in production.`);
  }
  return value;
}

const database = requiredEnv("DB_NAME", "booking");

const baseConfig = {
  host: requiredEnv("DB_HOST", "localhost"),
  port: Number(process.env.DB_PORT || 3306),
  user: requiredEnv("DB_USER", "root"),
  password: requiredEnv("DB_PASSWORD"),
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

  let bootstrap: Connection | null = null;
  try {
    bootstrap = await mysql.createConnection(baseConfig);
    await bootstrap.query(
      `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    bootstrapped = true;
  } catch (error) {
    console.error("[db] failed to initialize database", {
      host: baseConfig.host,
      port: baseConfig.port,
      user: baseConfig.user,
      database,
      error
    });
    throw error;
  } finally {
    await bootstrap?.end().catch((error) => {
      console.warn("[db] failed to close bootstrap connection", { error });
    });
  }
}

export async function query<T = any>(sql: string, params: any[] = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows as T[];
  } catch (error) {
    console.error("[db] query failed", {
      statement: sql.replace(/\s+/g, " ").trim().slice(0, 240),
      error
    });
    throw error;
  }
}

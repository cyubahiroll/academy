const mysql = require('mysql2/promise');
const path = require('path');

// Load .env from project root (works locally; on Render env vars are injected directly)
try { require('dotenv').config({ path: path.join(process.cwd(), '.env') }); } catch(e) {}

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'road_rules',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  multipleStatements: true,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
};

if (process.env.DB_SSL === 'true') {
  dbConfig.ssl = { rejectUnauthorized: false };
}

console.log(`[DB] Config: host=${dbConfig.host} port=${dbConfig.port} db=${dbConfig.database} ssl=${dbConfig.ssl ? 'enabled' : 'disabled'}`);

const pool = mysql.createPool(dbConfig);

// Test connection (non-blocking - won't crash server)
pool.getConnection()
  .then(conn => {
    console.log('[DB] MySQL connected successfully');
    conn.release();
  })
  .catch(err => {
    console.error('[DB] MySQL connection failed:', err.message);
    console.error('[DB] Check your DB_HOST, DB_USER, DB_PASSWORD, DB_NAME env vars');
  });

module.exports = pool;

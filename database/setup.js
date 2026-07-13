/**
 * Database setup script — run this locally to initialize the database.
 *
 * Usage:
 *   1. Make sure MySQL is running locally
 *   2. cd server && node ../database/setup.js
 *
 * Or with CleverCloud:
 *   1. Set env vars: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_SSL=true
 *   2. cd server && node ../database/setup.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', 'server', '.env' }));
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const pool = require('../server/config/db');

async function setup() {
  console.log('=== Road Rules Academy — Database Setup ===\n');
  console.log(`Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`Port: ${process.env.DB_PORT || '3306'}`);
  console.log(`Database: ${process.env.DB_NAME || 'road_rules'}`);
  console.log(`SSL: ${process.env.DB_SSL || 'false'}\n`);

  try {
    // Test connection
    const conn = await pool.getConnection();
    console.log('✓ Connected to MySQL\n');
    conn.release();
  } catch (err) {
    console.error('✗ Cannot connect to MySQL:', err.message);
    console.error('\nCheck your DB_HOST, DB_USER, DB_PASSWORD, DB_NAME env vars.');
    process.exit(1);
  }

  const fs = require('fs');
  const path = require('path');

  // Run schema
  const schemaPath = path.join(__dirname, 'road_rules.sql');
  let schema = fs.readFileSync(schemaPath, 'utf8');
  schema = schema.replace(/CREATE DATABASE[^;]+;/gi, '');
  schema = schema.replace(/USE\s+\w+\s*;/gi, '');

  const statements = schema.split(';').map(s => s.trim()).filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`Running ${statements.length} schema statements...`);
  for (const stmt of statements) {
    try {
      await pool.query(stmt);
    } catch (err) {
      if (err.code === 'ER_TABLE_EXISTS_ERROR' || err.code === 'ER_DUP_KEYNAME') {
        // skip
      } else {
        console.error('  ✗', err.message);
        console.error('  ', stmt.substring(0, 80));
      }
    }
  }
  console.log('✓ Schema complete\n');

  // Seed data
  const seedPath = path.join(__dirname, 'seed.sql');
  let seed = fs.readFileSync(seedPath, 'utf8');
  seed = seed.replace(/USE\s+\w+\s*;/gi, '');

  const seedStatements = seed.split(';').map(s => s.trim()).filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`Running ${seedStatements.length} seed statements...`);
  for (const stmt of seedStatements) {
    try {
      await pool.query(stmt);
    } catch (err) {
      console.error('  ✗', err.message);
      console.error('  ', stmt.substring(0, 80));
    }
  }
  console.log('✓ Seed complete\n');

  // Verify
  const [tables] = await pool.query('SHOW TABLES');
  console.log(`Database ready with ${tables.length} tables:`);
  tables.forEach(t => console.log(`  - ${Object.values(t)[0]}`));

  const [users] = await pool.query('SELECT id, full_name, email, role FROM users');
  console.log(`\nUsers (${users.length}):`);
  users.forEach(u => console.log(`  - ${u.full_name} (${u.email}) [${u.role}]`));

  const [quizzes] = await pool.query('SELECT id, title FROM quizzes');
  console.log(`\nQuizzes (${quizzes.length}):`);
  quizzes.forEach(q => console.log(`  - ${q.title}`));

  await pool.end();
  console.log('\n✓ Done!');
}

setup().catch(err => {
  console.error('Setup failed:', err);
  process.exit(1);
});

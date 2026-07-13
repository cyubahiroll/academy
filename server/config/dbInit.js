const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function initDatabase() {
  try {
    const [rows] = await pool.query("SHOW TABLES");
    if (rows.length > 0) {
      console.log(`[DB Init] Database already has ${rows.length} tables, skipping schema creation`);
      return true;
    }

    console.log('[DB Init] No tables found, running schema...');

    // On Render, process.cwd() is server/, so go up one level to find database/
    const schemaPath = path.join(process.cwd(), '..', 'database', 'road_rules.sql');
    const schemaPathLocal = path.join(process.cwd(), 'database', 'road_rules.sql');
    const finalSchemaPath = fs.existsSync(schemaPath) ? schemaPath : (fs.existsSync(schemaPathLocal) ? schemaPathLocal : null);
    if (!finalSchemaPath) {
      console.warn('[DB Init] Schema file not found. Tried:', schemaPath, schemaPathLocal);
      return false;
    }

    let schema = fs.readFileSync(finalSchemaPath, 'utf8');

    // Strip CREATE DATABASE and USE statements — CleverCloud already has the DB
    schema = schema.replace(/CREATE DATABASE[^;]+;/gi, '');
    schema = schema.replace(/USE\s+\w+\s*;/gi, '');

    // Run each statement individually to avoid issues with multipleStatements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const stmt of statements) {
      try {
        await pool.query(stmt);
      } catch (err) {
        // Ignore "table already exists" errors for idempotency
        if (err.code !== 'ER_TABLE_EXISTS_ERROR' && err.code !== 'ER_DUP_KEYNAME') {
          console.error('[DB Init] Error executing statement:', err.message);
          console.error('[DB Init] Statement:', stmt.substring(0, 100));
        }
      }
    }

    console.log(`[DB Init] Schema created (${statements.length} statements)`);

    // Seed data
    const seedPath = path.join(process.cwd(), '..', 'database', 'seed.sql');
    const seedPathLocal = path.join(process.cwd(), 'database', 'seed.sql');
    const finalSeedPath = fs.existsSync(seedPath) ? seedPath : (fs.existsSync(seedPathLocal) ? seedPathLocal : null);
    if (finalSeedPath) {
      const [userCount] = await pool.query('SELECT COUNT(*) as cnt FROM users');
      if (userCount[0].cnt === 0) {
        console.log('[DB Init] Seeding initial data...');
        let seed = fs.readFileSync(finalSeedPath, 'utf8');
        seed = seed.replace(/USE\s+\w+\s*;/gi, '');

        const seedStatements = seed
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--'));

        for (const stmt of seedStatements) {
          try {
            await pool.query(stmt);
          } catch (err) {
            console.error('[DB Init] Seed error:', err.message);
            console.error('[DB Init] Seed statement:', stmt.substring(0, 100));
          }
        }
        console.log(`[DB Init] Seed complete (${seedStatements.length} statements)`);
      } else {
        console.log(`[DB Init] Users already exist (${userCount[0].cnt}), skipping seed`);
      }
    }

    return true;
  } catch (err) {
    console.error('[DB Init] Fatal error:', err.message);
    return false;
  }
}

module.exports = { initDatabase };

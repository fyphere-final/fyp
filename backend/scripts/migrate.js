/* Runs src/sql/*.sql (in order). Batches are split on lines containing only GO. */
const fs = require('fs');
const path = require('path');
const { getPool, closePool } = require('../src/config/db');

(async () => {
  const dir = path.join(__dirname, '../src/sql');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  const pool = await getPool();
  for (const f of files) {
    const text = fs.readFileSync(path.join(dir, f), 'utf8').replace(/^﻿/, '');
    const batches = text.split(/^\s*GO\s*$/gim).map((b) => b.trim()).filter(Boolean);
    for (const b of batches) await pool.request().batch(b);
    console.log(`applied ${f} (${batches.length} batches)`);
  }
  await closePool();
})().catch((e) => {
  console.error('migration failed:', e.message);
  process.exit(1);
});

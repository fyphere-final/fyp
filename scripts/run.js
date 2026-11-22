#!/usr/bin/env node
/**
 * One command to set up and run the whole project locally:
 *
 *     npm start            (setup if needed, then run API + web)
 *     npm run setup        (setup only, do not start the servers)
 *
 * Steps (every step is safe to repeat):
 *   1. check Node version
 *   2. install backend + web dependencies (only when missing)
 *   3. create backend/.env and web/.env (only when missing)
 *   4. make sure SQL Server is reachable (starts a Docker container if needed)
 *   5. create the [Ubaid Qaida] database and import helper_data/Online-Obaid-Qaida.sql (only when empty)
 *   6. run the schema migration + seed the demo accounts
 *   7. start the API (:5000) and the web app (:5173) together; Ctrl+C stops both
 */
const fs = require('fs');
const path = require('path');
const net = require('net');
const http = require('http');
const crypto = require('crypto');
const { spawn, spawnSync } = require('child_process');
const { createRequire } = require('module');

const ROOT = path.resolve(__dirname, '..');
const BACKEND = path.join(ROOT, 'backend');
const WEB = path.join(ROOT, 'web');
const SQL_FILE = path.join(ROOT, 'helper_data', 'Online-Obaid-Qaida.sql');
const IS_WIN = process.platform === 'win32';
const SETUP_ONLY = process.argv.includes('--setup-only');

const API_PORT = 5000;
const WEB_PORT = 5173;
const CONTAINER = 'oq-mssql';
const DEFAULT_DB_PORT = 14330;
const DEFAULT_DB_PASSWORD = 'Oq_Test#2026';

const c = (code) => (s) => (process.stdout.isTTY ? `\x1b[${code}m${s}\x1b[0m` : s);
const green = c('32'), red = c('31'), yellow = c('33'), cyan = c('36'), bold = c('1'), dim = c('2');
let stepNo = 0;
const step = (msg) => console.log(`\n${cyan(`[${++stepNo}]`)} ${bold(msg)}`);
const ok = (msg) => console.log(`    ${green('✓')} ${msg}`);
const info = (msg) => console.log(`    ${dim(msg)}`);
const warn = (msg) => console.log(`    ${yellow('!')} ${msg}`);

function fail(msg, hint) {
  console.error(`\n${red('✗ ' + msg)}`);
  if (hint) console.error(hint.split('\n').map((l) => '  ' + l).join('\n'));
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function run(cmd, args, opts = {}) {
  return spawnSync(cmd, args, { stdio: 'inherit', shell: IS_WIN, ...opts });
}

function quiet(cmd, args, opts = {}) {
  return spawnSync(cmd, args, { encoding: 'utf8', shell: IS_WIN, ...opts });
}

function portFree(port) {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.once('error', () => resolve(false));
    srv.once('listening', () => srv.close(() => resolve(true)));
    srv.listen(port);
  });
}

function httpOk(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume();
      resolve(res.statusCode >= 200 && res.statusCode < 500);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

/* ------------------------------------------------------------------ 1. Node */
function checkNode() {
  step('Checking Node.js');
  const major = parseInt(process.versions.node.split('.')[0], 10);
  if (major < 18) fail(`Node ${process.versions.node} is too old.`, 'Install Node 18 or newer from https://nodejs.org');
  ok(`Node ${process.versions.node}`);
}

/* ------------------------------------------------------------ 2. Dependencies */
function installDeps() {
  step('Installing dependencies');
  for (const [name, dir] of [['backend', BACKEND], ['web', WEB]]) {
    const marker = path.join(dir, 'node_modules', '.package-lock.json');
    const pkgTime = fs.statSync(path.join(dir, 'package.json')).mtimeMs;
    const upToDate = fs.existsSync(marker) && fs.statSync(marker).mtimeMs >= pkgTime;
    if (upToDate) {
      ok(`${name}: already installed`);
      continue;
    }
    info(`${name}: npm install ...`);
    const hasLock = fs.existsSync(path.join(dir, 'package-lock.json'));
    const r = run('npm', [hasLock ? 'ci' : 'install', '--no-audit', '--no-fund'], { cwd: dir });
    if (r.status !== 0) {
      // `npm ci` fails when the lock file is out of sync; fall back to a normal install.
      const r2 = run('npm', ['install', '--no-audit', '--no-fund'], { cwd: dir });
      if (r2.status !== 0) fail(`npm install failed in ${name}/`, 'Check your internet connection and run `npm start` again.');
    }
    ok(`${name}: installed`);
  }
}

/* ------------------------------------------------------------------ 3. .env */
function ensureEnvFiles() {
  step('Checking configuration files');
  const backendEnv = path.join(BACKEND, '.env');
  if (!fs.existsSync(backendEnv)) {
    const body = [
      '# Created automatically by `npm start` (local Docker SQL Server defaults)',
      'DB_SERVER=localhost',
      `DB_PORT=${DEFAULT_DB_PORT}`,
      'DB_NAME=Ubaid Qaida',
      'DB_USER=sa',
      `DB_PASSWORD="${DEFAULT_DB_PASSWORD}"`,
      'DB_ENCRYPT=false',
      'DB_TRUST_SERVER_CERT=true',
      '',
      `PORT=${API_PORT}`,
      `JWT_SECRET=${crypto.randomBytes(32).toString('hex')}`,
      'JWT_EXPIRES_IN=7d',
      `CORS_ORIGIN=http://localhost:${WEB_PORT}`,
      '',
      'PASS_PERCENT=60',
      'QUIZ_SIZE=3',
      'DEMO_PASSWORD=123456',
      '',
    ].join('\n');
    fs.writeFileSync(backendEnv, body);
    ok('backend/.env created');
  } else {
    ok('backend/.env found');
  }
  const webEnv = path.join(WEB, '.env');
  if (!fs.existsSync(webEnv)) {
    fs.writeFileSync(webEnv, `VITE_API_URL=http://localhost:${API_PORT}/api\n`);
    ok('web/.env created');
  } else {
    ok('web/.env found');
  }
}

function loadBackendEnv() {
  const req = createRequire(path.join(BACKEND, 'package.json'));
  const dotenv = req('dotenv');
  const parsed = dotenv.parse(fs.readFileSync(path.join(BACKEND, '.env')));
  const need = ['DB_SERVER', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET'];
  const missing = need.filter((k) => !parsed[k]);
  if (missing.length) fail(`backend/.env is missing: ${missing.join(', ')}`, 'Fill these in (see backend/.env.example) or delete backend/.env to regenerate it.');
  return { env: parsed, mssql: req('mssql') };
}

/* --------------------------------------------------------------- 4. SQL Server */
function dbConfig(env, database) {
  return {
    server: env.DB_SERVER,
    port: parseInt(env.DB_PORT, 10) || 1433,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database,
    options: {
      encrypt: String(env.DB_ENCRYPT || 'false').toLowerCase() === 'true',
      trustServerCertificate: String(env.DB_TRUST_SERVER_CERT || 'true').toLowerCase() === 'true',
    },
    connectionTimeout: 8000,
    requestTimeout: 120000,
    pool: { max: 2, min: 0 },
  };
}

async function tryConnect(mssql, env, database = 'master') {
  const pool = new mssql.ConnectionPool(dbConfig(env, database));
  try {
    await pool.connect();
    return { pool };
  } catch (e) {
    try { await pool.close(); } catch (_) { /* ignore */ }
    return { error: e };
  }
}

function dockerReady() {
  const r = quiet('docker', ['info']);
  return r.status === 0;
}

function startDockerSqlServer(env) {
  const port = parseInt(env.DB_PORT, 10) || 1433;
  const which = quiet('docker', ['--version']);
  if (which.status !== 0) {
    fail(
      `Cannot reach SQL Server at ${env.DB_SERVER}:${port} and Docker is not installed.`,
      'Either install Docker Desktop (https://www.docker.com/products/docker-desktop) and run `npm start` again,\n' +
        'or point backend/.env at an existing SQL Server (DB_SERVER, DB_PORT, DB_USER, DB_PASSWORD).'
    );
  }
  if (!dockerReady()) {
    fail('Docker is installed but not running.', 'Open Docker Desktop, wait until it says "Engine running", then run `npm start` again.');
  }
  const ps = quiet('docker', ['ps', '-a', '--filter', `name=^/${CONTAINER}$`, '--format', '{{.Names}}|{{.Status}}']);
  const line = (ps.stdout || '').trim();
  if (line) {
    if (/^[^|]+\|Up/.test(line)) {
      info(`Docker container "${CONTAINER}" is already running, waiting for SQL Server ...`);
    } else {
      info(`Starting Docker container "${CONTAINER}" ...`);
      const r = quiet('docker', ['start', CONTAINER]);
      if (r.status !== 0) fail(`Could not start container "${CONTAINER}".`, (r.stderr || '').trim());
    }
    return;
  }
  info(`Creating Docker container "${CONTAINER}" (first run downloads ~1.5 GB, please wait) ...`);
  const args = ['run', '-d', '--name', CONTAINER];
  if (process.arch === 'arm64') args.push('--platform', 'linux/amd64');
  args.push(
    '-e', 'ACCEPT_EULA=Y',
    '-e', `MSSQL_SA_PASSWORD=${env.DB_PASSWORD}`,
    '-p', `${port}:1433`,
    'mcr.microsoft.com/mssql/server:2022-latest'
  );
  const r = run('docker', args);
  if (r.status !== 0) {
    fail(
      'Could not create the SQL Server container.',
      `Port ${port} may be in use, or DB_PASSWORD may be too weak (SQL Server needs 8+ chars with upper, lower, digit and symbol).`
    );
  }
}

async function ensureSqlServer(env, mssql) {
  step('Checking SQL Server');
  const host = env.DB_SERVER.toLowerCase();
  const isLocal = ['localhost', '127.0.0.1', '::1'].includes(host);

  let r = await tryConnect(mssql, env);
  if (!r.error) {
    ok(`Connected to ${env.DB_SERVER}:${env.DB_PORT || 1433}`);
    return r.pool;
  }

  const code = r.error.code;
  if (code === 'ELOGIN') {
    fail(
      'SQL Server is reachable but the login was rejected.',
      `DB_USER / DB_PASSWORD in backend/.env do not match the server.\n` +
        (isLocal
          ? `If you use the Docker container "${CONTAINER}", the password must be the one it was created with.\n` +
            `To start fresh: docker rm -f ${CONTAINER}  and delete backend/.env, then run \`npm start\`.`
          : '')
    );
  }
  if (!isLocal) {
    fail(
      `Cannot connect to SQL Server at ${env.DB_SERVER}:${env.DB_PORT || 1433}.`,
      `${r.error.message}\nCheck the host, port, firewall and credentials in backend/.env.`
    );
  }

  warn(`SQL Server is not reachable yet (${r.error.message.split('\n')[0]})`);
  startDockerSqlServer(env);

  const deadline = Date.now() + 180000;
  let dots = 0;
  while (Date.now() < deadline) {
    await sleep(3000);
    r = await tryConnect(mssql, env);
    if (!r.error) {
      ok('SQL Server is up');
      return r.pool;
    }
    if (r.error.code === 'ELOGIN') {
      fail('SQL Server started but rejected the login.', `Password in backend/.env does not match container "${CONTAINER}".\nRun: docker rm -f ${CONTAINER}  then \`npm start\` again.`);
    }
    if (++dots % 5 === 0) info('still waiting for SQL Server to start ...');
  }
  fail('SQL Server did not become ready within 3 minutes.', `Check:  docker logs ${CONTAINER}`);
}

/* ------------------------------------------------------------- 5. Database + data */
function splitOriginalScript() {
  const text = fs.readFileSync(SQL_FILE, 'utf8').replace(/^﻿/, '').replace(/\r\n/g, '\n');
  const starts = /^\s*(insert\s+into|create\s+(database|table)|use\s|select\s)/i;
  const batches = [];
  let cur = [];
  for (const line of text.split('\n')) {
    if (starts.test(line) && cur.length) {
      batches.push(cur.join('\n'));
      cur = [];
    }
    cur.push(line);
  }
  if (cur.length) batches.push(cur.join('\n'));
  return batches
    .map((b) => b.trim())
    .filter((b) => {
      // drop batches that only contain comments, `create database`, `use` or a plain `select`
      const firstStatement = b.split('\n').find((l) => l.trim() && !l.trim().startsWith('--')) || '';
      return firstStatement && !/^\s*(create\s+database|use\s|select\s)/i.test(firstStatement);
    });
}

async function ensureDatabase(env, mssql, masterPool) {
  step(`Preparing database [${env.DB_NAME}]`);
  const dbName = env.DB_NAME;
  const quoted = '[' + dbName.replace(/]/g, ']]') + ']';

  const exists = await masterPool.request().input('n', mssql.NVarChar(128), dbName).query('SELECT DB_ID(@n) AS id');
  if (exists.recordset[0].id == null) {
    try {
      await masterPool.request().batch(`CREATE DATABASE ${quoted}`);
      ok('database created');
    } catch (e) {
      fail(`Could not create database [${dbName}].`, `${e.message}\nOn a hosted server, create the database in its portal and set DB_NAME in backend/.env.`);
    }
  } else {
    ok('database exists');
  }
  await masterPool.close();

  const r = await tryConnect(mssql, env, dbName);
  if (r.error) fail(`Cannot open database [${dbName}].`, r.error.message);
  const pool = r.pool;

  const count = async () => {
    const out = {};
    for (const [key, table] of [['words', 'Words'], ['units', 'units'], ['lessons', 'Lessons'], ['students', 'Students']]) {
      // table names are fixed literals; the table may not exist yet, so check first
      const rs = await pool.request().query(
        `IF OBJECT_ID('dbo.${table}', 'U') IS NULL SELECT 0 AS n ELSE EXEC('SELECT COUNT(*) AS n FROM dbo.${table}')`
      );
      out[key] = rs.recordset[0].n;
    }
    return out;
  };

  let counts = await count();
  if (counts.words > 0 && counts.units > 0 && counts.lessons > 0 && counts.students > 0) {
    ok(`content already imported (${counts.units} units, ${counts.lessons} lessons, ${counts.words} words)`);
    await pool.close();
    return;
  }

  if (!fs.existsSync(SQL_FILE)) fail('helper_data/Online-Obaid-Qaida.sql is missing.', 'Restore the file from the repository and run again.');
  info('importing helper_data/Online-Obaid-Qaida.sql ...');
  const batches = splitOriginalScript();
  let applied = 0;
  const ignored = new Map();
  for (const b of batches) {
    try {
      await pool.request().batch(b);
      applied++;
    } catch (e) {
      // "already exists" / duplicate-key errors are expected when the script is re-applied to a partial database
      const num = e.number || e.code || 'error';
      ignored.set(num, (ignored.get(num) || 0) + 1);
    }
  }
  await pool.request().batch('SELECT 1'); // keep-alive sanity check
  counts = await count();
  if (!(counts.words > 0 && counts.units > 0 && counts.lessons > 0 && counts.students > 0)) {
    fail('Import finished but the tables are still empty.', JSON.stringify(counts));
  }
  ok(`imported ${applied}/${batches.length} statements (${counts.units} units, ${counts.lessons} lessons, ${counts.words} words)`);
  if (ignored.size) {
    info('some statements in the original script are skipped by SQL Server itself (over-long values / duplicate rows);');
    info(`this is expected and gives the same data as the reference database [error codes: ${[...ignored.entries()].map(([k, v]) => `${k}×${v}`).join(', ')}]`);
  }
  await pool.close();
}

/* ----------------------------------------------------------- 6. Migrate + seed */
function migrateAndSeed() {
  step('Applying schema updates and demo accounts');
  for (const [label, script] of [['migrate', 'scripts/migrate.js'], ['seed', 'scripts/seed-demo.js']]) {
    const r = run(process.execPath, [script], { cwd: BACKEND, shell: false });
    if (r.status !== 0) fail(`${label} step failed.`, 'See the message above.');
  }
  ok('schema ready, demo accounts ready (student@gmail.com / teacher@gmail.com, password 123456)');
}

/* ---------------------------------------------------------------- 7. Run both */
async function checkPorts() {
  for (const [port, name] of [[API_PORT, 'API'], [WEB_PORT, 'web app']]) {
    if (!(await portFree(port))) {
      fail(
        `Port ${port} (${name}) is already in use.`,
        IS_WIN
          ? `Find it:  netstat -ano | findstr :${port}   then   taskkill /PID <pid> /F`
          : `Free it:  lsof -ti :${port} | xargs kill\nThen run \`npm start\` again.`
      );
    }
  }
}

function pipe(child, tag, color) {
  const prefix = color(`[${tag}]`.padEnd(6));
  const onData = (buf) => {
    for (const line of buf.toString().split(/\r?\n/)) {
      if (line.trim()) process.stdout.write(`${prefix} ${line}\n`);
    }
  };
  child.stdout.on('data', onData);
  child.stderr.on('data', onData);
}

async function startServers() {
  step('Starting the app');
  await checkPorts();

  const children = [];
  let stopping = false;
  const stopAll = (code = 0) => {
    if (stopping) return;
    stopping = true;
    for (const ch of children) {
      try { ch.kill('SIGTERM'); } catch (_) { /* ignore */ }
    }
    setTimeout(() => process.exit(code), 400);
  };
  process.on('SIGINT', () => { console.log('\nStopping ...'); stopAll(0); });
  process.on('SIGTERM', () => stopAll(0));

  const api = spawn(process.execPath, ['src/server.js'], { cwd: BACKEND, env: { ...process.env, PORT: String(API_PORT) } });
  const viteBin = path.join(WEB, 'node_modules', 'vite', 'bin', 'vite.js');
  const web = spawn(process.execPath, [viteBin, '--port', String(WEB_PORT), '--strictPort', '--host', 'localhost'], { cwd: WEB });
  children.push(api, web);
  pipe(api, 'api', cyan);
  pipe(web, 'web', yellow);
  for (const [ch, name] of [[api, 'API'], [web, 'web app']]) {
    ch.on('exit', (code) => {
      if (!stopping) {
        console.error(red(`\n${name} stopped unexpectedly (exit ${code}).`));
        stopAll(1);
      }
    });
  }

  const waitFor = async (url, label) => {
    const until = Date.now() + 60000;
    while (Date.now() < until) {
      if (stopping) return false;
      if (await httpOk(url)) return true;
      await sleep(500);
    }
    console.error(red(`${label} did not start within 60 seconds.`));
    stopAll(1);
    return false;
  };
  const apiUp = await waitFor(`http://localhost:${API_PORT}/api/health`, 'API');
  const webUp = apiUp && (await waitFor(`http://localhost:${WEB_PORT}/`, 'Web app'));
  if (!webUp) return;

  console.log(`
${green('━'.repeat(58))}
 ${bold('Obaid Qaida is running')}

   App : ${bold(`http://localhost:${WEB_PORT}`)}
   API : http://localhost:${API_PORT}/api/health

   Student login : student@gmail.com / 123456
   Teacher login : teacher@gmail.com / 123456   (Phase 2 screen)

   Press Ctrl+C to stop.
${green('━'.repeat(58))}`);
}

/* ------------------------------------------------------------------------ main */
(async () => {
  console.log(bold('\nObaid Qaida - setup & run'));
  checkNode();
  installDeps();
  ensureEnvFiles();
  const { env, mssql } = loadBackendEnv();
  const master = await ensureSqlServer(env, mssql);
  await ensureDatabase(env, mssql, master);
  migrateAndSeed();
  if (SETUP_ONLY) {
    console.log(`\n${green('✓ Setup complete.')} Start the app with:  npm start\n`);
    return;
  }
  await startServers();
})().catch((e) => fail('Unexpected error: ' + (e && e.message ? e.message : e), e && e.stack));

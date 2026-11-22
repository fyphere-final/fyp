const env = require('./config/env');
const app = require('./app');
const { getPool, closePool } = require('./config/db');

async function start() {
  try {
    await getPool();
    console.log(`[db] connected to ${env.db.server}/${env.db.database}`);
  } catch (e) {
    console.error('[db] initial connection failed (will retry on first request):', e.message);
  }
  const server = app.listen(env.port, () => console.log(`[api] listening on http://localhost:${env.port}`));
  const stop = async () => { server.close(); await closePool().catch(() => {}); process.exit(0); };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}
start();

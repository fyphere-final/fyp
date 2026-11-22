const sql = require('mssql');
const env = require('./env');

let poolPromise = null;

/** Lazily-created singleton connection pool. */
function getPool() {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(env.db)
      .connect()
      .then((pool) => {
        pool.on('error', (err) => console.error('[db] pool error', err.message));
        return pool;
      })
      .catch((err) => {
        poolPromise = null; // allow retry on next request
        throw err;
      });
  }
  return poolPromise;
}

async function closePool() {
  if (poolPromise) {
    const pool = await poolPromise;
    poolPromise = null;
    await pool.close();
  }
}

module.exports = { sql, getPool, closePool };

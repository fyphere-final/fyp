require('dotenv').config();

const required = ['DB_SERVER', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET'];

function loadEnv() {
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. Copy .env.example to .env and fill them in.`
    );
  }
  const bool = (v, d) => (v === undefined ? d : String(v).toLowerCase() === 'true');
  const int = (v, d) => (Number.isFinite(parseInt(v, 10)) ? parseInt(v, 10) : d);

  return Object.freeze({
    port: int(process.env.PORT, 5000),
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map((s) => s.trim()),
    passPercent: Math.min(100, Math.max(1, int(process.env.PASS_PERCENT, 60))),
    quizSize: Math.min(20, Math.max(1, int(process.env.QUIZ_SIZE, 3))),
    demoPassword: process.env.DEMO_PASSWORD || '123456',
    db: {
      server: process.env.DB_SERVER,
      port: int(process.env.DB_PORT, 1433),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      options: {
        encrypt: bool(process.env.DB_ENCRYPT, false),
        trustServerCertificate: bool(process.env.DB_TRUST_SERVER_CERT, true),
      },
      pool: { max: process.env.VERCEL ? 3 : 10, min: 0, idleTimeoutMillis: 30000 },
    },
  });
}

module.exports = loadEnv();

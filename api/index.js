/**
 * Vercel serverless entry for the backend.
 * Every /api/* request is rewritten here (see vercel.json) and handled by the Express app.
 * The database pool is created lazily and reused while the function instance stays warm.
 */
module.exports = require('../backend/src/app');

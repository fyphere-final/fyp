const { HttpError } = require('../utils/httpError');

function notFoundHandler(req, _res, next) {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: { message: err.message, details: err.details } });
  }
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { message: 'Malformed JSON body' } });
  }
  if (err?.code === 'ESOCKET' || err?.code === 'ELOGIN' || err?.code === 'ETIMEOUT' || err?.code === 'ECONNCLOSED') {
    console.error('[db]', err.code, err.message);
    return res.status(503).json({ error: { message: 'Database is unavailable. Please try again shortly.' } });
  }
  console.error('[error]', err);
  res.status(500).json({ error: { message: 'Something went wrong. Please try again.' } });
}

module.exports = { notFoundHandler, errorHandler };

const { verifyAccess } = require('../utils/token');
const { unauthorized, forbidden } = require('../utils/httpError');

function requireAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return next(unauthorized());
  try {
    const p = verifyAccess(token);
    if (p.typ === 'session') return next(unauthorized('Invalid token'));
    req.user = { id: p.sub, role: p.role, sid: p.sid ?? null };
    next();
  } catch {
    next(unauthorized('Session expired, please sign in again'));
  }
}

const requireRole = (...roles) => (req, _res, next) =>
  roles.includes(req.user?.role) ? next() : next(forbidden('You do not have access to this resource'));

/** Student endpoints need a linked Students row. */
function requireStudent(req, res, next) {
  requireRole('student')(req, res, (err) => {
    if (err) return next(err);
    if (!req.user.sid) return next(forbidden('Student profile is not linked to this account'));
    next();
  });
}

module.exports = { requireAuth, requireRole, requireStudent };

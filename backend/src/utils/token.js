const jwt = require('jsonwebtoken');
const env = require('../config/env');

const signAccess = (payload) => jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
const verifyAccess = (t) => jwt.verify(t, env.jwtSecret);

/**
 * Signed "session" token handed out with a quiz/exercise. It lists exactly which
 * questions were served so a client cannot submit a cherry-picked subset.
 */
const signSession = (payload) => jwt.sign({ ...payload, typ: 'session' }, env.jwtSecret, { expiresIn: '3h' });
function verifySession(t) {
  const p = jwt.verify(t, env.jwtSecret);
  if (p.typ !== 'session') throw new Error('bad token type');
  return p;
}

module.exports = { signAccess, verifyAccess, signSession, verifySession };

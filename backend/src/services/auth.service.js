const bcrypt = require('bcryptjs');
const { sql, getPool } = require('../config/db');
const { signAccess } = require('../utils/token');
const { unauthorized, notFound } = require('../utils/httpError');
const { cleanText } = require('../utils/text');

// Pre-computed hash so unknown e-mails cost the same as wrong passwords (no user enumeration by timing).
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

function toUser(row) {
  return {
    id: row.UserId,
    email: row.Email,
    role: row.Role,
    sid: row.Sid ?? null,
    name: cleanText(row.DisplayName) || cleanText(row.fullname) || row.Email.split('@')[0],
  };
}

async function login(email, password) {
  const pool = await getPool();
  const rs = await pool
    .request()
    .input('email', sql.NVarChar(256), email.toLowerCase())
    .query(`SELECT TOP 1 u.UserId, u.Email, u.PasswordHash, u.Role, u.DisplayName, u.Sid, u.IsActive, s.fullname
            FROM Users u LEFT JOIN Students s ON s.Sid = u.Sid WHERE u.Email = @email`);
  const row = rs.recordset[0];
  const ok = await bcrypt.compare(password, row ? row.PasswordHash : DUMMY_HASH);
  if (!row || !ok || !row.IsActive) throw unauthorized('Incorrect email or password');

  const user = toUser(row);
  const token = signAccess({ sub: user.id, role: user.role, sid: user.sid });
  return { token, user };
}

async function getMe(userId) {
  const pool = await getPool();
  const rs = await pool
    .request()
    .input('id', sql.Int, userId)
    .query(`SELECT u.UserId, u.Email, u.Role, u.DisplayName, u.Sid, s.fullname
            FROM Users u LEFT JOIN Students s ON s.Sid = u.Sid WHERE u.UserId = @id AND u.IsActive = 1`);
  if (!rs.recordset[0]) throw notFound('Account not found');
  return toUser(rs.recordset[0]);
}

module.exports = { login, getMe };

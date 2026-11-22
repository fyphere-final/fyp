/* Creates the demo accounts shown on the login screen. Idempotent. */
const bcrypt = require('bcryptjs');
const env = require('../src/config/env');
const { sql, getPool, closePool } = require('../src/config/db');

(async () => {
  const pool = await getPool();
  const hash = await bcrypt.hash(env.demoPassword, 10);

  // Mockup greets "احمد رضا" -> Students row "Ahmed Raza" (Sid 2 in the original script)
  const st = await pool.request().query("SELECT TOP 1 Sid FROM dbo.Students WHERE fullname = 'Ahmed Raza'");
  let sid = st.recordset[0]?.Sid;
  if (!sid) {
    const any = await pool.request().query('SELECT TOP 1 Sid FROM dbo.Students ORDER BY Sid');
    sid = any.recordset[0]?.Sid;
  }
  if (!sid) throw new Error('No rows in Students. Run Online-Obaid-Qaida.sql first.');

  const upsert = async (email, role, name, studentId) => {
    await pool
      .request()
      .input('email', sql.NVarChar(256), email)
      .input('hash', sql.NVarChar(100), hash)
      .input('role', sql.VarChar(10), role)
      .input('name', sql.NVarChar(100), name)
      .input('sid', sql.Int, studentId)
      .query(`
        IF EXISTS (SELECT 1 FROM dbo.Users WHERE Email = @email)
          UPDATE dbo.Users SET PasswordHash=@hash, Role=@role, DisplayName=@name, Sid=@sid WHERE Email=@email
        ELSE
          INSERT INTO dbo.Users (Email, PasswordHash, Role, DisplayName, Sid) VALUES (@email, @hash, @role, @name, @sid)`);
  };
  await upsert('student@gmail.com', 'student', 'احمد رضا', sid);
  await upsert('teacher@gmail.com', 'teacher', 'استاد', null);
  console.log('Demo users ready: student@gmail.com / teacher@gmail.com');
  await closePool();
})().catch((e) => {
  console.error('seed failed:', e.message);
  process.exit(1);
});

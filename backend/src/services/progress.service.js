const { sql, getPool } = require('../config/db');
const { getCurriculum } = require('./curriculum.service');

/** Data for the Student Progress screen: overall %, per-unit/lesson scores and history. */
async function getProgress(sid) {
  const curriculum = await getCurriculum(sid);
  const pool = await getPool();
  const rs = await pool
    .request()
    .input('sid', sql.Int, sid)
    .query(`SELECT TOP 30 a.AttemptId, a.unitno, a.lessonNo, a.Kind, a.ScorePct, a.Correct, a.Total, a.Passed, a.CreatedAt
            FROM QuizAttempts a WHERE a.Sid = @sid ORDER BY a.CreatedAt DESC, a.AttemptId DESC`);

  const titles = new Map();
  for (const u of curriculum.units) for (const l of u.lessons) titles.set(`${u.unitno}:${l.lessonNo}`, { l: l.title, u: u.title });

  const history = rs.recordset.map((a) => ({
    attemptId: a.AttemptId,
    unitno: a.unitno,
    lessonNo: a.lessonNo,
    unitTitle: titles.get(`${a.unitno}:${a.lessonNo}`)?.u ?? null,
    lessonTitle: titles.get(`${a.unitno}:${a.lessonNo}`)?.l ?? null,
    kind: a.Kind,
    scorePct: a.ScorePct,
    correct: a.Correct,
    total: a.Total,
    passed: !!a.Passed,
    createdAt: a.CreatedAt,
  }));

  return {
    overallPercent: curriculum.overallPercent,
    completedLessons: curriculum.completedLessons,
    totalLessons: curriculum.totalLessons,
    passPercent: curriculum.passPercent,
    units: curriculum.units,
    history,
  };
}

module.exports = { getProgress };

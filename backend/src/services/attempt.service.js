const { sql, getPool } = require('../config/db');
const env = require('../config/env');
const { notFound, conflict } = require('../utils/httpError');
const { getCurriculum, findLesson, findNextLesson } = require('./curriculum.service');

/** Persist an attempt + per-question review and update StudentProgress (quiz / exercise only). */
async function saveAttempt({ sid, unitno, lessonNo, kind, sourceAttemptId = null, review }) {
  const total = review.length;
  const correct = review.filter((r) => r.isCorrect).length;
  const scorePct = total ? Math.round((correct / total) * 100) : 0;
  const passed = scorePct >= env.passPercent;

  const pool = await getPool();
  const tx = new sql.Transaction(pool);
  await tx.begin();
  try {
    const ins = await new sql.Request(tx)
      .input('sid', sql.Int, sid)
      .input('u', sql.Int, unitno)
      .input('l', sql.Int, lessonNo)
      .input('kind', sql.VarChar(10), kind)
      .input('src', sql.Int, sourceAttemptId)
      .input('pct', sql.TinyInt, scorePct)
      .input('c', sql.SmallInt, correct)
      .input('t', sql.SmallInt, total)
      .input('p', sql.Bit, passed)
      .query(`INSERT INTO QuizAttempts (Sid, unitno, lessonNo, Kind, SourceAttemptId, ScorePct, Correct, Total, Passed)
              OUTPUT INSERTED.AttemptId
              VALUES (@sid, @u, @l, @kind, @src, @pct, @c, @t, @p)`);
    const attemptId = ins.recordset[0].AttemptId;

    for (const r of review) {
      await new sql.Request(tx)
        .input('a', sql.Int, attemptId)
        .input('q', sql.VarChar(40), r.qid)
        .input('p', sql.NVarChar(400), (r.prompt || '').slice(0, 400))
        .input('ch', sql.NVarChar(400), r.chosen == null ? null : String(r.chosen).slice(0, 400))
        .input('co', sql.NVarChar(400), (r.correct || '').slice(0, 400))
        .input('ok', sql.Bit, r.isCorrect)
        .query(`INSERT INTO QuizAttemptAnswers (AttemptId, QId, Prompt, Chosen, Correct, IsCorrect)
                VALUES (@a, @q, @p, @ch, @co, @ok)`);
    }

    // Mirror exercise answers into the original StudentAttempt table (only rows backed by ExerciseQuestion).
    if (kind === 'exercise') {
      for (const r of review) {
        const m = /^[tc]:e(\d+):(\d+)$/.exec(r.qid);
        if (!m || r.chosen == null) continue;
        await new sql.Request(tx)
          .input('sid', sql.Int, sid).input('u', sql.Int, unitno).input('l', sql.Int, lessonNo)
          .input('eid', sql.Int, parseInt(m[1], 10)).input('wno', sql.Int, parseInt(m[2], 10))
          .input('ans', sql.NVarChar(300), String(r.chosen).slice(0, 300))
          .query(`MERGE StudentAttempt WITH (HOLDLOCK) AS t
                  USING (SELECT @sid AS sid, @u AS unitno, @l AS lessonNo, @eid AS eid, @wno AS wno) AS s
                    ON t.sid = s.sid AND t.unitno = s.unitno AND t.lessonNo = s.lessonNo AND t.eid = s.eid AND t.wno = s.wno
                  WHEN MATCHED THEN UPDATE SET answer = @ans
                  WHEN NOT MATCHED THEN INSERT (sid, unitno, lessonNo, eid, wno, answer) VALUES (@sid, @u, @l, @eid, @wno, @ans);`);
      }
    }

    // Re-assess is practice only: recorded in history, never changes best scores / unlocks.
    if (kind === 'quiz' || kind === 'exercise') {
      const col = kind === 'quiz' ? 'QuizBestPct' : 'ExerciseBestPct';
      await new sql.Request(tx)
        .input('sid', sql.Int, sid)
        .input('u', sql.Int, unitno)
        .input('l', sql.Int, lessonNo)
        .input('pct', sql.TinyInt, scorePct)
        .input('done', sql.Bit, kind === 'quiz' && passed)
        .query(`MERGE StudentProgress WITH (HOLDLOCK) AS t
                USING (SELECT @sid AS Sid, @u AS unitno, @l AS lessonNo) AS s
                  ON t.Sid = s.Sid AND t.unitno = s.unitno AND t.lessonNo = s.lessonNo
                WHEN MATCHED THEN UPDATE SET
                  ${col} = CASE WHEN t.${col} IS NULL OR t.${col} < @pct THEN @pct ELSE t.${col} END,
                  Completed = CASE WHEN t.Completed = 1 OR @done = 1 THEN 1 ELSE 0 END,
                  UpdatedAt = SYSUTCDATETIME()
                WHEN NOT MATCHED THEN INSERT (Sid, unitno, lessonNo, ${col}, Completed)
                  VALUES (s.Sid, s.unitno, s.lessonNo, @pct, @done);`);
    }
    await tx.commit();
    return attemptId;
  } catch (e) {
    await tx.rollback().catch(() => {});
    throw e;
  }
}

/** Full result payload used by the Result / Re-assess-result screens. */
async function getAttemptResult(sid, attemptId) {
  const pool = await getPool();
  const head = await pool
    .request()
    .input('id', sql.Int, attemptId)
    .input('sid', sql.Int, sid)
    .query(`SELECT AttemptId, unitno, lessonNo, Kind, SourceAttemptId, ScorePct, Correct, Total, Passed, CreatedAt
            FROM QuizAttempts WHERE AttemptId = @id AND Sid = @sid`);
  const a = head.recordset[0];
  if (!a) throw notFound('Result not found');

  const rows = await pool
    .request()
    .input('id', sql.Int, attemptId)
    .query(`SELECT QId, Prompt, Chosen, Correct, IsCorrect FROM QuizAttemptAnswers WHERE AttemptId = @id ORDER BY QId`);
  const review = rows.recordset.map((r) => ({
    qid: r.QId,
    prompt: r.Prompt,
    chosen: r.Chosen,
    correct: r.Correct,
    isCorrect: !!r.IsCorrect,
  }));

  const curriculum = await getCurriculum(sid);
  const found = findLesson(curriculum, a.unitno, a.lessonNo);
  return {
    attemptId: a.AttemptId,
    kind: a.Kind,
    sourceAttemptId: a.SourceAttemptId,
    unitno: a.unitno,
    lessonNo: a.lessonNo,
    unitTitle: found?.unit.title ?? null,
    lessonTitle: found?.lesson.title ?? null,
    scorePct: a.ScorePct,
    correct: a.Correct,
    total: a.Total,
    wrong: a.Total - a.Correct,
    passed: !!a.Passed,
    passPercent: env.passPercent,
    createdAt: a.CreatedAt,
    review,
    lessonCompleted: !!found?.lesson.completed,
    nextLesson: findNextLesson(curriculum, a.unitno, a.lessonNo),
  };
}

/** Wrong `q:<wno>` answers of a quiz/reassess attempt, for the re-assess flow. */
async function getWrongQuizWnos(sid, attemptId, unitno, lessonNo) {
  const pool = await getPool();
  const rs = await pool
    .request()
    .input('id', sql.Int, attemptId)
    .input('sid', sql.Int, sid)
    .input('u', sql.Int, unitno)
    .input('l', sql.Int, lessonNo)
    .query(`SELECT a.QId FROM QuizAttemptAnswers a JOIN QuizAttempts t ON t.AttemptId = a.AttemptId
            WHERE t.AttemptId = @id AND t.Sid = @sid AND t.unitno = @u AND t.lessonNo = @l
              AND t.Kind IN ('quiz','reassess') AND a.IsCorrect = 0 AND a.QId LIKE 'q:%'`);
  const wnos = rs.recordset.map((r) => parseInt(r.QId.slice(2), 10)).filter(Number.isFinite);
  if (!wnos.length) throw conflict('There are no incorrect answers to retry for this attempt');
  return wnos;
}

module.exports = { saveAttempt, getAttemptResult, getWrongQuizWnos };

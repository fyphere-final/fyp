const { sql, getPool } = require('../config/db');
const env = require('../config/env');
const { safeTitle } = require('../utils/text');

const VALID_MEANING = `w.Meaning IS NOT NULL AND LTRIM(RTRIM(REPLACE(w.Meaning, N'?', N''))) <> N''`;
const VALID_WORD = `w.word IS NOT NULL AND LTRIM(RTRIM(REPLACE(w.word, N'?', N''))) <> N''`;

/**
 * Whole curriculum for one student, with lock / completion state.
 * Rules:
 *  - A lesson is "playable" if it has at least one word with a usable meaning
 *    (lessons with missing data are shown as unavailable and never block progress).
 *  - Lesson N+1 unlocks when lesson N's quiz was passed (Completed).
 *  - Unit N+1 unlocks when every playable lesson of unit N is completed.
 */
async function getCurriculum(sid) {
  const pool = await getPool();
  const lessonsRs = await pool.request().query(`
    SELECT l.unitno, l.lessonNo, l.Title AS lessonTitle, u.unitTitle,
      (SELECT COUNT(*) FROM Words w WHERE w.unitno = l.unitno AND w.lessonNo = l.lessonNo
         AND ${VALID_WORD} AND ${VALID_MEANING}) AS validWords,
      (SELECT COUNT(*) FROM Words w WHERE w.unitno = l.unitno AND w.lessonNo = l.lessonNo
         AND ${VALID_WORD}) AS totalWords
    FROM Lessons l JOIN units u ON u.unitno = l.unitno
    ORDER BY l.unitno, l.lessonNo`);
  const progRs = await pool
    .request()
    .input('sid', sql.Int, sid)
    .query(`SELECT unitno, lessonNo, SabaqDone, ExerciseBestPct, QuizBestPct, Completed, UpdatedAt
            FROM StudentProgress WHERE Sid = @sid`);

  const prog = new Map(progRs.recordset.map((p) => [`${p.unitno}:${p.lessonNo}`, p]));
  const unitsMap = new Map();

  for (const r of lessonsRs.recordset) {
    if (!unitsMap.has(r.unitno)) {
      unitsMap.set(r.unitno, {
        unitno: r.unitno,
        title: safeTitle(r.unitTitle, `یونٹ ${r.unitno}`),
        lessons: [],
      });
    }
    const p = prog.get(`${r.unitno}:${r.lessonNo}`);
    unitsMap.get(r.unitno).lessons.push({
      unitno: r.unitno,
      lessonNo: r.lessonNo,
      title: safeTitle(r.lessonTitle, `سبق ${r.lessonNo}`),
      wordCount: r.totalWords,
      playable: r.validWords > 0,
      sabaqDone: !!p?.SabaqDone,
      exerciseBestPct: p?.ExerciseBestPct ?? null,
      quizBestPct: p?.QuizBestPct ?? null,
      completed: !!p?.Completed,
    });
  }

  // Units without any playable lesson are not shown at all.
  const units = [...unitsMap.values()].filter((u) => u.lessons.some((l) => l.playable));

  let prevUnitComplete = true;
  for (const unit of units) {
    unit.locked = !prevUnitComplete;
    let prevLessonDone = true;
    for (const l of unit.lessons) {
      if (!l.playable) {
        l.locked = true;
        l.unavailable = true;
        continue;
      }
      l.unavailable = false;
      l.locked = unit.locked || !prevLessonDone;
      prevLessonDone = l.completed;
    }
    const playable = unit.lessons.filter((l) => l.playable);
    unit.lessonCount = playable.length;
    unit.completedCount = playable.filter((l) => l.completed).length;
    unit.percent = unit.lessonCount ? Math.round((unit.completedCount / unit.lessonCount) * 100) : 0;
    unit.complete = unit.lessonCount > 0 && unit.completedCount === unit.lessonCount;
    prevUnitComplete = unit.complete;
  }

  const totalLessons = units.reduce((n, u) => n + u.lessonCount, 0);
  const doneLessons = units.reduce((n, u) => n + u.completedCount, 0);
  return {
    units,
    totalLessons,
    completedLessons: doneLessons,
    overallPercent: totalLessons ? Math.round((doneLessons / totalLessons) * 100) : 0,
    passPercent: env.passPercent,
  };
}

/** The lesson a student should continue with: first unlocked & incomplete one. */
function findResume(curriculum) {
  for (const u of curriculum.units) {
    if (u.locked) continue;
    for (const l of u.lessons) {
      if (!l.locked && !l.completed && l.playable) return { unit: u, lesson: l, allDone: false };
    }
  }
  const lastUnit = curriculum.units[curriculum.units.length - 1];
  const lastLesson = lastUnit?.lessons.filter((l) => l.playable).pop();
  return lastUnit ? { unit: lastUnit, lesson: lastLesson, allDone: true } : null;
}

/** Next playable lesson after (unitno, lessonNo) in curriculum order. */
function findNextLesson(curriculum, unitno, lessonNo) {
  const flat = curriculum.units.flatMap((u) => u.lessons.filter((l) => l.playable).map((l) => ({ u, l })));
  const i = flat.findIndex((x) => x.l.unitno === unitno && x.l.lessonNo === lessonNo);
  if (i < 0 || i === flat.length - 1) return null;
  const { u, l } = flat[i + 1];
  return { unitno: l.unitno, lessonNo: l.lessonNo, title: l.title, unitTitle: u.title, locked: l.locked };
}

function findLesson(curriculum, unitno, lessonNo) {
  for (const u of curriculum.units) {
    if (u.unitno !== unitno) continue;
    const l = u.lessons.find((x) => x.lessonNo === lessonNo);
    if (l) return { unit: u, lesson: l };
  }
  return null;
}

module.exports = { getCurriculum, findResume, findNextLesson, findLesson, VALID_MEANING, VALID_WORD };

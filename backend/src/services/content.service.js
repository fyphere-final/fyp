const { sql, getPool } = require('../config/db');
const env = require('../config/env');
const { VALID_MEANING, VALID_WORD } = require('./curriculum.service');
const { cleanText, hasText, sameAnswer, sameOption, shuffle, uniqueBy, normalizeAnswer } = require('../utils/text');
const { signSession } = require('../utils/token');
const { badRequest, conflict } = require('../utils/httpError');

const EXERCISE_PER_PART = 5;

/* ----------------------------- shared loaders ----------------------------- */

async function loadWords(unitno, lessonNo, { onlyWithMeaning = false } = {}) {
  const pool = await getPool();
  const rs = await pool
    .request()
    .input('u', sql.Int, unitno)
    .input('l', sql.Int, lessonNo)
    .query(`SELECT w.wno, w.word, w.Meaning AS meaning FROM Words w
            WHERE w.unitno = @u AND w.lessonNo = @l AND ${VALID_WORD}
            ${onlyWithMeaning ? `AND ${VALID_MEANING}` : ''}
            ORDER BY w.wno`);
  return rs.recordset.map((r) => ({ wno: r.wno, word: cleanText(r.word), meaning: cleanText(r.meaning) }));
}

/** Distinct values used as wrong options. Unit-first; tops up from the whole table if the unit is small. */
async function distractorPool(unitno, column) {
  const pool = await getPool();
  const col = column === 'word' ? 'word' : 'Meaning';
  const valid = column === 'word' ? VALID_WORD : `${VALID_WORD} AND ${VALID_MEANING}`;
  const unitRs = await pool
    .request()
    .input('u', sql.Int, unitno)
    .query(`SELECT DISTINCT w.${col} AS v FROM Words w WHERE w.unitno = @u AND ${valid}`);
  let values = unitRs.recordset.map((r) => cleanText(r.v)).filter(Boolean);
  if (uniqueBy(values, normalizeAnswer).length < 12) {
    const allRs = await pool
      .request()
      .query(`SELECT DISTINCT TOP 300 w.${col} AS v FROM Words w WHERE ${valid} ORDER BY w.${col}`);
    values = values.concat(allRs.recordset.map((r) => cleanText(r.v)).filter(Boolean));
  }
  return uniqueBy(values, normalizeAnswer);
}

const HARAKAT = /[\u064B-\u065F\u0670]/;
const wordCount = (v) => v.trim().split(/\s+/).length;

/**
 * 1 correct + 3 distractors. Distractors are chosen to look like the answer
 * (same diacritics state, same number of words, similar length) so the right
 * option cannot be guessed from its form alone.
 */
function buildOptions(correct, pool, extra = []) {
  const candidates = uniqueBy([...extra, ...pool], normalizeAnswer).filter((v) => !sameAnswer(v, correct));
  const score = (v) =>
    (HARAKAT.test(v) === HARAKAT.test(correct) ? 0 : 20) +
    Math.abs(wordCount(v) - wordCount(correct)) * 10 +
    Math.abs(v.length - correct.length) +
    Math.random() * 4; // jitter so repeated quizzes vary
  const best = candidates.map((v) => ({ v, s: score(v) })).sort((a, b) => a.s - b.s).slice(0, 3).map((x) => x.v);
  return shuffle([correct, ...best]);
}

/* --------------------------------- Sabaq ---------------------------------- */

const SABAQ_EXAMPLES = 2;

/**
 * Sabaq words (study content). The first SABAQ_EXAMPLES words with a meaning are shown
 * pre-filled as worked examples; the student types the rest and checks via /sabaq/check.
 * Words with missing/corrupt meanings are flagged (meaningMissing), never broken.
 */
async function getSabaqWords(unitno, lessonNo) {
  const words = await loadWords(unitno, lessonNo);
  let examples = 0;
  return words.map((w) => {
    const isExample = !!w.meaning && examples < SABAQ_EXAMPLES && (examples++, true);
    return {
      wno: w.wno,
      word: w.word,
      meaningMissing: !w.meaning,
      example: isExample,
      meaning: w.meaning,
    };
  });
}

/** Lenient check of typed meanings: returns the correct meaning for each answered word. */
async function checkSabaq(unitno, lessonNo, answers) {
  const words = await loadWords(unitno, lessonNo, { onlyWithMeaning: true });
  const byWno = new Map(words.map((w) => [String(w.wno), w]));
  const results = {};
  for (const [wno, typed] of Object.entries(answers)) {
    const w = byWno.get(wno);
    if (!w) continue;
    results[wno] = { correct: sameAnswer(typed, w.meaning), meaning: w.meaning };
  }
  const values = Object.values(results);
  return { results, correctCount: values.filter((r) => r.correct).length, checked: values.length };
}

async function markSabaqDone(sid, unitno, lessonNo) {
  const pool = await getPool();
  await pool
    .request()
    .input('sid', sql.Int, sid)
    .input('u', sql.Int, unitno)
    .input('l', sql.Int, lessonNo)
    .query(`MERGE StudentProgress WITH (HOLDLOCK) AS t
            USING (SELECT @sid AS Sid, @u AS unitno, @l AS lessonNo) AS s
              ON t.Sid = s.Sid AND t.unitno = s.unitno AND t.lessonNo = s.lessonNo
            WHEN MATCHED THEN UPDATE SET SabaqDone = 1, UpdatedAt = SYSUTCDATETIME()
            WHEN NOT MATCHED THEN INSERT (Sid, unitno, lessonNo, SabaqDone) VALUES (s.Sid, s.unitno, s.lessonNo, 1);`);
}

/* ---------------------------- Quiz (jaiza) / reassess --------------------- */

/**
 * Builds multiple-choice questions: Arabic word -> choose the Urdu meaning.
 * `wnos` restricts to specific words (re-assess of previously wrong answers).
 */
async function buildQuiz(sid, unitno, lessonNo, { wnos = null, kind = 'quiz', sourceAttemptId = null } = {}) {
  const words = await loadWords(unitno, lessonNo, { onlyWithMeaning: true });
  if (!words.length) throw conflict('This lesson has no quiz content yet');

  const picked = wnos
    ? words.filter((w) => wnos.includes(w.wno))
    : shuffle(words).slice(0, Math.min(env.quizSize, words.length));
  if (!picked.length) throw conflict('No questions available');

  const pool = await distractorPool(unitno, 'meaning');
  const questions = picked.map((w) => ({
    qid: `q:${w.wno}`,
    prompt: w.word,
    options: buildOptions(w.meaning, pool),
  }));
  const token = signSession({ sid, u: unitno, l: lessonNo, kind, qids: questions.map((q) => q.qid), src: sourceAttemptId });
  return { questions, token, total: questions.length };
}

async function gradeQuiz(unitno, lessonNo, qids, answers) {
  const words = await loadWords(unitno, lessonNo, { onlyWithMeaning: true });
  const byWno = new Map(words.map((w) => [w.wno, w]));
  return qids.map((qid) => {
    const w = byWno.get(parseInt(qid.slice(2), 10));
    if (!w) throw badRequest('Quiz content changed, please start again');
    const chosen = answers[qid] ?? null;
    return { qid, prompt: w.word, chosen, correct: w.meaning, isCorrect: sameOption(chosen, w.meaning) };
  });
}

/* ----------------------------- Exercise (mashq) --------------------------- */

async function exerciseRows(unitno, lessonNo, typeNo) {
  const pool = await getPool();
  const rs = await pool
    .request()
    .input('u', sql.Int, unitno)
    .input('l', sql.Int, lessonNo)
    .input('t', sql.Int, typeNo)
    .query(`SELECT q.eid, q.wno, q.word, q.solution
            FROM ExerciseQuestion q JOIN Exercise e ON e.eid = q.eid
            WHERE q.unitno = @u AND q.lessonNo = @l AND e.typeNo = @t
            ORDER BY q.eid, q.wno`);
  return rs.recordset
    .map((r) => ({ eid: r.eid, wno: r.wno, word: cleanText(r.word), solution: cleanText(r.solution) }))
    .filter((r) => hasText(r.word) && hasText(r.solution));
}

/**
 * Mashq = (1) type the meaning of Arabic words, (2) pick the correct Arabic spelling.
 * Uses ExerciseQuestion rows (types 1 and 2) when the lesson has them, otherwise
 * generates equivalent questions from Words so every lesson stays usable.
 */
async function buildExercise(sid, unitno, lessonNo) {
  const typeRows = (await exerciseRows(unitno, lessonNo, 1)).slice(0, EXERCISE_PER_PART);
  const choiceRows = (await exerciseRows(unitno, lessonNo, 2)).slice(0, EXERCISE_PER_PART);
  const words = await loadWords(unitno, lessonNo, { onlyWithMeaning: true });

  const typeQuestions = typeRows.length
    ? typeRows.map((r) => ({ qid: `t:e${r.eid}:${r.wno}`, prompt: r.word }))
    : shuffle(words)
        .slice(0, EXERCISE_PER_PART)
        .map((w) => ({ qid: `t:w:${w.wno}`, prompt: w.word }));

  let choiceQuestions = [];
  if (choiceRows.length) {
    const lessonPool = choiceRows.map((r) => r.solution);
    const wordPool = await distractorPool(unitno, 'word');
    choiceQuestions = choiceRows.map((r) => ({
      qid: `c:e${r.eid}:${r.wno}`,
      prompt: r.word,
      options: buildOptions(r.solution, wordPool, lessonPool),
    }));
  } else {
    const wordPool = await distractorPool(unitno, 'word');
    choiceQuestions = shuffle(words)
      .slice(0, EXERCISE_PER_PART)
      .map((w) => ({ qid: `c:w:${w.wno}`, prompt: w.meaning, options: buildOptions(w.word, wordPool) }));
  }

  if (!typeQuestions.length && !choiceQuestions.length) throw conflict('This lesson has no exercise content yet');

  const qids = [...typeQuestions, ...choiceQuestions].map((q) => q.qid);
  return {
    sections: [
      typeQuestions.length && { kind: 'type', questions: typeQuestions },
      ...choiceQuestions.map((q) => ({ kind: 'choice', questions: [q] })),
    ].filter(Boolean),
    token: signSession({ sid, u: unitno, l: lessonNo, kind: 'exercise', qids }),
    total: qids.length,
  };
}

async function resolveExerciseAnswer(unitno, lessonNo, qid) {
  const m = /^([tc]):(?:e(\d+)|w):(\d+)$/.exec(qid);
  if (!m) throw badRequest('Invalid question id');
  const [, mode, eid, wnoStr] = m;
  const wno = parseInt(wnoStr, 10);
  const pool = await getPool();
  const req = pool.request().input('u', sql.Int, unitno).input('l', sql.Int, lessonNo).input('wno', sql.Int, wno);

  if (eid) {
    const rs = await req
      .input('eid', sql.Int, parseInt(eid, 10))
      .query('SELECT word, solution FROM ExerciseQuestion WHERE unitno=@u AND lessonNo=@l AND eid=@eid AND wno=@wno');
    const r = rs.recordset[0];
    if (!r) throw badRequest('Exercise content changed, please start again');
    return { mode, prompt: cleanText(r.word), correct: cleanText(r.solution) };
  }
  const rs = await req.query(
    'SELECT word, Meaning AS meaning FROM Words WHERE unitno=@u AND lessonNo=@l AND wno=@wno'
  );
  const r = rs.recordset[0];
  if (!r) throw badRequest('Exercise content changed, please start again');
  return mode === 't'
    ? { mode, prompt: cleanText(r.word), correct: cleanText(r.meaning) }
    : { mode, prompt: cleanText(r.meaning), correct: cleanText(r.word) };
}

async function gradeExercise(unitno, lessonNo, qids, answers) {
  const out = [];
  for (const qid of qids) {
    const q = await resolveExerciseAnswer(unitno, lessonNo, qid);
    const given = answers[qid] ?? null;
    out.push({
      qid,
      prompt: q.prompt,
      chosen: given,
      correct: q.correct,
      isCorrect: q.mode === 't' ? sameAnswer(given, q.correct) : sameOption(given, q.correct),
    });
  }
  return out;
}

module.exports = { getSabaqWords, checkSabaq, markSabaqDone, buildQuiz, gradeQuiz, buildExercise, gradeExercise };

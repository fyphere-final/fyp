const curriculum = require('../services/curriculum.service');
const content = require('../services/content.service');
const attempts = require('../services/attempt.service');
const progress = require('../services/progress.service');
const auth = require('../services/auth.service');
const { verifySession } = require('../utils/token');
const { badRequest, notFound } = require('../utils/httpError');

const lessonInfo = (req) => ({
  unitno: req.unit.unitno,
  unitTitle: req.unit.title,
  lessonNo: req.lesson.lessonNo,
  lessonTitle: req.lesson.title,
});

/** Validates the signed session token returned with a quiz / exercise. */
function readSession(req, kind) {
  let s;
  try {
    s = verifySession(req.body.token);
  } catch {
    throw badRequest('This attempt has expired. Please start again.');
  }
  if (s.sid !== req.user.sid || s.u !== req.unit.unitno || s.l !== req.lesson.lessonNo || s.kind !== kind) {
    throw badRequest('Invalid attempt');
  }
  return s;
}

exports.dashboard = async (req, res) => {
  const [user, c] = await Promise.all([auth.getMe(req.user.id), curriculum.getCurriculum(req.user.sid)]);
  const resume = curriculum.findResume(c);
  res.json({
    student: { name: user.name },
    overallPercent: c.overallPercent,
    completedLessons: c.completedLessons,
    totalLessons: c.totalLessons,
    resume: resume && {
      allDone: resume.allDone,
      unitno: resume.unit.unitno,
      unitTitle: resume.unit.title,
      lessonNo: resume.lesson.lessonNo,
      lessonTitle: resume.lesson.title,
    },
    units: c.units.map((u) => ({
      unitno: u.unitno,
      title: u.title,
      locked: u.locked,
      lessonCount: u.lessonCount,
      completedCount: u.completedCount,
      percent: u.percent,
    })),
  });
};

exports.units = async (req, res) => {
  const c = await curriculum.getCurriculum(req.user.sid);
  res.json({
    units: c.units.map((u) => ({
      unitno: u.unitno, title: u.title, locked: u.locked,
      lessonCount: u.lessonCount, completedCount: u.completedCount, percent: u.percent,
    })),
  });
};

exports.unitLessons = async (req, res) => {
  const c = await curriculum.getCurriculum(req.user.sid);
  const unit = c.units.find((u) => u.unitno === Number(req.params.unitno));
  if (!unit) throw notFound('Unit not found');
  res.json({ unit: { unitno: unit.unitno, title: unit.title, locked: unit.locked, percent: unit.percent }, lessons: unit.lessons, passPercent: c.passPercent });
};

exports.sabaq = async (req, res) => {
  res.json({ ...lessonInfo(req), words: await content.getSabaqWords(req.unit.unitno, req.lesson.lessonNo) });
};

exports.sabaqCheck = async (req, res) => {
  res.json(await content.checkSabaq(req.unit.unitno, req.lesson.lessonNo, req.body.answers));
};

exports.sabaqComplete = async (req, res) => {
  await content.markSabaqDone(req.user.sid, req.unit.unitno, req.lesson.lessonNo);
  res.json({ ok: true });
};

exports.exercise = async (req, res) => {
  res.json({ ...lessonInfo(req), ...(await content.buildExercise(req.user.sid, req.unit.unitno, req.lesson.lessonNo)) });
};

exports.exerciseSubmit = async (req, res) => {
  const s = readSession(req, 'exercise');
  const review = await content.gradeExercise(req.unit.unitno, req.lesson.lessonNo, s.qids, req.body.answers);
  const attemptId = await attempts.saveAttempt({
    sid: req.user.sid, unitno: req.unit.unitno, lessonNo: req.lesson.lessonNo, kind: 'exercise', review,
  });
  res.status(201).json(await attempts.getAttemptResult(req.user.sid, attemptId));
};

exports.quiz = async (req, res) => {
  res.json({
    ...lessonInfo(req),
    ...(await content.buildQuiz(req.user.sid, req.unit.unitno, req.lesson.lessonNo)),
  });
};

exports.quizSubmit = async (req, res) => {
  const s = readSession(req, 'quiz');
  const review = await content.gradeQuiz(req.unit.unitno, req.lesson.lessonNo, s.qids, req.body.answers);
  const attemptId = await attempts.saveAttempt({
    sid: req.user.sid, unitno: req.unit.unitno, lessonNo: req.lesson.lessonNo, kind: 'quiz', review,
  });
  res.status(201).json(await attempts.getAttemptResult(req.user.sid, attemptId));
};

exports.reassess = async (req, res) => {
  const attemptId = Number(req.query.attemptId);
  const wnos = await attempts.getWrongQuizWnos(req.user.sid, attemptId, req.unit.unitno, req.lesson.lessonNo);
  res.json({
    ...lessonInfo(req),
    sourceAttemptId: attemptId,
    ...(await content.buildQuiz(req.user.sid, req.unit.unitno, req.lesson.lessonNo, {
      wnos, kind: 'reassess', sourceAttemptId: attemptId,
    })),
  });
};

exports.reassessSubmit = async (req, res) => {
  const s = readSession(req, 'reassess');
  const review = await content.gradeQuiz(req.unit.unitno, req.lesson.lessonNo, s.qids, req.body.answers);
  const attemptId = await attempts.saveAttempt({
    sid: req.user.sid, unitno: req.unit.unitno, lessonNo: req.lesson.lessonNo,
    kind: 'reassess', sourceAttemptId: s.src ?? null, review,
  });
  res.status(201).json(await attempts.getAttemptResult(req.user.sid, attemptId));
};

exports.attempt = async (req, res) => {
  res.json(await attempts.getAttemptResult(req.user.sid, Number(req.params.attemptId)));
};

exports.progress = async (req, res) => {
  res.json(await progress.getProgress(req.user.sid));
};

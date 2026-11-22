const express = require('express');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const { requireAuth, requireStudent } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { lessonAccess } = require('../middlewares/lessonAccess');
const authCtl = require('../controllers/auth.controller');
const stu = require('../controllers/student.controller');

// async-safe handler wrapper (Express 4)
const h = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const int = z.coerce.number().int().positive();
const lessonParams = z.object({ unitno: int, lessonNo: int });
const answersBody = z.object({
  token: z.string().min(10).max(4000),
  answers: z.record(z.string().max(60), z.string().max(400).nullable()).refine((o) => Object.keys(o).length <= 60, 'Too many answers'),
});

const router = express.Router();

router.get('/health', (_req, res) => res.json({ status: 'ok' }));

/* ---- auth ---- */
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 50, standardHeaders: true, legacyHeaders: false,
  message: { error: { message: 'Too many attempts. Please try again later.' } } });
router.post('/auth/login', loginLimiter,
  validate({ body: z.object({ email: z.string().trim().toLowerCase().email().max(256), password: z.string().min(1).max(200) }) }),
  h(authCtl.login));
router.get('/auth/me', requireAuth, h(authCtl.me));

/* ---- student (Phase 1) ---- */
router.use(requireAuth, requireStudent);
router.get('/dashboard', h(stu.dashboard));
router.get('/progress', h(stu.progress));
router.get('/units', h(stu.units));
router.get('/units/:unitno/lessons', validate({ params: z.object({ unitno: int }) }), h(stu.unitLessons));
router.get('/attempts/:attemptId', validate({ params: z.object({ attemptId: int }) }), h(stu.attempt));

const lesson = express.Router({ mergeParams: true });
lesson.use(validate({ params: lessonParams }), h(lessonAccess));
lesson.get('/sabaq', h(stu.sabaq));
lesson.post('/sabaq/check', validate({ body: z.object({ answers: z.record(z.string().max(12), z.string().max(200)) }) }), h(stu.sabaqCheck));
lesson.post('/sabaq/complete', h(stu.sabaqComplete));
lesson.get('/exercise', h(stu.exercise));
lesson.post('/exercise/submit', validate({ body: answersBody }), h(stu.exerciseSubmit));
lesson.get('/quiz', h(stu.quiz));
lesson.post('/quiz/submit', validate({ body: answersBody }), h(stu.quizSubmit));
lesson.get('/reassess', validate({ query: z.object({ attemptId: int }) }), h(stu.reassess));
lesson.post('/reassess/submit', validate({ body: answersBody }), h(stu.reassessSubmit));
router.use('/lessons/:unitno/:lessonNo', lesson);

module.exports = router;

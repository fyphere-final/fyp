const { getCurriculum, findLesson } = require('../services/curriculum.service');
const { notFound, forbidden, conflict } = require('../utils/httpError');

/** Resolves :unitno/:lessonNo, enforces the unlock rule server-side. Sets req.lesson / req.unit. */
async function lessonAccess(req, _res, next) {
  try {
    // Express re-creates req.params per layer, so always coerce here.
    const unitno = Number(req.params.unitno);
    const lessonNo = Number(req.params.lessonNo);
    const curriculum = await getCurriculum(req.user.sid);
    const found = findLesson(curriculum, unitno, lessonNo);
    if (!found) return next(notFound('Lesson not found'));
    if (!found.lesson.playable) return next(conflict('یہ سبق ابھی دستیاب نہیں۔'));
    if (found.lesson.locked) return next(forbidden('اس سبق کو کھولنے کے لیے پچھلا سبق مکمل کریں۔'));
    req.unit = found.unit;
    req.lesson = found.lesson;
    next();
  } catch (e) {
    next(e);
  }
}

module.exports = { lessonAccess };

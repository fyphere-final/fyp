const { badRequest } = require('../utils/httpError');

/** validate({ body, params, query }) with zod schemas. Parsed values replace the originals. */
const validate = (schemas) => (req, _res, next) => {
  for (const part of ['params', 'query', 'body']) {
    if (!schemas[part]) continue;
    const r = schemas[part].safeParse(req[part]);
    if (!r.success) {
      const details = r.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
      return next(badRequest('Invalid input', details));
    }
    req[part] = r.data;
  }
  next();
};

module.exports = { validate };

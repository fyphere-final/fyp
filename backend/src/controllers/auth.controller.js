const auth = require('../services/auth.service');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  res.json(await auth.login(email, password));
};

exports.me = async (req, res) => {
  res.json({ user: await auth.getMe(req.user.id) });
};

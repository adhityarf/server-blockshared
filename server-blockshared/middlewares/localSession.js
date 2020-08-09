const localSession = (req, res, next) => {
  res.locals.custSess = req.session.custSess;
  next();
}

module.exports = localSession;
const passport = require('passport');
const { NotFound } = require('./errors');
const logger = require('./logger');

/**
 * Verify authorization token middleware.
 */
exports.isValidToken = (req, res, next) => {

  // A Custom passport (callback).
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) return next(err);

    // Passport strategy not found any user.
    if (!user) throw new NotFound(info.message);

    // Attach the user object to req.user
    req.user = user;
    next();

  })(req, res, next);
};

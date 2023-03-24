import passport from 'passport';

exports.passportCustomAuth = passport.authenticate('jwt', { session: false });
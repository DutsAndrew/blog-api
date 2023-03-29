import passport from 'passport';
const passportCustomAuth = passport.authenticate('jwt', { session: false });
export default passportCustomAuth;
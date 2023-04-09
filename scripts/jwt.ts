import { JwtPayload } from "jsonwebtoken";
import { DoneCallback } from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import dotenv from 'dotenv';
const User = require('../models/user');
dotenv.config();

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET,
};

module.exports = new JwtStrategy(options, async (jwt_payload: JwtPayload, done: DoneCallback) => {
  try {
    const findUser = await User.findOne({ email: jwt_payload.email });
    if (!findUser) {
      return done(null, false);
    };
    if (findUser) {
      if ((findUser as any).email === jwt_payload.email) {
        return done(null, findUser);
      };
    };
  } catch(err) {
    return done(err);
  };
});
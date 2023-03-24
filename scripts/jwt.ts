require('dotenv').config();
import { JwtPayload } from "jsonwebtoken";
import { DoneCallback } from "passport";
const User = require("../models/user"),
      JwtStrategy = require('passport-jwt').Strategy,
      ExtractJwt = require('passport-jwt').ExtractJwt,
      options = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.SECRET,
      };

module.exports = new JwtStrategy(options, async (jwt_payload: JwtPayload, done: DoneCallback) => {
  try {
    const findUser = await User.find(jwt_payload.email);
    if (!findUser) {
      return done(null, false);
    };
    if (findUser.email === jwt_payload.email) {
      return done(null, findUser);
    };
  } catch(err) {
    return done(err);
  };
});
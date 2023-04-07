"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_jwt_1 = require("passport-jwt");
const dotenv_1 = __importDefault(require("dotenv"));
const User = require('../models/user');
dotenv_1.default.config();
const options = {
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SECRET,
};
module.exports = new passport_jwt_1.Strategy(options, async (jwt_payload, done) => {
    try {
        const findUser = await User.find(jwt_payload.email);
        if (!findUser) {
            return done(null, false);
        }
        ;
        if (findUser) {
            if (findUser.email === jwt_payload.email) {
                return done(null, findUser[0]);
            }
            ;
        }
        ;
    }
    catch (err) {
        return done(err);
    }
    ;
});
//# sourceMappingURL=jwt.js.map
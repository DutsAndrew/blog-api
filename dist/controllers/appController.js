"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const luxon_1 = require("luxon");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User = require("../models/user");
exports.post_signup = [
    (0, express_validator_1.body)("email", "You must provide an email in order to create an account")
        .trim()
        .isEmail()
        .withMessage("Your format does not match that of an email address (IE. hello@gmail.com)")
        .isLength({ min: 1, max: 1000 })
        .escape(),
    (0, express_validator_1.body)("firstName", "You must provide a first name in order to create an account")
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage("First names are limited to at least one character and no more than 1000 characters.")
        .escape(),
    (0, express_validator_1.body)("lastName", "You must provide a last name in order to create an account")
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage("First names are limited to at least one character and no more than 1000 characters.")
        .escape(),
    (0, express_validator_1.body)("location")
        .trim()
        .escape(),
    (0, express_validator_1.body)("password")
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage("Passwords are limited to at least one character and no more than 1000 characters.")
        .escape(),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        const newUser = new User({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            location: req.body.location,
            password: req.body.password,
        });
        if (!errors.isEmpty()) {
            res.json({
                email: req.body.email,
                errors: errors.array(),
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                location: req.body.location,
                password: req.body.password,
            });
            return next(errors);
        }
        else {
            bcryptjs_1.default.hash(req.body.password, 10, async (err, hashedPassword) => {
                if (err) {
                    return res.status(500).json({
                        message: "Failed to hash password",
                    });
                }
                else {
                    newUser.comments = [];
                    newUser.joined = luxon_1.DateTime.now().toISO();
                    newUser.password = hashedPassword;
                    newUser.popularity = 0;
                    newUser.posts = [];
                    newUser.role = 'Basic';
                    try {
                        const uploadedUser = await newUser.save();
                        if (!uploadedUser) {
                            res.json({
                                message: "Failed to save user"
                            });
                        }
                        else {
                            res.json({
                                uploadedUser,
                            });
                        }
                        ;
                    }
                    catch (err) {
                        res.json({
                            message: "We were unable to upload your account to our database, please try again later",
                            error: err,
                        });
                    }
                    ;
                    return;
                }
                ;
            });
        }
        ;
    },
];
exports.post_login = [
    (0, express_validator_1.body)("email", "You must include an email to login")
        .trim()
        .isEmail()
        .withMessage("Your email entry is not in an email format we accept (IE. hello@gmail.com")
        .isLength({ min: 1, max: 1000 })
        .escape(),
    (0, express_validator_1.body)("password", "You cannot login without a password entry")
        .trim()
        .isLength({ min: 1, max: 1000 })
        .escape(),
    async (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.json({
                errors: errors.array(),
                email: req.body.email,
                password: req.body.password,
            });
        }
        else {
            const user = await User.find({ email: req.body.email });
            if (!user) {
                // no user in db
                res.json({
                    message: "That email is not connected to an account"
                });
            }
            ;
            if (user) {
                // user found
                bcryptjs_1.default.compare(req.body.password, user.password, (err, validated) => {
                    if (err) {
                        res.json({
                            message: "We could not hash your password",
                            error: err,
                        });
                    }
                    ;
                    if (validated) {
                        // passwords match
                        const options = {
                            expiresIn: '1h',
                        };
                        const email = user.email;
                        const token = jsonwebtoken_1.default.sign({ email }, process.env.SECRET, options, (err, token) => {
                            if (err) {
                                res.status(400).json({
                                    message: "Error creating token",
                                });
                            }
                            else {
                                res.status(200).json({
                                    message: "Auth Passed",
                                    token,
                                });
                            }
                            ;
                        });
                    }
                    else {
                        // passwords did not match
                        res.json({
                            message: "Incorrect password",
                        });
                    }
                    ;
                });
            }
            ;
        }
        ;
    },
];
exports.post_upload_profile_img = [
    (req, res, next) => {
        res.json({
            message: "Not implemented",
        });
    },
];
//# sourceMappingURL=appController.js.map
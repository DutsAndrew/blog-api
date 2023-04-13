import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { DateTime } from 'luxon';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import multer from 'multer';
const User = require("../models/user");

exports.post_signup = [
  body("email", "You must provide an email in order to create an account")
    .trim()
    .isEmail()
    .withMessage("Your format does not match that of an email address (IE. hello@gmail.com)")
    .isLength({ min: 1, max: 1000})
    .escape(),
  body("firstName", "You must provide a first name in order to create an account")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("First names are limited to at least one character and no more than 1000 characters.")
    .escape(),
  body("lastName", "You must provide a last name in order to create an account")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("First names are limited to at least one character and no more than 1000 characters.")
    .escape(),
  body("location")
    .trim()
    .isAlpha()
    .escape(),
  body("password", "Passwords are required to create an account")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Passwords are limited to at least one character and no more than 1000 characters.")
    .escape(),
  body("confirmPassword", "You must verify your password")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Passwords are limited to at least one character and no more than 1000 characters.")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Your passwords do not match, please try again")
    .escape(),

  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    const newUser = new User({
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      location: req.body.location,
      password: req.body.password,
    });

    if (!errors.isEmpty()) {
      return res.json({
        errors: errors.array(),
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        location: req.body.location,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
      });
    } else {

      // check if the email has already been registered, if so abort signup
      try {
        const checkIfEmailAlreadyExists = await User.find({ email: req.body.email });
        if (checkIfEmailAlreadyExists.length > 0) {
          // email exists abort
          return res.json({
            message: "That email has already been taken, please try again",
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            location: req.body.location,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword,
          });
        };
      } catch(error) {
        return res.json({
          message: "We could not confirm if that email address was taken, please try again later",
        });
      };

      // no errors on form continue sanitizing data
      bcrypt.hash(req.body.password, 10, async(err, hashedPassword) => {
        if (err) {
          return res.status(500).json({
            message: "Failed to hash password",
          });
        } else {
          newUser.comments = [];
          newUser.joined = DateTime.now();
          newUser.password = hashedPassword;
          newUser.popularity = 0;
          newUser.posts = [];
          newUser.role = 'Basic';

          try {
            const uploadedUser = await newUser.save();
            if (!uploadedUser) {
              return res.json({
                message: "Failed to save user"
              });
            } else {
              const strippedUserInformation = {
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
              };
              return res.json({
                message: "We successfully uploaded your account to our database",
                strippedUserInformation,
              });
            };
          } catch(err) {
            return res.json({
              message: "We were unable to upload your account to our database, please try again later",
              error: err,
            });
          };
        };
      });
    };
  },
];

exports.post_login = [
  body("email", "You must include an email to login")
    .trim()
    .isEmail()
    .withMessage("Your email entry is not in an email format we accept (IE. hello@gmail.com")
    .isLength({ min: 1, max: 1000 })
    .escape(),
  body("password", "You cannot login without a password entry")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .escape(),
  body("confirmPassword", "You must verify your password")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Passwords are limited to at least one character and no more than 1000 characters.")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Your passwords do not match, please try again")
    .escape(),

  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({
        message: "Your form had incorrect data submitted, we are sending it back for you to fix",
        errors: errors.array(),
        email: req.body.email,
        password: req.body.password,
      });
    } else {
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        // no user in db
        return res.status(400).json({
          message: "That email is not connected to an account",
          errors: "No account found",
        });
      } else if (user.length !== 0) {
        // user found and it's not empty
        // user[0] in case more than one user is retrieved
        bcrypt.compare(req.body.password, user.password, (err, validated) => {
          if (err) {
            return res.json({
              message: "We had issues pulling your stored password from the database, please try again later",
              errors: err,
            });
          } else if (validated) {
            // passwords match
            const options: SignOptions = {
              expiresIn: '1h',
            };
            const email = user.email;
            const token = jwt.sign({ email }, (process.env.SECRET as string), options, (err, token) => {
              if (err) {
                return res.status(400).json({
                  message: "Error creating token",
                });
              } else {
                return res.status(200).json({ 
                  message: "Auth Passed",
                  token,
                });
              };
            });
          } else {
            // passwords did not match
            return res.json({
              message: "Incorrect password",
            });
          };
        });
      } else {
        // db returned an empty user or could not find the email
        return res.json({
          message: "That email is not connected to an account",
        });
      };
    };
  },
];

exports.post_upload_profile_img = [
  (req: Request, res: Response, next: NextFunction) => {
    res.json({
      message: "Not implemented",
    });
  },
];
import async from 'async';
import { Request, Response, NextFunction } from 'express';
import { check, body, validationResult } from 'express-validator';
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
    .escape(),
  body("password")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Passwords are limited to at least one character and no more than 1000 characters.")
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
      res.json({
        errors,
      });
    } else {
      bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
        if (err) return next(err);
        newUser.password = hashedPassword;
        newUser.joined = DateTime.now();
        newUser.role = 'Basic';
      });
      try {
        const uploadedUser = await newUser.save();
        if (!uploadedUser) res.json({message: "Failed to save user"});
        res.json({
          uploadedUser,
        });
      } catch(err) {
        return next(err);
      };
    }
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

  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({
        errors,
      });
    } else {
      const user = await User.find({ email: req.body.email });
      if (!user) {
        // no user in db
        return res.json({
        message: "That email is not connected to an account"
        });
      };
      // user found
      bcrypt.compare(req.body.password, user.password, (err, validated) => {
        if (err) return next(err);
        if (validated) {
          // passwords match
          const options: SignOptions = {
            expiresIn: 120,
          };
          const email = user.email;
          const token = jwt.sign({ email }, (process.env.SECRET as Secret), options, (err, token) => {
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
          res.json({
            message: "Incorrect password",
          });
        };
      });
    };
  },
];

exports.post_upload_profile_img = async (req: Request, res: Response, next: NextFunction) => {
  res.json({
    message: "Not implemented yet",
  });
};
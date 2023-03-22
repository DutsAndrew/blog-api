import async from 'async';
import { Request, Response, NextFunction } from 'express';
import { check, body, validationResult } from 'express-validator';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import { DateTime } from 'luxon';
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
        const uploadUser = await newUser.save();
        if (!uploadUser) res.json({message: "Failed to save user"});
        res.json({
          uploadUser,
        });
      } catch(err) {
        return next(err);
      };
    }
  },
];

exports.post_login = async (req: Request, res: Response, next: NextFunction) => {
  
};

exports.post_upload_profile_img = async (req: Request, res: Response, next: NextFunction) => {

};
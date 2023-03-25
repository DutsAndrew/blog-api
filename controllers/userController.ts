import { Request, Response, NextFunction } from 'express';
import { check, body, validationResult } from 'express-validator';
import { AuthRequest } from '../Types/interfaces';
import bcrypt from 'bcryptjs';
import async from 'async';
const User = require("../models/user");

exports.get_users = async (req: Request, res: Response, next: NextFunction) => {
  const findUsers = await User.find()
    .sort({ popularity: 1 });
  
  if (!findUsers) {
    res.json({
      message: "We could not find any users",
    });
  } else {
    const strippedUserList: any[] = [];
    findUsers.forEach((user: any) => {
      const userToRender = {
        firstName: user.firstName,
        lastName: user.lastName,
        posts: user.posts,
      };
      strippedUserList.push(userToRender);
    });
    res.json({
      message: "Users found",
      users: strippedUserList,
    });
  };
};

exports.get_user = async (req: Request, res: Response, next: NextFunction) => {
  const retrieveUser = await User.findById(req.params.id);
  if (!retrieveUser) {
    res.json({
      message: "User was not found",
    });
  } else {
    const strippedUserInformation  = {
      firstName: retrieveUser.firstName,
      lastName: retrieveUser.lastName,
      posts: retrieveUser.posts,
    };
    res.json({
      message: "User found",
      user: strippedUserInformation,
    })
  };
};

exports.put_user = [
  body("email", "You must have an email on file to maintain your account")
    .trim()
    .isEmail()
    .withMessage("Your email does not follow the typical email format (IE. hello@gamil.com)")
    .escape(),
  body("firstName", "Your account must have a first name on file")
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

  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    const updatedUser = new User({
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      location: req.body.location,
      password: req.body.password,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      res.json({
        email: req.body.email,
        errors,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        location: req.body.location,
        password: req.body.password,
      });
    } else {
      const userLookUp = await User.find(req.params.id);
      if (!userLookUp) {
        res.json({
          message: "the account your trying to update is not in our database, we aborted your request",
        });
      } else {
        bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
          if (err) return next(err);
          updatedUser.joined = userLookUp.joined;
          updatedUser.password = hashedPassword;
          updatedUser.popularity = userLookUp.popularity;
          updatedUser.posts = userLookUp.posts;
          updatedUser.role = userLookUp.role;
        });
        try {
          const uploadedUser = await User.findByIdAndUpdate(req.params.id, updatedUser);
          if (!uploadedUser) {
            res.json({
              message: "Failed to update user"
            });
          } else {
            res.json({
              uploadedUser,
            });
          };
        } catch(err) {
          return next(err);
        };
      };
    };
  },
];

exports.delete_user = async (req: Request, res: Response, next: NextFunction) => {
  async.parallel(
    {
      user(callback) {
        User.findById(req.params.id)
      }
    },
  );
};
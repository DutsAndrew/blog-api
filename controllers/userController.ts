import { Request, Response, NextFunction } from 'express';
import { check, body, validationResult } from 'express-validator';
import { AuthRequest } from '../Types/interfaces';
import bcrypt from 'bcryptjs';
const User = require("../models/user");
const Post = require("../models/post");
const Comment = require("../models/comment");

exports.get_user_account = async(req: Request, res: Response, next: NextFunction) => {
  const userId = req.user["_id"];
  try {
    const userRef = await User.findById(userId);
    // ADD IN ACCOUNT MODIFICATIONS FOR USER PROFILE IMGS
    const strippedUserInformation = {
      email: userRef.email,
      firstName: userRef.firstName,
      lastName: userRef.lastName,
      location: userRef.location,
    };
    return res.json({
      message: "User Found",
      account: strippedUserInformation,
    });
  } catch(error) {
    return res.json({
      message: "We had issues finding what you were looking for",
    });
  };
};

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

exports.get_user = [
  check('id').isMongoId().withMessage('Invalid Post ID'),

  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    } else {
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
  },
];

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

  check('id').isMongoId().withMessage('Invalid Post ID'),

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
        errors: errors.array(),
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        location: req.body.location,
        password: req.body.password,
      });
    } else {
      const userLookUp = await User.findById(req.params.id);
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

exports.delete_user = [
  check('id').isMongoId().withMessage('Invalid Post ID'),

  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    } else {
      const userData = await User.findById(req.params.id)
      .populate("posts")
      .populate("comments")
    
      userData.posts.forEach(async(post: any) => {
        const removePost = await Post.findByIdAndRemove(post._id);
        if (!removePost) {
          res.json({
            message: "We had trouble removing your post history",
          });
        };
      });
    
      userData.comments.forEach(async(comment: any) => {
        const removeComment = await Comment.findByIdAndRemove(comment._id);
        if (!removeComment) {
          res.json({
            message: "We had trouble removing your comment history",
          });
        };
      });
    
      const removeUser = User.findByIdAndRemove(req.params.id);
      if (!removeUser) {
        res.json({
          message: "We had trouble deleting your account, but we successfully removed your posts and comments",
        });
      } else {
        res.json({
          message: "We removed all your posts, comments, and deleted your account",
        });
      };
    };
  },
];
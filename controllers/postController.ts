import { Request, Response, NextFunction } from 'express';
import { check, body, validationResult } from 'express-validator';
import dotenv from 'dotenv';
import { AuthRequest } from '../Types/interfaces';
import { DateTime } from 'luxon';
const Post = require("../models/post");
dotenv.config();

exports.get_posts = (req: Request, res: Response, next: NextFunction) => {
  res.json({
    message: "Not implemented",
  });
};

exports.create_post = [
  // Convert the tags to an array.
  (req: Request, res: Response, next: NextFunction) => {
    if (!Array.isArray(req.body.tags)) {
      req.body.tags =
        typeof req.body.tags === "undefined" ? [] : [req.body.tags];
    }
    next();
  },

  body("title", "Your post must have a title")
    .trim()
    .isLength({ min: 1, max: 25 })
    .withMessage("The title of your post must meet our criteria of at least one character and no more than 25")
    .escape(),
  body("body", "Your post must have some body text")
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage("The body of your post must meet our criteria of at least one character and no more than 10000")
    .escape(),

  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({
        title: req.body.title,
        body: req.body.body,
        errors: errors,
      });
    } else {
      const userId = req.user[0]["_id"];
      const newPost = new Post({
        author: userId,
        body: req.body.body,
        comments: [],
        favorites: 0,
        likes: 1,
        tags: req.body.tags,
        timestamp: DateTime.now(),
        title: req.body.title,
        whoLiked: [userId],
      });
      const uploadPost = await newPost.save();
      res.json({
        message: "upload success",
        uploadPost,
      });
    };
  },

];

exports.get_post = (req: Request, res: Response, next: NextFunction) => {
  res.json({
    message: "Not implemented",
  });
};

exports.put_post = [
  (req: Request, res: Response, next: NextFunction) => {
    res.json({
      message: "Not implemented",
    });
  },
];

exports.delete_post = (req: Request, res: Response, next: NextFunction) => {
  res.json({
    message: "Not implemented",
  });
};
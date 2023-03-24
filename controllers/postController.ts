import { Request, Response, NextFunction } from 'express';
import { check, body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
const Post = require("../models/post");

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

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      
    } else {
      
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
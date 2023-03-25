import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import dotenv from 'dotenv';
import { AuthRequest } from '../Types/interfaces';
import { DateTime } from 'luxon';
const Post = require("../models/post");
const User = require("../models/user");
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
        message: "There were errors submitted in the form, please fix them before resubmitting",
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
      const updateUser = User.findById(userId);
            updateUser.popularity += 10;
            updateUser.posts.push(newPost);
      const updatePopularity = await User.findByIdAndUpdate(userId, updateUser);
      if (!uploadPost) {
        res.json({
          message: "There was an error saving your post to the database, please try again later",
        });
      } else {
        res.json({
          message: "upload success",
          uploadPost,
        });
      };
    };
  },
];

exports.get_post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const findPost = await Post.findById(req.params.id);
    if (!findPost) {
      res.json({
        message: "post not found",
      });
    } else {
      res.json({
        message: "post found",
        findPost,
      });
    };
  } catch(err) {
    return next(err);
  };
};

exports.put_post = [
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
        message: "There were errors submitted in the form, please fix them before resubmitting",
        title: req.body.title,
        body: req.body.body,
        errors: errors,
      });
    } else {
      const userId = req.user[0]["_id"];
      const updatedPost = new Post({
        author: userId,
        body: req.body.body,
        comments: [],
        favorites: 0,
        likes: 1,
        tags: req.body.tags,
        timestamp: DateTime.now(),
        title: req.body.title,
        whoLiked: [userId],
        _id: req.params.id,
      });
      const updatePost = await Post.findByIdAndUpdate(req.params.id, updatedPost);
      if (!updatePost) {
        res.json({
          message: "Unable to update post",
          updatedPost,
        });
      } else {
        res.json({
          message: "upload success",
          updatedPost,
        });
      };
    };
  },
];

exports.delete_post = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user[0]["_id"];
  const postToDelete = await Post.findById(req.params.id);
  if (!postToDelete) {
    res.json({
      message: "Could not find that post in the database"
    });
  };
  if (postToDelete.author === userId) {
    const deleteAttempt = await Post.findByIdAndRemove(req.params.id);
    if (!deleteAttempt) {
      res.json({
        message: "There was an issue deleting this post, please try again or contact the devs",
      });
    } else {
      res.json({
        message: "Success, the post was deleted",
        deleteAttempt,
      })
    };
  } else {
    res.json({
      message: "You are not the author of this post and therefore cannot delete it",
    });
  };
};

exports.like_post = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user[0]["_id"];
  const postToLike = await Post.findById(req.params.id);
  if (!postToLike) {
    res.json({
      message: "Could not find the post you wanted to like",
    });
  }
  if (!postToLike.whoLiked.includes(userId)) {
    postToLike.whoLiked.push(userId);
    postToLike.likes += 1;
    const addLike = await Post.findByIdAndUpdate(req.params.id, postToLike);
  } else {
    res.json({
      message: "Sorry, we aborted the request, your changes aren't synced with the server, please try again later",
    });
  };
};

exports.unlike_post = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user[0]["_id"];
  const postToUnlike = await Post.findById(req.params.id);
  if (!postToUnlike) {
    res.json({
      message: "Could not find the post you wanted to remove your like from",
    });
  }
  if (!postToUnlike.whoLiked.includes(userId)) {
    const indexOfLikeToRemove = postToUnlike.whoLiked.indexOf(userId);
    postToUnlike.whoLiked.splice(indexOfLikeToRemove, 1);
    postToUnlike.likes -= 1;
    const removeLike = await Post.findByIdAndUpdate(req.params.id, postToUnlike);
  } else {
    res.json({
      message: "Sorry, we aborted the request, your changes aren't synced with the server, please try again later",
    });
  };
};
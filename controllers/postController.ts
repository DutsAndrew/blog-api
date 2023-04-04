import { Request, Response, NextFunction } from 'express';
import { check, body, validationResult } from 'express-validator';
import dotenv from 'dotenv';
import { AuthRequest } from '../Types/interfaces';
import { DateTime } from 'luxon';
import async from 'async';
const User = require("../models/user");
const Post = require("../models/post");
dotenv.config();

exports.get_posts = (req: Request, res: Response, next: NextFunction) => {
  res.json({
    message: "Not implemented",
  });
};

exports.get_user_posts = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user[0]["_id"];
  const findPosts = await Post.find({ author: userId });
  if (!findPosts) {
    return res.json({
      message: "There are no posts connected with your account",
    });
  } else {
    return res.json({
      message: "We found some posts connected to your account",
      posts: findPosts,
    });
  };
};

exports.create_post = [
  // Convert the tags to an array.
  (req: Request, res: Response, next: NextFunction) => {
    if (!Array.isArray(req.body.tags)) {
      if (req.body.tags.includes(',')) {
        req.body.tags =
          req.body.tags.split(',');
      } else {
        req.body.tags = 
          typeof req.body.tags === "undefined" ? [] : [req.body.tags];
      };
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
      return res.json({
        body: req.body.body,
        errors: errors.array(),
        message: "There were errors submitted in the form, please fix them before resubmitting",
        tags: req.body.tags,
        title: req.body.title,
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
      if (!uploadPost) {
        return res.json({
          message: "We were unable to upload your post, please try again",
        });
      } else {
        const user = await User.findById(userId);
        if (!user) {
          return res.json({
            message: "User not found",
          });
        } else {
          user.popularity += 10;
          user.posts.push(newPost);
          const updateUser = await User.findByIdAndUpdate(userId, user);
          if (!updateUser) {
            const removePost = await Post.findByIdAndRemove(uploadPost._id);
            if (!removePost) {
              return res.json({
                message: "We encountered a large error, where your post was created, but we could not attach it to your account, and we were unable to delete the post from our database. Please reach out to the developers to fix this issue",
              });
            } else {
              return res.json({
                message: "We had issues updating your account, so we deleted the post, please reupload later",
              });
            };
          } else {
            return res.json({
              message: "upload success",
              uploadPost,
            });
          };
        };
      };
    };
  },
];

exports.get_post = [
  check('id').isMongoId().withMessage('Invalid Post ID'),

  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    } else {
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
    }
  },
];

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

  check('id').isMongoId().withMessage('Invalid Post ID'),

  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({
        message: "There were errors submitted in the form, please fix them before resubmitting",
        title: req.body.title,
        body: req.body.body,
        errors: errors.array(),
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

exports.delete_post = [
  check('id').isMongoId().withMessage('Invalid Post ID'),

  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    } else {
      const userId = req.user[0]["_id"];
      async.parallel(
        {
          post(callback) {
            Post.findById(req.params.id)
              .populate("author");
          },
          posts(callback) {
            Post.find({ author: userId });
          },
          author(callback) {
            User.findById(userId);
          },
        },
        async (err, results) => {
          if (err) {
            res.json({
              message: "What you were trying to delete could not be found, there was an issue either locating your account, the post, or other posts attached to your account",
            });
          } else {
            const user = (results.author as any);
            if ((results.post as any).author._id === user._id) {
              async.parallel(
                {
                  RemovePostFromUserPosts(callback) {
                    const postIndex = (results.author as any).posts.indexOf(req.params.id);
                    user.posts.splice(postIndex, 1);
                    const updateUser = User.findByIdAndUpdate(userId, user);
                  },
                  deletePost(callback) {
                    Post.findByIdAndRemove(req.params.id);
                  },
                }, (err, results) => {
                  if (err) {
                    res.json({
                      message: "There was an error removing the post from your account and also deleting it, please try again",
                    });
                  } else {
                    res.json({
                      message: "Post successfully removed from your account and deleted from our database",
                    });
                  }
                },
              );
            } else {
              res.json({
                message: "You are not the author of this post and therefore cannot delete it",
              });
            };
          }
        },
      );
    };
  },
];

exports.like_post = [
  check('id').isMongoId().withMessage('Invalid Post ID'),

  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    } else {
      const userId = req.user[0]["_id"];
      const postToLike = await Post.findById(req.params.id);
      if (!postToLike) {
        res.json({
          message: "Could not find the post you wanted to like",
        });
      };
      if (postToLike) {
        if (!postToLike.whoLiked.includes(userId)) {
          postToLike.whoLiked.push(userId);
          postToLike.likes += 1;
          const addLike = await Post.findByIdAndUpdate(req.params.id, postToLike);
          if (!addLike) {
            res.json({
              message: "We were not able to locate this post and add your like, please try again",
            });
          };
        } else {
          res.json({
            message: "Sorry, we aborted the request, your changes aren't synced with the server, please try again later",
          });
        };
      };
    };
  },
];

exports.unlike_post = [
  check('id').isMongoId().withMessage('Invalid Post ID'),

  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    } else {
      const userId = req.user[0]["_id"];
      const postToUnlike = await Post.findById(req.params.id);
      if (!postToUnlike) {
        res.json({
          message: "Could not find the post you wanted to remove your like from",
        });
      };
      if (postToUnlike) {
        if (!postToUnlike.whoLiked.includes(userId)) {
          const indexOfLikeToRemove = postToUnlike.whoLiked.indexOf(userId);
          postToUnlike.whoLiked.splice(indexOfLikeToRemove, 1);
          postToUnlike.likes -= 1;
          const removeLike = await Post.findByIdAndUpdate(req.params.id, postToUnlike, { new: true });
          res.json({
            message: "We were able to unlike the post",
            removeLike,
          });
        } else {
          res.json({
            message: "Sorry, we aborted the request, your changes aren't synced with the server, please try again later",
          });
        };
      };
    };
  },
];
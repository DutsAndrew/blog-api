import { Request, Response, NextFunction } from 'express';
import { check, body, validationResult } from 'express-validator';
import { DateTime } from 'luxon';
import { AuthRequest } from '../Types/interfaces';
import async from 'async';
import User from "../models/user";
import Comment from "../models/comment";
import Post from "../models/post";

const create_comment = [
  body("comment", "Your comment must have a comment entered")
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage("Your comment doesn't fall within our criteria of at least 1 character but no  more than 10,000")
    .escape(),

  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user[0]["_id"];
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({
        errors: errors.array(),
        comment: req.body.comment,
        message: "Your comment submission had some errors",
      })
    } else {
      const newComment = new Comment({
        author: userId,
        comment: req.body.comment,
        likes: 1,
        timestamp: DateTime.now(),
      });
      async.waterfall(
        [
          async function(callback: any) {
            const uploadComment = await newComment.save();
            callback(null, uploadComment);
          },
          async function (comment: any, callback: any) {
            const commentId = comment._id;
            const userToAddCommentTo = await User.findById(userId);
            if (userToAddCommentTo) {
              (userToAddCommentTo as any).comments.push(commentId);
            };
            const updatedUser = await User.findByIdAndUpdate(userId, userToAddCommentTo, { new: true });
            callback(null, comment, updatedUser);
          },
        ],
        (err, results: any) => {
          if (err) {
            res.json({
              message: "We were unable to add your comment to our database and aborted your request",
            });
          } else {
            res.json({
              message: "Comment was saved",
              comment: results.comment,
            });
          }
        },
      );
    };
  },
];

const get_comments = [
  check('id').isMongoId().withMessage('Invalid Post ID'),
  
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    } else {
      const fetchPost = await Post.findById(req.params.id)
        .populate("comments");
  
      if (!fetchPost) {
        res.json({
          message: "We were unable to retrieve all the comments for this post",
        });
      } else {
        res.json({
          message: "Comments retrieved successfully",
          comments: fetchPost.comments,
        });
      };
    };
  },
];

const put_comment = [
  body("comment", "Your comment must have a comment entered")
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage("Your comment doesn't fall within our criteria of at least 1 character but no  more than 10,000")
    .escape(),

  check('id').isMongoId().withMessage('Invalid Post ID'),
  check('commentId').isMongoId().withMessage('Invalid comment ID'),

  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user[0]["_id"];
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({
        errors: errors.array(),
        comment: req.body.comment,
        message: "Your comment submission had some errors",
      })
    } else {
      const oldComment = await Comment.findById(req.params.commentId);
      const updatedComment = new Comment({
        author: userId,
        comment: req.body.comment,
        likes: 1,
        timestamp: oldComment.timestamp,
        _id: req.params.commentId,
      });
      const uploadComment = await Comment.findByIdAndUpdate(req.params.commentId, updatedComment, { new: true });
      if (!uploadComment) {
        res.json({
          message: "We were unable to update your comment",
        });
      } else {
        res.json({
          message: "we were able to update your comment",
          comment: uploadComment,
        });
      }
    };
  },
];

const delete_comment = [
  check('id').isMongoId().withMessage('Invalid Post ID'),
  check('commentId').isMongoId().withMessage('Invalid comment ID'),

  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    } else {
      const userId = req.user[0]["_id"];
      const userToDeleteCommentFrom = await User.findById(userId);
      const comments = userToDeleteCommentFrom.comments;
      const commentToRemoveIndex = comments.indexOf(req.params.commentId);
      comments.splice(commentToRemoveIndex, 1);
      const updateUser = await User.findByIdAndUpdate(userId, userToDeleteCommentFrom);
      if (!updateUser) {
        res.json({
          message: "We were unable to remove the comment from your account",
        });
      } else {
        const deleteComment = await Comment.findByIdAndRemove(req.params.commentId);
        if (!deleteComment) {
          res.json({
            message: "We had trouble deleting your comment",
          });
        } else {
          res.json({
            message: "We removed the comment from your account and our database",
          });
        };
      };
    };
  },
];

const commentController = {
  create_comment,
  get_comments,
  put_comment,
  delete_comment,
};

export default commentController;
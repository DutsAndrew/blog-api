import { Request, Response, NextFunction } from 'express';
import { check, body, validationResult } from 'express-validator';
import { DateTime } from 'luxon';
import { AuthRequest } from '../Types/interfaces';
import he from 'he';
const User = require("../models/user");
const Post = require("../models/post");
const Comment = require("../models/comment");

exports.get_user_comments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user["_id"];
  try {
    const retrieveUserRef = await User.findById(userId)
      .populate("comments");

    if (!retrieveUserRef) {
      return res.json({
        message: "That user could not be found",
      });
    } else {
      // user found
      const comments = retrieveUserRef.comments;
      if (comments.length === 0) {
        // there are no comments
        return res.json({
          message: "You don't have any comments",
        });
      } else {
        // found comments
        // decode any escaped characters and order comments by recency, sort by likes
        comments.forEach((comment) => {
          comment.comment = he.decode(comment.comment);
        });
        comments.sort((a, b) => {
          if (a.likes > b.likes) return -1;
          if (b.likes > a.likes) return 1;
          return 0;
        });
        return res.json({
          message: "We found some comments linked to your account",
          comments: comments,
        });
      };
    };
  } catch(error) {
    return res.json({
      message: "We were unable to perform your request",
    });
  };
};

exports.create_comment = [
  check('id').isMongoId().withMessage('Invalid Post ID'),

  body("comment", "Your comment must have a comment entered")
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage("Your comment doesn't fall within our criteria of at least 1 character but no  more than 10,000")
    .escape(),
  body("name", "Your comment must have a name entered")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Your name doesn't fall within our criteria of at least 1 character but no  more than 10,000")
    .escape(),

  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({
        errors: errors.array(),
        comment: req.body.comment,
        name: req.body.name,
        message: "Your comment submission had some errors",
      });
    } else {
      const newComment = new Comment({
        author: req.body.name,
        comment: req.body.comment,
        likes: 1,
        timestamp: DateTime.now(),
        user: req.params.user,
        whoLiked: [req.params.user],
        postRef: req.params.id,
      });
      try {
        const comment = await newComment.save();
        if (!comment) {
          return res.json({
            message: "Failed to upload comment",
            comment: req.body.comment,
            name: req.body.name,
          });
        } else {
          // update post to contain comment
          const postToUpdate = await Post.findByIdAndUpdate(req.params.id, {
            $push: { comments: comment._id }
          });
          if (!postToUpdate) {
            return res.json({
              message: "Your comment was not added",
              comment: req.body.comment,
              name: req.body.name,
            });
          } else {
            comment.comment = he.decode(comment.comment);
            return res.json({
              message: "Comment Uploaded!",
              comment: comment,
            });
          };
        };
      } catch(error) {
        return res.status(400).json({
          message: "There was an error making this request",
          errors: [error],
          comment: req.body.comment,
          name: req.body.name,
        });
      };
    };
  },
];

exports.get_comments = async (req: Request, res: Response, next: NextFunction) => {
  const post = await Post.findById(req.params.id)
    .populate("comments");
  if (!post) {
    return res.json({
      message: "We were unable to retrieve all the comments for this post",
    });
  } else {
    // decode any escaped characters and order comments by recency, sort by likes
    const comments = post.comments;
    if (comments.length === 0) {
      return res.json({
        message: "This post doesn't currently have comments, be the first!",
      });
    } else {
      comments.forEach((comment) => {
        comment.comment = he.decode(comment.comment);
      });
      comments.sort((a, b) => {
        if (a.likes > b.likes) return -1;
        if (b.likes > a.likes) return 1;
        return 0;
      });
      return res.json({
        message: "Comments retrieved successfully",
        comments: comments,
      });
    };
  };
}

exports.like_comment = [
  check('id').isMongoId().withMessage('Invalid Comment ID'),

  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const comment = await Comment.findById(req.params.id);
      if (comment) {
        comment.whoLiked.push(req.params.user);
        comment.likes++;
        const updateComment = await Comment.findByIdAndUpdate(req.params.id, comment, { new: true });
        updateComment.comment = he.decode(updateComment.comment);
        if (updateComment) {
          return res.json({
            message: "Your like was added",
            comment: updateComment,
          });
        } else {
          return res.status(404).json({
            message: "We were unable to perform this request",
          });
        };
      } else {
        return res.json({
          message: "That comment does not exist",
        });
      };
    } catch(error) {
      return res.status(404).json({
        message: "We were unable to perform this action"
      });
    };
  },
];

exports.unlike_comment = [
  check('id').isMongoId().withMessage('Invalid Comment ID'),

  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const comment = await Comment.findById(req.params.id);
      if (comment) {
        comment.whoLiked.splice(comment.whoLiked.indexOf(req.params.user), 1);
        comment.likes--;
        const updateComment = await Comment.findByIdAndUpdate(req.params.id, comment, { new: true });
        updateComment.comment = he.decode(updateComment.comment);
        if (updateComment) {
          return res.json({
            message: "Your like was removed",
            comment: updateComment,
          });
        } else {
          return res.status(404).json({
            message: "We were unable to perform this request",
          });
        };
      } else {
        return res.json({
          message: "That comment does not exist",
        });
      };
    } catch(error) {
      return res.status(404).json({
        message: "We were unable to perform this action"
      });
    };
  },
];

exports.delete_comment = [
  check('postId').isMongoId().withMessage('Invalid Post ID'),
  check('commentId').isMongoId().withMessage('Invalid comment ID'),

  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user["_id"];
    try {
      const postToDeleteCommentFrom = await Post.findById(req.params.postId)
      if (!postToDeleteCommentFrom) {
        return res.json({
          message: "That post does not exist",
        });
      } else if (postToDeleteCommentFrom.author.toString() !== userId.toString()) {
        // signed in user does not match author on post
        return res.json({
          message: "Only the author of the post can remove comments from it",
        });
      } else {

        // signed in user matches author of post and post exists
        // update post
        postToDeleteCommentFrom.comments.splice(postToDeleteCommentFrom.comments.indexOf(req.params.commentId), 1);
        const updatePost = await Post.findByIdAndUpdate(req.params.postId, postToDeleteCommentFrom, { new: true });

        // delete comment
        if (!updatePost) {
          return res.json({
            message: "We are aborting this request, we were unable to remove that comment",
          });
        } else {
          const deleteComment = await Comment.findByIdAndRemove(req.params.commentId.toString());
          if (!deleteComment) {
            return res.json({
              message: "There was an issue deleting the comment, it was removed from the post though",
            });
          } else {
            return res.json({
              message: "Post was updated, comment was removed",
              post: updatePost,
            });
          };
        };
      };
    } catch(error) {
      return res.status(404).json({
        message: "We were unable to perform this action",
        error: error,
      });
    };
  },
];
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const luxon_1 = require("luxon");
const async_1 = __importDefault(require("async"));
const User = require("../models/user");
const Post = require("../models/post");
const Comment = require("../models/comment");
exports.get_user_comments = async (req, res, next) => {
    const userId = req.user["_id"];
    try {
        const retrieveUserRef = await User.findById(userId)
            .populate("comments");
        if (!retrieveUserRef) {
            return res.json({
                message: "That user could not be found",
            });
        }
        else {
            // user found
            const comments = retrieveUserRef.comments;
            if (comments.length === 0) {
                // there are no comments
                return res.json({
                    message: "You don't have any comments",
                });
            }
            else {
                // found comments
                // order them by recency and send them to client
                comments.sort((a, b) => {
                    return luxon_1.DateTime.fromISO(b.timestamp).diff(luxon_1.DateTime.fromISO(a.timestamp)).as('milliseconds');
                });
                return res.json({
                    message: "We found some comments linked to your account",
                    comments: comments,
                });
            }
            ;
        }
        ;
    }
    catch (error) {
        return res.json({
            message: "We were unable to perform your request",
        });
    }
    ;
};
exports.create_comment = [
    (0, express_validator_1.body)("comment", "Your comment must have a comment entered")
        .trim()
        .isLength({ min: 1, max: 10000 })
        .withMessage("Your comment doesn't fall within our criteria of at least 1 character but no  more than 10,000")
        .escape(),
    async (req, res, next) => {
        const userId = req.user["_id"];
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.json({
                errors: errors.array(),
                comment: req.body.comment,
                message: "Your comment submission had some errors",
            });
        }
        else {
            const newComment = new Comment({
                author: userId,
                comment: req.body.comment,
                likes: 1,
                timestamp: luxon_1.DateTime.now(),
            });
            async_1.default.waterfall([
                async function (callback) {
                    const uploadComment = await newComment.save();
                    callback(null, uploadComment);
                },
                async function (comment, callback) {
                    const commentId = comment._id;
                    const userToAddCommentTo = await User.findById(userId);
                    if (userToAddCommentTo) {
                        userToAddCommentTo.comments.push(commentId);
                    }
                    ;
                    const updatedUser = await User.findByIdAndUpdate(userId, userToAddCommentTo, { new: true });
                    callback(null, comment, updatedUser);
                },
            ], (err, results) => {
                if (err) {
                    res.json({
                        message: "We were unable to add your comment to our database and aborted your request",
                    });
                }
                else {
                    res.json({
                        message: "Comment was saved",
                        comment: results.comment,
                    });
                }
            });
        }
        ;
    },
];
exports.get_comments = [
    (0, express_validator_1.check)('id').isMongoId().withMessage('Invalid Post ID'),
    async (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
            });
        }
        else {
            const fetchPost = await Post.findById(req.params.id)
                .populate("comments");
            if (!fetchPost) {
                res.json({
                    message: "We were unable to retrieve all the comments for this post",
                });
            }
            else {
                res.json({
                    message: "Comments retrieved successfully",
                    comments: fetchPost.comments,
                });
            }
            ;
        }
        ;
    },
];
exports.put_comment = [
    (0, express_validator_1.body)("comment", "Your comment must have a comment entered")
        .trim()
        .isLength({ min: 1, max: 10000 })
        .withMessage("Your comment doesn't fall within our criteria of at least 1 character but no  more than 10,000")
        .escape(),
    (0, express_validator_1.check)('id').isMongoId().withMessage('Invalid Post ID'),
    (0, express_validator_1.check)('commentId').isMongoId().withMessage('Invalid comment ID'),
    async (req, res, next) => {
        const userId = req.user["_id"];
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.json({
                errors: errors.array(),
                comment: req.body.comment,
                message: "Your comment submission had some errors",
            });
        }
        else {
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
            }
            else {
                res.json({
                    message: "we were able to update your comment",
                    comment: uploadComment,
                });
            }
        }
        ;
    },
];
exports.delete_comment = [
    (0, express_validator_1.check)('id').isMongoId().withMessage('Invalid Post ID'),
    (0, express_validator_1.check)('commentId').isMongoId().withMessage('Invalid comment ID'),
    async (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
            });
        }
        else {
            const userId = req.user["_id"];
            const userToDeleteCommentFrom = await User.findById(userId);
            const comments = userToDeleteCommentFrom.comments;
            const commentToRemoveIndex = comments.indexOf(req.params.commentId);
            comments.splice(commentToRemoveIndex, 1);
            const updateUser = await User.findByIdAndUpdate(userId, userToDeleteCommentFrom);
            if (!updateUser) {
                res.json({
                    message: "We were unable to remove the comment from your account",
                });
            }
            else {
                const deleteComment = await Comment.findByIdAndRemove(req.params.commentId);
                if (!deleteComment) {
                    res.json({
                        message: "We had trouble deleting your comment",
                    });
                }
                else {
                    res.json({
                        message: "We removed the comment from your account and our database",
                    });
                }
                ;
            }
            ;
        }
        ;
    },
];
//# sourceMappingURL=commentController.js.map
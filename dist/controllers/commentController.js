"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const luxon_1 = require("luxon");
const he_1 = __importDefault(require("he"));
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
                // decode any escaped characters and order comments by recency, sort by likes
                comments.forEach((comment) => {
                    comment.comment = he_1.default.decode(comment.comment);
                });
                comments.sort((a, b) => {
                    if (a.likes > b.likes)
                        return -1;
                    if (b.likes > a.likes)
                        return 1;
                    return 0;
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
    (0, express_validator_1.check)('id').isMongoId().withMessage('Invalid Post ID'),
    (0, express_validator_1.body)("comment", "Your comment must have a comment entered")
        .trim()
        .isLength({ min: 1, max: 10000 })
        .withMessage("Your comment doesn't fall within our criteria of at least 1 character but no  more than 10,000")
        .escape(),
    (0, express_validator_1.body)("name", "Your comment must have a name entered")
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage("Your name doesn't fall within our criteria of at least 1 character but no  more than 10,000")
        .escape(),
    async (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.json({
                errors: errors.array(),
                comment: req.body.comment,
                name: req.body.name,
                message: "Your comment submission had some errors",
            });
        }
        else {
            const newComment = new Comment({
                author: req.body.name,
                comment: req.body.comment,
                likes: 1,
                timestamp: luxon_1.DateTime.now(),
                user: req.params.user,
                whoLiked: [req.params.user],
            });
            try {
                const comment = await newComment.save();
                if (!comment) {
                    return res.json({
                        message: "Failed to upload comment",
                    });
                }
                else {
                    // update post to contain comment
                    const postToUpdate = await Post.findByIdAndUpdate(req.params.id, {
                        $push: { comments: comment._id }
                    });
                    if (!postToUpdate) {
                        return res.json({
                            message: "Your comment was not added"
                        });
                    }
                    else {
                        comment.comment = he_1.default.decode(comment.comment);
                        return res.json({
                            message: "Comment Uploaded!",
                            comment: comment,
                        });
                    }
                    ;
                }
                ;
            }
            catch (error) {
                return res.status(400).json({
                    message: "We ran into some issues",
                });
            }
            ;
        }
        ;
    },
];
exports.get_comments = async (req, res, next) => {
    const post = await Post.findById(req.params.id)
        .populate("comments");
    if (!post) {
        return res.json({
            message: "We were unable to retrieve all the comments for this post",
        });
    }
    else {
        // decode any escaped characters and order comments by recency, sort by likes
        const comments = post.comments;
        if (comments.length === 0) {
            return res.json({
                message: "This post doesn't currently have comments, be the first!",
            });
        }
        else {
            comments.forEach((comment) => {
                comment.comment = he_1.default.decode(comment.comment);
            });
            comments.sort((a, b) => {
                if (a.likes > b.likes)
                    return -1;
                if (b.likes > a.likes)
                    return 1;
                return 0;
            });
            return res.json({
                message: "Comments retrieved successfully",
                comments: comments,
            });
        }
        ;
    }
    ;
};
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
exports.like_comment = [
    (0, express_validator_1.check)('id').isMongoId().withMessage('Invalid Comment ID'),
    async (req, res, next) => {
        try {
            const comment = await Comment.findById(req.params.id);
            if (comment) {
                comment.whoLiked.push(req.params.user);
                comment.likes++;
                const updateComment = await Comment.findByIdAndUpdate(req.params.id, comment, { new: true });
                updateComment.comment = he_1.default.decode(updateComment.comment);
                if (updateComment) {
                    return res.json({
                        message: "Your like was added",
                        comment: updateComment,
                    });
                }
                else {
                    return res.status(404).json({
                        message: "We were unable to perform this request",
                    });
                }
                ;
            }
            else {
                return res.json({
                    message: "That comment does not exist",
                });
            }
            ;
        }
        catch (error) {
            return res.status(404).json({
                message: "We were unable to perform this action"
            });
        }
        ;
    },
];
exports.unlike_comment = [
    (0, express_validator_1.check)('id').isMongoId().withMessage('Invalid Comment ID'),
    async (req, res, next) => {
        try {
            const comment = await Comment.findById(req.params.id);
            if (comment) {
                comment.whoLiked.splice(comment.whoLiked.indexOf(req.params.user), 1);
                comment.likes--;
                const updateComment = await Comment.findByIdAndUpdate(req.params.id, comment, { new: true });
                updateComment.comment = he_1.default.decode(updateComment.comment);
                if (updateComment) {
                    return res.json({
                        message: "Your like was removed",
                        comment: updateComment,
                    });
                }
                else {
                    return res.status(404).json({
                        message: "We were unable to perform this request",
                    });
                }
                ;
            }
            else {
                return res.json({
                    message: "That comment does not exist",
                });
            }
            ;
        }
        catch (error) {
            return res.status(404).json({
                message: "We were unable to perform this action"
            });
        }
        ;
    },
];
//# sourceMappingURL=commentController.js.map
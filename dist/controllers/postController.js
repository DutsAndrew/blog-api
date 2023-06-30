"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const dotenv_1 = __importDefault(require("dotenv"));
const luxon_1 = require("luxon");
const he_1 = __importDefault(require("he"));
const User = require("../models/user");
const Post = require("../models/post");
dotenv_1.default.config();
exports.get_posts = async (req, res, next) => {
    try {
        const posts = await Post.find()
            .populate({
            path: "author",
            select: "firstName lastName",
        });
        if (!posts) {
            return res.json({
                message: "There were no posts to retrieve",
            });
        }
        else {
            // unescape characters for returning to client
            posts.forEach((post) => {
                post.title = he_1.default.decode(post.title);
                post.body = he_1.default.decode(post.body);
            });
            if (req.params.sort === 'new') {
                posts.sort((a, b) => {
                    return luxon_1.DateTime.fromISO(b.timestamp).diff(luxon_1.DateTime.fromISO(a.timestamp)).as('milliseconds');
                });
                return res.json({
                    message: "Posts Found",
                    posts: posts,
                });
            }
            else if (req.params.sort === 'hot') {
                posts.sort((a, b) => {
                    const aLikes = a.likes;
                    const bLikes = b.likes;
                    const aTimestamp = luxon_1.DateTime.fromISO(a.timestamp).toMillis();
                    const bTimestamp = luxon_1.DateTime.fromISO(b.timestamp).toMillis();
                    const aScore = aLikes / (Date.now() - aTimestamp);
                    const bScore = bLikes / (Date.now() - bTimestamp);
                    return bScore - aScore;
                });
                return res.json({
                    message: "Posts Found",
                    posts: posts,
                });
            }
            else if (req.params.sort === 'top') {
                posts.sort((a, b) => {
                    return b.likes - a.likes;
                });
                return res.json({
                    message: "Posts Found",
                    posts: posts,
                });
            }
            else {
                return res.status(400).json({
                    message: "Bad Request",
                });
            }
            ;
        }
        ;
    }
    catch (error) {
        return res.json({
            message: "There were issues on the server processing this request",
        });
    }
    ;
};
exports.get_user_posts = async (req, res, next) => {
    const userId = req.user["_id"];
    try {
        const user = await User.findById(userId.toString())
            .populate("posts");
        if (!user) {
            return res.json({
                message: "There are no posts connected with your account",
            });
        }
        else {
            const posts = user.posts;
            // unescape user posts for returning to client/cms
            posts.forEach((post) => {
                post.title = he_1.default.decode(post.title);
                post.body = he_1.default.decode(post.body);
            });
            if (posts.length === 0) {
                return res.json({
                    message: "You haven't created any posts yet, time to go make some!",
                });
            }
            else {
                posts.sort((a, b) => {
                    return luxon_1.DateTime.fromISO(b.timestamp).diff(luxon_1.DateTime.fromISO(a.timestamp)).as('milliseconds');
                });
                return res.json({
                    message: "We found some posts connected to your account",
                    posts: posts,
                });
            }
            ;
        }
        ;
    }
    catch (error) {
        return res.json({
            message: "We encountered an error",
            error: error,
        });
    }
    ;
};
exports.create_post = [
    // Convert the tags to an array.
    (req, res, next) => {
        if (!Array.isArray(req.body.tags)) {
            if (req.body.tags.includes(',')) {
                req.body.tags =
                    req.body.tags.split(',');
            }
            else {
                req.body.tags =
                    typeof req.body.tags === "undefined" ? [] : [req.body.tags];
            }
            ;
        }
        next();
    },
    (0, express_validator_1.body)("title", "Your post must have a title")
        .trim()
        .isLength({ min: 1, max: 150 })
        .withMessage("The title of your post must meet our criteria of at least one character and no more than 25")
        .escape(),
    (0, express_validator_1.body)("body", "Your post must have some body text")
        .trim()
        .isLength({ min: 1, max: 10000 })
        .withMessage("The body of your post must meet our criteria of at least one character and no more than 10000")
        .escape(),
    async (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.json({
                body: req.body.body,
                errors: errors.array(),
                message: "There were errors submitted in the form, please fix them before resubmitting",
                tags: req.body.tags,
                title: req.body.title,
            });
        }
        else {
            const userId = req.user["_id"];
            const newPost = new Post({
                author: userId,
                body: req.body.body,
                comments: [],
                favorites: 0,
                likes: 1,
                tags: req.body.tags,
                timestamp: luxon_1.DateTime.now(),
                title: req.body.title,
                whoLiked: [userId],
                views: 1,
            });
            try {
                const uploadPost = await newPost.save();
                if (!uploadPost) {
                    return res.json({
                        message: "We were unable to upload your post, please try again",
                    });
                }
                else {
                    const user = await User.findById(userId);
                    if (!user) {
                        return res.json({
                            message: "User not found",
                        });
                    }
                    else {
                        const updateUser = await User.findByIdAndUpdate(userId, {
                            $inc: { popularity: 10 },
                            $push: { posts: uploadPost._id },
                        });
                        if (!updateUser) {
                            const removePost = await Post.findByIdAndRemove(uploadPost._id);
                            if (!removePost) {
                                const err = new Error(`${uploadPost._id} was uploaded with no author`);
                                throw err;
                            }
                            else {
                                return res.json({
                                    message: "We had issues updating your account, so we deleted the post, please reupload later",
                                });
                            }
                            ;
                        }
                        else {
                            return res.json({
                                message: "upload success",
                                uploadPost,
                            });
                        }
                        ;
                    }
                    ;
                }
                ;
            }
            catch (error) {
                return res.json({
                    message: "Server error",
                });
            }
            ;
        }
        ;
    },
];
exports.view_post = [
    (0, express_validator_1.check)('id').isMongoId().withMessage('Invalid Post ID'),
    async (req, res, next) => {
        try {
            const post = await Post.findByIdAndUpdate(req.params.id, {
                $inc: { views: 1 },
            }, {
                upsert: false,
            });
            if (!post) {
                return res.json({
                    message: "post not found",
                });
            }
            else {
                return res.json({
                    message: "Post viewed",
                });
            }
            ;
        }
        catch (err) {
            return res.json({
                error: err,
            });
        }
        ;
    },
];
exports.find_posts = [
    async (req, res, next) => {
        try {
            const queryResults = await Post.find({
                $text: { $search: req.params.query }
            }, {
                score: { $meta: "textScore" }
            }).sort({ score: { $meta: "textScore" } }).limit(10);
            if (!queryResults || queryResults.length === 0) {
                return res.json({
                    message: "We don't have any posts that match your query",
                });
            }
            else {
                queryResults.forEach((result) => {
                    result.title = he_1.default.decode(result.title);
                    result.body = he_1.default.decode(result.body);
                });
                return res.json({
                    message: "Here's what we found",
                    posts: queryResults,
                });
            }
            ;
        }
        catch (error) {
            return res.json({
                message: "Something went wrong",
                error: error.message,
            });
        }
        ;
    },
];
exports.put_post = [
    // Convert the tags to an array.
    (req, res, next) => {
        if (!Array.isArray(req.body.tags)) {
            if (req.body.tags.includes(',')) {
                req.body.tags =
                    req.body.tags.split(',');
            }
            else {
                req.body.tags =
                    typeof req.body.tags === "undefined" ? [] : [req.body.tags];
            }
            ;
        }
        next();
    },
    (0, express_validator_1.body)("title", "Your post must have a title")
        .trim()
        .isLength({ min: 1, max: 25 })
        .withMessage("The title of your post must meet our criteria of at least one character and no more than 25")
        .escape(),
    (0, express_validator_1.body)("body", "Your post must have some body text")
        .trim()
        .isLength({ min: 1, max: 10000 })
        .withMessage("The body of your post must meet our criteria of at least one character and no more than 10000")
        .escape(),
    (0, express_validator_1.check)('id').isMongoId().withMessage('Invalid Post ID'),
    async (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.json({
                body: req.body.body,
                errors: errors.array(),
                message: "There were errors submitted in the form, please fix them before resubmitting",
                tags: req.body.tags,
                title: req.body.title,
            });
        }
        else {
            try {
                // find original post to retain some of that data in update
                const findPost = await Post.findById(req.params.id);
                if (!findPost) {
                    return res.json({
                        message: "That post does not exist",
                    });
                }
                else {
                    // check if user is the author of the post, return error if they aren't
                    const userId = req.user["_id"];
                    if (findPost.author.toString() !== userId.toString()) {
                        return res.json({
                            message: "You are not the author of this post and cannot change it's contents",
                        });
                    }
                    else {
                        // add updated data and original data into new post object
                        const updatePost = new Post({
                            author: findPost.author,
                            body: req.body.body,
                            comments: findPost.comments,
                            favorites: findPost.favorites,
                            likes: findPost.likes,
                            tags: req.body.tags,
                            timestamp: findPost.timestamp,
                            title: req.body.title,
                            whoLiked: findPost.whoLiked,
                            views: findPost.views,
                            _id: req.params.id,
                        });
                        const uploadPost = await Post.findByIdAndUpdate(req.params.id, updatePost);
                        if (!uploadPost) {
                            return res.json({
                                message: "We were unable to update your post, please try again",
                            });
                        }
                        else {
                            return res.json({
                                message: "update success",
                                uploadPost,
                            });
                        }
                        ;
                    }
                }
                ;
            }
            catch (error) {
                res.json({
                    message: "We were not able to query the database",
                    error: error,
                });
            }
            ;
        }
        ;
    },
];
exports.delete_post = [
    (0, express_validator_1.check)('id').isMongoId().withMessage('Invalid Post ID'),
    async (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
            });
        }
        else {
            const userId = req.user["_id"];
            try {
                const retrievePost = await Post.findById(req.params.id)
                    .populate("author");
                if (!retrievePost) {
                    return res.json({
                        message: "That post does not exist",
                    });
                }
                else {
                    // post exists, now check if the author of the post matches the token user
                    if (userId.toString() === retrievePost.author._id.toString()) {
                        const userRef = retrievePost.author;
                        const deletePost = await Post.findByIdAndRemove(retrievePost._id);
                        // remove post from user ref
                        const postIndex = userRef.posts.indexOf(retrievePost._id);
                        userRef.posts.splice(postIndex, 1);
                        // update userRef with removed post
                        const updateUser = await User.findByIdAndUpdate(userId, userRef);
                        return res.json({
                            message: "Post Deleted",
                            deletedPost: deletePost,
                        });
                    }
                    else {
                        return res.json({
                            message: "You are not the author of this post and therefore cannot delete it",
                        });
                    }
                    ;
                }
                ;
            }
            catch (error) {
                return res.json({
                    message: "There were issues either finding the post or deleting it, please try again later",
                });
            }
            ;
        }
        ;
    },
];
exports.like_post = [
    (0, express_validator_1.check)('id').isMongoId().withMessage('Invalid Post ID'),
    async (req, res, next) => {
        try {
            const postToLike = await Post.findById(req.params.id);
            if (postToLike) {
                if (!postToLike.whoLiked.includes(req.params.user)) {
                    postToLike.whoLiked.push(req.params.user);
                    postToLike.likes += 1;
                    const updatePost = await Post.findByIdAndUpdate(req.params.id, postToLike);
                    if (!updatePost) {
                        return res.json({
                            message: "Unable to like this post",
                        });
                    }
                    else {
                        return res.json({
                            message: "Like added",
                            status: true,
                        });
                    }
                    ;
                }
                else {
                    return res.json({
                        message: "You've already liked this post",
                    });
                }
                ;
            }
            else {
                return res.json({
                    message: "Unable to like post",
                });
            }
            ;
        }
        catch (error) {
            return res.json({
                message: "That post does not exist",
            });
        }
        ;
    },
];
exports.unlike_post = [
    (0, express_validator_1.check)('id').isMongoId().withMessage('Invalid Post ID'),
    async (req, res, next) => {
        try {
            const postToUnlike = await Post.findById(req.params.id);
            if (postToUnlike) {
                if (postToUnlike.whoLiked.includes(req.params.user)) {
                    // identify user in whoLiked list, splice it out
                    postToUnlike.whoLiked.splice(postToUnlike.whoLiked.indexOf(req.params.user), 1);
                    postToUnlike.likes -= 1;
                    const updatePost = await Post.findByIdAndUpdate(req.params.id, postToUnlike);
                    if (!updatePost) {
                        return res.json({
                            message: "Unable to unlike this post",
                        });
                    }
                    else {
                        return res.json({
                            message: "Like removed",
                            status: true,
                        });
                    }
                    ;
                }
                else {
                    return res.json({
                        message: "You've already unliked this post",
                    });
                }
                ;
            }
            else {
                return res.json({
                    message: "Unable to unlike post",
                });
            }
            ;
        }
        catch (error) {
            return res.json({
                message: "That post does not exist",
            });
        }
        ;
    },
];
//# sourceMappingURL=postController.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User = require("../models/user");
const Post = require("../models/post");
const Comment = require("../models/comment");
exports.get_users = async (req, res, next) => {
    const findUsers = await User.find()
        .sort({ popularity: 1 });
    if (!findUsers) {
        res.json({
            message: "We could not find any users",
        });
    }
    else {
        const strippedUserList = [];
        findUsers.forEach((user) => {
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
    }
    ;
};
exports.get_user = [
    (0, express_validator_1.check)('id').isMongoId().withMessage('Invalid Post ID'),
    async (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
            });
        }
        else {
            const retrieveUser = await User.findById(req.params.id);
            if (!retrieveUser) {
                res.json({
                    message: "User was not found",
                });
            }
            else {
                const strippedUserInformation = {
                    firstName: retrieveUser.firstName,
                    lastName: retrieveUser.lastName,
                    posts: retrieveUser.posts,
                };
                res.json({
                    message: "User found",
                    user: strippedUserInformation,
                });
            }
            ;
        }
        ;
    },
];
exports.put_user = [
    (0, express_validator_1.body)("email", "You must have an email on file to maintain your account")
        .trim()
        .isEmail()
        .withMessage("Your email does not follow the typical email format (IE. hello@gamil.com)")
        .escape(),
    (0, express_validator_1.body)("firstName", "Your account must have a first name on file")
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage("First names are limited to at least one character and no more than 1000 characters.")
        .escape(),
    (0, express_validator_1.body)("lastName", "You must provide a last name in order to create an account")
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage("First names are limited to at least one character and no more than 1000 characters.")
        .escape(),
    (0, express_validator_1.body)("location")
        .trim()
        .escape(),
    (0, express_validator_1.body)("password")
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage("Passwords are limited to at least one character and no more than 1000 characters.")
        .escape(),
    (0, express_validator_1.check)('id').isMongoId().withMessage('Invalid Post ID'),
    async (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
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
        }
        else {
            const userLookUp = await User.findById(req.params.id);
            if (!userLookUp) {
                res.json({
                    message: "the account your trying to update is not in our database, we aborted your request",
                });
            }
            else {
                bcryptjs_1.default.hash(req.body.password, 10, async (err, hashedPassword) => {
                    if (err)
                        return next(err);
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
                    }
                    else {
                        res.json({
                            uploadedUser,
                        });
                    }
                    ;
                }
                catch (err) {
                    return next(err);
                }
                ;
            }
            ;
        }
        ;
    },
];
exports.delete_user = [
    (0, express_validator_1.check)('id').isMongoId().withMessage('Invalid Post ID'),
    async (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
            });
        }
        else {
            const userData = await User.findById(req.params.id)
                .populate("posts")
                .populate("comments");
            userData.posts.forEach(async (post) => {
                const removePost = await Post.findByIdAndRemove(post._id);
                if (!removePost) {
                    res.json({
                        message: "We had trouble removing your post history",
                    });
                }
                ;
            });
            userData.comments.forEach(async (comment) => {
                const removeComment = await Comment.findByIdAndRemove(comment._id);
                if (!removeComment) {
                    res.json({
                        message: "We had trouble removing your comment history",
                    });
                }
                ;
            });
            const removeUser = User.findByIdAndRemove(req.params.id);
            if (!removeUser) {
                res.json({
                    message: "We had trouble deleting your account, but we successfully removed your posts and comments",
                });
            }
            else {
                res.json({
                    message: "We removed all your posts, comments, and deleted your account",
                });
            }
            ;
        }
        ;
    },
];
//# sourceMappingURL=userController.js.map
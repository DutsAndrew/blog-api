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
exports.get_user_account = async (req, res, next) => {
    const userId = req.user["_id"];
    try {
        const userRef = await User.findById(userId);
        // ADD IN ACCOUNT MODIFICATIONS FOR USER PROFILE IMGS
        const strippedUserInformation = {
            email: userRef.email,
            firstName: userRef.firstName,
            lastName: userRef.lastName,
            location: userRef.location,
        };
        return res.json({
            message: "User Found",
            account: strippedUserInformation,
        });
    }
    catch (error) {
        return res.json({
            message: "We had issues finding what you were looking for",
        });
    }
    ;
};
exports.put_user_account = [
    (0, express_validator_1.body)("email", "You must provide an email in order to create an account")
        .trim()
        .isEmail()
        .withMessage("Your format does not match that of an email address (IE. hello@gmail.com)")
        .isLength({ min: 1, max: 1000 })
        .escape(),
    (0, express_validator_1.body)("firstName", "You must provide a first name in order to create an account")
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
        .isAlpha()
        .escape(),
    async (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.json({
                message: "The form you submitted has some errors",
                errors: errors.array(),
            });
        }
        else {
            try {
                const userId = req.user["_id"];
                const userRef = await User.findById(userId);
                if (!userRef) {
                    // no user found
                    return res.json({
                        message: "That account does not exist",
                    });
                }
                else {
                    // user found
                    const updatedUserInstance = new User({
                        email: req.body.email,
                        comments: userRef.comments,
                        firstName: req.body.firstName,
                        img: userRef.img,
                        joined: userRef.joined,
                        lastName: req.body.lastName,
                        location: req.body.location.length !== 0 ? req.body.location : userRef.location,
                        password: userRef.password,
                        popularity: userRef.popularity,
                        posts: userRef.posts,
                        role: userRef.role,
                        _id: userId,
                    });
                    const uploadUpdatedUserInstance = await User.findByIdAndUpdate(userId, updatedUserInstance, { new: true });
                    if (!uploadUpdatedUserInstance) {
                        return res.json({
                            message: "There were issues updating your account",
                        });
                    }
                    else {
                        const strippedUserInformation = {
                            email: uploadUpdatedUserInstance.email,
                            firstName: uploadUpdatedUserInstance.firstName,
                            lastName: uploadUpdatedUserInstance.lastName,
                            location: uploadUpdatedUserInstance.location,
                        };
                        return res.json({
                            message: "We successfully updated your account",
                            account: strippedUserInformation,
                        });
                    }
                }
                ;
            }
            catch (error) {
                return res.json({
                    message: "We had issues processing that request",
                });
            }
            ;
        }
    },
];
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
exports.post_new_password = [
    (0, express_validator_1.body)("oldPassword", "You cannot create a new password without verifying that you have access to your old password")
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage("Passwords are limited to at least one character and no more than 1000 characters.")
        .escape(),
    (0, express_validator_1.body)("newPassword", "You cannot create a new password without the new password")
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage("Passwords are limited to at least one character and no more than 1000 characters.")
        .escape(),
    (0, express_validator_1.body)("confirmNewPassword", "You need to verify your new password by writing it again")
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage("Passwords are limited to at least one character and no more than 1000 characters.")
        .custom((value, { req }) => value === req.body.newPassword)
        .withMessage("Your passwords do not match, please try again")
        .escape(),
    async (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.json({
                message: "There were some errors in your form",
                errors: errors.array(),
            });
        }
        else {
            // data has been validated
            const userId = req.user["_id"];
            try {
                const user = await User.findById(userId);
                if (!user) {
                    return res.json({
                        message: "That user does not exist",
                    });
                }
                else {
                    // user found
                    bcryptjs_1.default.compare(req.body.oldPassword, user.password, (err, validated) => {
                        if (err) {
                            return res.json({
                                message: "The password you sent does not match the one on your account",
                            });
                        }
                        ;
                        if (validated) {
                            bcryptjs_1.default.hash(req.body.newPassword, 10, async (err, hashedPassword) => {
                                if (err) {
                                    return res.json({
                                        message: "Issues hashing password on server, request aborted",
                                    });
                                }
                                if (hashedPassword) {
                                    user.password = hashedPassword;
                                    const updateUser = await User.findByIdAndUpdate(userId, user, { new: true });
                                    if (!updateUser) {
                                        return res.json({
                                            message: "Could not add new password to your account, please try again later",
                                        });
                                    }
                                    else {
                                        // password hashed and added to account
                                        return res.json({
                                            message: "Password has been hashed and added to your account",
                                        });
                                    }
                                    ;
                                }
                                ;
                            });
                        }
                        ;
                    });
                }
                ;
            }
            catch (error) {
                return res.json({
                    message: "We ran into some issues on the server",
                    error: error,
                });
            }
            ;
        }
    },
];
exports.post_user_delete = async (req, res, next) => {
    const userId = req.user["_id"];
    const user = await User.findById(userId);
    if (user._id.toString() !== userId.toString()) {
        // signed in user does not match the user in the db
        return res.json({
            message: "The account your trying to access is not available",
        });
    }
    else {
        // signed in user matches user found in db
        const deleteUser = await User.findByIdAndRemove(userId);
        if (!deleteUser) {
            return res.json({
                message: "User not found",
            });
        }
        else {
            return res.json({
                message: "Account deleted",
                account: deleteUser,
            });
        }
        ;
    }
    ;
};
//# sourceMappingURL=userController.js.map
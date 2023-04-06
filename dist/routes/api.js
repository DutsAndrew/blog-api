"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const appController = require('../controllers/appController');
const commentController = require('../controllers/commentController');
const postController = require('../controllers/postController');
const userController = require('../controllers/userController');
const passportCustomAuth = require("../scripts/authenticate");
router.get('/', (req, res, next) => {
    res.json({
        message: "Welcome to Andrew Dutson's Blog API",
        docs: "https://github.com/DutsAndrew/blog-api",
    });
});
router.post('/signup', appController.post_signup);
router.post('/login', appController.post_login);
router.post('/upload/profile/img', passportCustomAuth, appController.post_upload_profile_img);
router.get('/posts', passportCustomAuth, postController.get_posts);
router.get('/users', passportCustomAuth, userController.get_users);
router.post('/post/create', passportCustomAuth, postController.create_post);
router.get('/post/:id', passportCustomAuth, postController.get_post);
router.put('/post/update/:id', passportCustomAuth, postController.put_post);
4;
router.put('/post/:id/like', passportCustomAuth, postController.like_post);
router.put('/post/:id/unlike', passportCustomAuth, postController.unlike_post);
router.delete('/post/:id', passportCustomAuth, postController.delete_post);
router.get('/user/posts', passportCustomAuth, postController.get_user_posts);
router.get('/user/:id', passportCustomAuth, userController.get_user);
router.put('/user/:id', passportCustomAuth, userController.put_user);
router.delete('/user/:id', passportCustomAuth, userController.delete_user);
router.post('/post/:id/comment/create', passportCustomAuth, commentController.create_comment);
router.get('/post/:id/comments', passportCustomAuth, commentController.get_comments);
router.put('/post/:id/comment/:commentId', passportCustomAuth, commentController.put_comment);
router.delete('/post/:id/comment/:commentId', passportCustomAuth, commentController.delete_comment);
module.exports = router;
//# sourceMappingURL=api.js.map
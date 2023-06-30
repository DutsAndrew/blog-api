"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const appController = require('../controllers/appController');
const announcementsController = require('../controllers/announcementsController');
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
// non-auth requests
router.post('/signup', appController.post_signup);
router.post('/login', appController.post_login);
router.get('/announcements', announcementsController.get_announcements);
router.get('/posts/:sort', postController.get_posts);
router.get('/post/find/:query', postController.find_posts);
router.put('/post/:id/view', postController.view_post);
router.put('/post/:id/like/:user', postController.like_post);
router.put('/post/:id/unlike/:user', postController.unlike_post);
router.post('/post/:id/comment/create/:user', commentController.create_comment);
router.get('/post/:id/comments', commentController.get_comments);
router.put('/comment/:id/like/:user', commentController.like_comment);
router.put('/comment/:id/unlike/:user', commentController.unlike_comment);
// auth required requests
router.post('/announcement/create', passportCustomAuth, announcementsController.post_announcement);
router.post('/upload/profile/img', passportCustomAuth, appController.post_upload_profile_img);
router.get('/users', passportCustomAuth, userController.get_users);
router.get('/user/account', passportCustomAuth, userController.get_user_account);
router.get('/user/:id', passportCustomAuth, userController.get_user);
router.put('/user/account', passportCustomAuth, userController.put_user_account);
router.post('/user/password', passportCustomAuth, userController.post_new_password);
router.post('/user/delete', passportCustomAuth, userController.post_user_delete);
router.put('/user/:id', passportCustomAuth, userController.put_user);
router.delete('/user/:id', passportCustomAuth, userController.delete_user);
router.get('/user/posts/all', passportCustomAuth, postController.get_user_posts);
router.post('/post/create', passportCustomAuth, postController.create_post);
router.put('/post/update/:id', passportCustomAuth, postController.put_post);
router.delete('/post/delete/:id', passportCustomAuth, postController.delete_post);
router.get('/user/comments', passportCustomAuth, commentController.get_user_comments);
router.put('/post/:id/comment/:commentId', passportCustomAuth, commentController.put_comment);
router.delete('/post/:id/comment/:commentId', passportCustomAuth, commentController.delete_comment);
module.exports = router;
//# sourceMappingURL=api.js.map
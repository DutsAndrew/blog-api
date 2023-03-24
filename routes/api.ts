import express, { Request, Response, NextFunction} from 'express';
import passport from 'passport';
const router = express.Router(),
      appController = require('../controllers/appController'),
      commentController = require('../controllers/commentController'),
      postController = require('../controllers/postController'),
      userController = require('../controllers/userController');

router.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.json({
    message: "Welcome to the Blog API",
  });
});

router.post('/signup', appController.post_signup);
router.post('/login', appController.post_login);
router.post('/upload/profile/img', passport.authenticate('jwt', { session: false }), appController.post_upload_profile_img);

router.get('/posts', passport.authenticate('jwt', { session: false }), postController.get_posts);
router.get('/users', passport.authenticate('jwt', { session: false }), userController.get_users);

router.post('/post/create', passport.authenticate('jwt', { session: false }), postController.create_post);
router.get('/post/:id', passport.authenticate('jwt', { session: false }), postController.get_post);
router.put('/post/:id', passport.authenticate('jwt', { session: false }), postController.put_post);
router.delete('/post/:id', passport.authenticate('jwt', { session: false }), postController.delete_post);

router.get('/user/:id', passport.authenticate('jwt', { session: false }), userController.get_user);
router.put('/user/:id', passport.authenticate('jwt', { session: false }), userController.put_user);
router.delete('/user/:id', passport.authenticate('jwt', { session: false }), userController.delete_user);

router.post('/post/comment/create', passport.authenticate('jwt', { session: false }), commentController.create_comment);
router.get('/post/:id/comments', passport.authenticate('jwt', { session: false }), commentController.get_comments);
router.put('/post/:id/comment', passport.authenticate('jwt', { session: false }), commentController.put_comment);
router.delete('/post/:id/comment', passport.authenticate('jwt', { session: false }), commentController.delete_comment);

module.exports = router;
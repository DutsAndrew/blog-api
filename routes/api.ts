import express, { Request, Response, NextFunction} from 'express';
const router = express.Router(),
      appController = require('../controllers/appController'),
      commentController = require('../controllers/commentController'),
      postController = require('../controllers/postController'),
      userController = require('../controllers/userController'),
      auth = require('../scripts/authenticate').passportCustomAuth;

router.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.json({
    message: "Welcome to the Blog API",
  });
});

router.post('/signup', appController.post_signup);
router.post('/login', appController.post_login);
router.post('/upload/profile/img', auth, appController.post_upload_profile_img);

router.get('/posts', auth, postController.get_posts);
router.get('/users', auth, userController.get_users);

router.post('/post/create', auth, postController.create_post);
router.get('/post/:id', auth, postController.get_post);
router.put('/post/:id', auth, postController.put_post);
router.delete('/post/:id', auth, postController.delete_post);

router.get('/user/:id', auth, userController.get_user);
router.put('/user/:id', auth, userController.put_user);
router.delete('/user/:id', auth, userController.delete_user);

router.post('/post/comment/create', auth, commentController.create_comment);
router.get('/post/:id/comments', auth, commentController.get_comments);
router.put('/post/:id/comment', auth, commentController.put_comment);
router.delete('/post/:id/comment', auth, commentController.delete_comment);

module.exports = router;
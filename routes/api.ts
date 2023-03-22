import express, { Request, Response, NextFunction} from 'express';
const router = express.Router(),
      appController = require('../controllers/appController');

router.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.json({
    message: "Welcome to the Blog API",
  });
});

router.post('/signup', appController.post_signup);
router.post('/login', appController.post_login);
router.post('/upload/profile/img', appController.post_upload_profile_img);

module.exports = router;
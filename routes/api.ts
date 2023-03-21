import express, { Request, Response, NextFunction} from 'express';
const router = express.Router(),
      appController = require('../controllers/appController');

router.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.json({
    message: "Welcome to the Blog API",
  });
});

router.post('/login', appController.post_login);

module.exports = router;
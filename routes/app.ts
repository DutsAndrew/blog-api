import express, { Request, Response, NextFunction} from 'express';
const router = express.Router();

router.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.send('This is an API, please hit the API with /api followed by the correct data queries');
});

module.exports = router;
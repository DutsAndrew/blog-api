import createError from 'http-errors';
import express, { Request, Response, NextFunction , Application} from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import passport from 'passport';
import debug from 'debug';
import compression from 'compression';
import helmet from 'helmet';
import RateLimit from 'express-rate-limit';
import cors from 'cors';
const apiRouter = require('./routes/api');
const appRouter = require('./routes/app');
const JwtStrategy = require('./scripts/jwt');

dotenv.config();
const app: Application = express();

// const limiter = RateLimit({
//   windowMs: 1 * 60 * 1000, // 1 minute
//   max: 20,
// });

// database link in
mongoose.set('strictQuery', false);
const mongoDB = process.env.DEVMONGODB;
(async function main() {
  try {
    await mongoose.connect((mongoDB as string));
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'mongo connection error'));
  } catch(err) {
    debug(`Error: ${err}`);
  };
})();

// // // // // // // // // // // // // // // //

passport.use(JwtStrategy);
app.use(cors());
app.use(helmet());
app.use(compression());
// app.use(limiter);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/', appRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err: any, req: Request, res: Response, next: NextFunction) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({
    message: "There was an error accomplishing your request",
    error: err,
    status: err.status,
  });
});

app.listen(process.env.PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${process.env.PORT}`);
});

module.exports = app;
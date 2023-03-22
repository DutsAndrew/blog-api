import createError from 'http-errors';
import express, { Express, Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

const apiRouter = require('./routes/api'),
      appRouter = require('./routes/app');

dotenv.config();
const app = express();

// database link in
mongoose.set('strictQuery', false);
const mongoDB = process.env.DEVMONGODB;
(async function main() {
  try {
    await mongoose.connect((mongoDB as string));
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'mongo connection error'));
  } catch(err) {
    console.error(err);
  };
})();

// // // // // // // // // // // // // // // //

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
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
  res.render('error');
});

app.listen(process.env.PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${process.env.PORT}`);
});

module.exports = app;
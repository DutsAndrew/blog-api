import { Request, Response, NextFunction } from 'express';
import { check, body, validationResult } from 'express-validator';

exports.create_comment = [
  (req: Request, res: Response, next: NextFunction) => {
    res.json({
      message: "Not implemented",
    });
  },
];

exports.get_comments = (req: Request, res: Response, next: NextFunction) => {
  res.json({
    message: "Not implemented",
  });
};

exports.put_comment = [
  (req: Request, res: Response, next: NextFunction) => {
    res.json({
      message: "Not implemented",
    });
  },
];

exports.delete_comment = (req: Request, res: Response, next: NextFunction) => {
  res.json({
    message: "Not implemented",
  });
};
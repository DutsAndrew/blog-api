import { Request, Response, NextFunction } from 'express';
import { check, body, validationResult } from 'express-validator';

exports.get_users = (req: Request, res: Response, next: NextFunction) => {
  res.json({
    message: "Not implemented",
  });
};

exports.get_user = (req: Request, res: Response, next: NextFunction) => {
  res.json({
    message: "Not implemented",
  });
};

exports.put_user = [
  (req: Request, res: Response, next: NextFunction) => {
    res.json({
      message: "Not implemented",
    });
  },
];

exports.delete_user = (req: Request, res: Response, next: NextFunction) => {
  res.json({
    message: "Not implemented",
  });
};
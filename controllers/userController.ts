import { Request, Response, NextFunction } from 'express';
import { check, body, validationResult } from 'express-validator';
const User = require("../models/user");

exports.get_users = async (req: Request, res: Response, next: NextFunction) => {
  const findUsers = await User.find()
    .sort({ popularity: 1 });
  
  if (!findUsers) {
    res.json({
      message: "We could not find any users",
    });
  } else {
    const strippedUserList: any[] = [];
    findUsers.forEach((user: any) => {
      const userToRender = {
        firstName: user.firstName,
        lastName: user.lastName,
        posts: user.posts,
      };
      strippedUserList.push(userToRender);
    });
    res.json({
      message: "Users found",
      users: strippedUserList,
    });
  };
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
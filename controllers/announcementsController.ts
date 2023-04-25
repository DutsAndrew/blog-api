import { Request, Response, NextFunction } from 'express';
const Announcement = require('../models/announcement');

exports.get_announcements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const announcements = await Announcement.find();
    if (!announcements) {
      return res.json({
        message: "There are no announcements",
      });
    } else {
      // announcements found
      return res.json({
        message: "Announcements found",
        announcements: announcements,
      });
    };
  } catch(error) {
    return res.status(400).json({
      message: "Whoops, that's not going to work",
    });
  };
};
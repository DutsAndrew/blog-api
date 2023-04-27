import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import he from 'he';
const Announcement = require('../models/announcement');
const User = require('../models/user');

exports.get_announcements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const announcements = await Announcement.find();
    if (!announcements) {
      return res.json({
        message: "There are no announcements",
      });
    } else {
      // announcements found
      announcements.forEach((announcement) => {
        announcement.announcement = he.decode(announcement.announcement);
      });
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

exports.post_announcement = [
  // check if user is an admin
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user["_id"];
    const user = await User.findById(userId);
    if (user.role === 'admin') {
      next();
    } else {
      // user is not an admin
      return res.json({
        message: "you do not have the appropriate access to perform that action",
      });
    };
  },

  body("announcement", "Your announcement must have text to announce")
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage("The body of your announcement must meet our criteria of at least one character and no more than 10000")
    .escape(),

  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({
        announcement: req.body.announcement,
        errors: errors.array(),
        message: "There were errors submitted in the form, please fix them before resubmitting",
        title: req.body.title,
      });
    } else {
      const newAnnouncement = new Announcement({
        announcement: req.body.announcement,
      });
      try {
        const uploadAnnouncement = await newAnnouncement.save();
        if (!uploadAnnouncement) {
          return res.json({
            message: "We were unable to save your post",
          });
        } else {
          return res.json({
            message: "announcement uploaded successfully",
            announcement: uploadAnnouncement,
          });
        };
      } catch(error) {
        return res.json({
          message: "We ran into some issues, oops",
        });
      };
    };
  },
];
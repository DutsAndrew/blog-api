import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const AnnouncementSchema = new Schema({
  announcement: {
    type: String,
    required: true,
  },
});

module.exports =  mongoose.model("Announcement", AnnouncementSchema);
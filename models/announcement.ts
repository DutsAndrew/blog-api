import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const AnnouncementSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
});

module.exports =  mongoose.model("Announcement", AnnouncementSchema);
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  comments: {
    type: Array,
    required: true,
  },
  favorites: {
    type: Number,
    required: true,
  },
  likes: {
    type: Number,
    required: true,
  },
  tags: {
    type: Array,
    required: false,
  },
  timestamp: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  whoLiked: {
    type: Array,
    required: true,
  },
});

module.exports = mongoose.model("Post", PostSchema);
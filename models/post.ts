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
  comments: [
    { 
      type: Schema.Types.ObjectId,
      ref: 'Comment'
    },
  ],
  favorites: {
    type: Schema.Types.Number,
    required: true,
  },
  likes: {
    type: Schema.Types.Number,
    required: true,
  },
  tags: {
    type: [String],
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
    type: [String],
    required: true,
  },
});

module.exports =  mongoose.model("Post", PostSchema);
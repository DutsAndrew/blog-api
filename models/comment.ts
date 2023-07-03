import mongoose, { Document } from 'mongoose';
const Schema = mongoose.Schema;

export type CommentDoc = Document & {
  author: string;
  comment: string;
  likes: number;
  timestamp: string;
};

const CommentSchema = new Schema({
  author: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  likes: {
    type: Schema.Types.Number,
    required: true,
  },
  timestamp: {
    type: String,
    required: true,
  },
  user: {
    type: String,
    required: true,
  },
  whoLiked: {
    type: [String],
    required: true,
  },
  postRef: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: false,
  }
});

module.exports = mongoose.model<CommentDoc>("Comment", CommentSchema);
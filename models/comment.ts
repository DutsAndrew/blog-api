import mongoose, { Document } from 'mongoose';
const Schema = mongoose.Schema;

export type CommentDoc = Document & {
  author: import("mongoose").Schema.Types.ObjectId;
  comment: string;
  likes: number;
  timestamp: string;
};

const CommentSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
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
});

module.exports = mongoose.model<CommentDoc>("Comment", CommentSchema);
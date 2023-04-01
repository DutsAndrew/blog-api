import mongoose, { Document } from 'mongoose';
const Schema = mongoose.Schema;

export type PostDoc = Document & {
  author: {
    type: import("mongoose").Schema.Types.ObjectId;
    ref: 'User';
    required: true;
  },
  body: string;
  comments: any[];
  favorites: number;
  likes: number;
  tags: string[];
  timestamp: string;
  title: string;
  whoLiked: string[];
};

const PostSchema = new Schema<PostDoc>({
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

module.exports =  mongoose.model<PostDoc>("Post", PostSchema);
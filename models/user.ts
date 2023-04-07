import mongoose, { Document } from 'mongoose';
import { ObjectId } from 'mongodb';
const Schema = mongoose.Schema;

export type UserDoc = Document & {
  email: string;
  comments: string[];
  firstName: string;
  img: string;
  joined: string;
  lastName: string;
  location: string;
  password: string;
  popularity: number;
  posts: ObjectId[];
  role: string;
};

const UserSchema = new Schema<UserDoc>({
  email: {
    type: String,
    required: true,
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      required: true,
    }
  ],
  firstName: {
    type: String,
    required: true,
  },
  img: {
    type: String,
    required: false,
  },
  joined: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: true,
  },
  popularity: {
    type: Number,
    required: true,
  },
  posts: [
    { 
      type: Schema.Types.ObjectId,
      ref: 'Post'
    },
  ],
  role: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model<UserDoc>("User", UserSchema);
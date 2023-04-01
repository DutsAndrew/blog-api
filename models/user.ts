import mongoose, { Document } from 'mongoose';
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
  posts: object[];
  role: string;
};

const UserSchema = new Schema<UserDoc>({
  email: {
    type: String,
    required: true,
  },
  comments: {
    type: [String],
    required: true,
  },
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
  posts: {
    type: [Object],
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model<UserDoc>("User", UserSchema);
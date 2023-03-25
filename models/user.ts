import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: {
    type: String,
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
    type: Array,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("User", UserSchema);
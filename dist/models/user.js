"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const UserSchema = new Schema({
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
module.exports = mongoose_1.default.model("User", UserSchema);
//# sourceMappingURL=user.js.map
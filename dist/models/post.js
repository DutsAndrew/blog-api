"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
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
    views: {
        type: Number,
        required: true,
    },
});
module.exports = mongoose_1.default.model("Post", PostSchema);
//# sourceMappingURL=post.js.map
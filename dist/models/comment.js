"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
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
});
module.exports = mongoose_1.default.model("Comment", CommentSchema);
//# sourceMappingURL=comment.js.map
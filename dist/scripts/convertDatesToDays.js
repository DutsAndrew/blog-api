"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const convertDatesToDays = (posts) => {
    // this preserves the timezone while getting today's date to compare to post creation
    let date = new Date();
    const offset = date.getTimezoneOffset();
    date = new Date(date.getTime() - (offset * 60 * 1000));
    const today = date.toISOString().split('T')[0];
    posts.sort;
};
exports.default = convertDatesToDays;
//# sourceMappingURL=convertDatesToDays.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const passport_1 = __importDefault(require("passport"));
const debug_1 = __importDefault(require("debug"));
const compression_1 = __importDefault(require("compression"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const apiRouter = require('./routes/api');
const appRouter = require('./routes/app');
const JwtStrategy = require('./scripts/jwt');
dotenv_1.default.config();
const app = (0, express_1.default)();
// const limiter = RateLimit({
//   windowMs: 1 * 60 * 1000, // 1 minute
//   max: 20,
// });
// database link in
mongoose_1.default.set('strictQuery', false);
const mongoDB = process.env.DEVMONGODB;
(async function main() {
    try {
        await mongoose_1.default.connect(mongoDB);
        const db = mongoose_1.default.connection;
        db.on('error', () => {
            (0, debug_1.default)('Error: MongoDB disconnected');
            throw new Error('MongoDB has disconnected');
        });
    }
    catch (err) {
        (0, debug_1.default)(`Error: ${err}`);
        throw new Error('Failed to connect to MongoDB');
    }
    ;
})();
// // // // // // // // // // // // // // // //
passport_1.default.use(JwtStrategy);
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
// app.use(limiter);
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use('/', appRouter);
app.use('/api', apiRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next((0, http_errors_1.default)(404));
});
// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.json({
        message: "There was an error accomplishing your request",
        error: err,
        status: err.status,
    });
});
app.listen(process.env.PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${process.env.PORT}`);
});
module.exports = app;
//# sourceMappingURL=app.js.map
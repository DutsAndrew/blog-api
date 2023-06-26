"use strict";
// THIS CAN BE USED AS A TEMPLATE
// Setup to update all items in a collection to have new objects added to them
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
mongoose_1.default.set('strictQuery', false);
(async function connectToDB() {
    const mongoDB = process.env.DEVMONGODB;
    await mongoose_1.default.connect(mongoDB);
    const db = mongoose_1.default.connection;
    updateCollection(db);
})();
const updateCollection = async (db) => {
    const collectionToUpdate = db.collection("posts");
    const posts = await collectionToUpdate.find();
    for (const post of posts) {
        await collectionToUpdate.updateOne({ _id: post._id }, { $set: { view: 1 } }, { upsert: false });
    }
    ;
};
//# sourceMappingURL=updateAllInDB.js.map
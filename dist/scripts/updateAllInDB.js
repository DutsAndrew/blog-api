// THIS CAN BE USED AS A TEMPLATE
// Setup to update all items in a collection to have new objects added to them
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
async function connectToDB() {
    const mongoDB = ''; // insert mongoDB URI here, do not leave or commit it to GitHub
    await mongoose.connect(mongoDB);
    const db = mongoose.connection;
    updateCollection(db);
}
;
const updateCollection = async (db) => {
    db.collection("posts").updateMany({
        "views": { "$exists": false }
    }, {
        "$set": { "views": 1 },
    }, {
        "upsert": false,
    });
};
connectToDB();
//# sourceMappingURL=updateAllInDB.js.map
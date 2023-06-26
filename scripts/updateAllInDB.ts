// THIS CAN BE USED AS A TEMPLATE
  // Setup to update all items in a collection to have new objects added to them

import mongoose from 'mongoose';
mongoose.set('strictQuery', false);

(async function connectToDB() {
    const mongoDB = process.env.DEVMONGODB;
    await mongoose.connect((mongoDB as string));
    const db = mongoose.connection;
    updateCollection(db);
})();

const updateCollection = async (db) => {
    const collectionToUpdate = db.collection("posts");
    const posts = await collectionToUpdate.find();

    for (const post of posts) {
        await collectionToUpdate.updateOne(
            { _id: post._id },
            { $set: { view: 1 }},
            { upsert: false },
        );
    };
};
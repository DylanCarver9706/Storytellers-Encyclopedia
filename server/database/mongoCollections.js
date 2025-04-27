const { connectToDatabase } = require("./mongoConnection");

let collections = {};

const initializeCollections = async () => {
  const db = await connectToDatabase();
  collections.usersCollection = db.collection("Users");
  collections.logsCollection = db.collection("Logs");
  collections.campaignsCollection = db.collection("Campaigns");
  collections.timelinesCollection = db.collection("Timelines");
  collections.eventsCollection = db.collection("Events");
  collections.familiesCollection = db.collection("Families");
  collections.charactersCollection = db.collection("Characters");
  console.log("Collections initialized");
};

module.exports = { initializeCollections, collections };

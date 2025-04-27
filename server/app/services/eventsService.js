const { collections } = require("../../database/mongoCollections");
const { ObjectId } = require("mongodb");
const {
  createMongoDocument,
  updateMongoDocument,
} = require("../../database/middlewares/mongo");

const getAllEvents = async () => {
  return await collections.eventsCollection.find().toArray();
};

const getEventById = async (id) => {
  return await collections.eventsCollection.findOne({
    _id: ObjectId.createFromHexString(id),
  });
};

const createEvent = async (eventData) => {
  return await createMongoDocument(collections.eventsCollection, eventData);
};

const updateEvent = async (id, eventData) => {
  return await updateMongoDocument(
    collections.eventsCollection,
    id,
    { $set: eventData }
  );
};

const deleteEvent = async (id) => {
  return await collections.eventsCollection.deleteOne({
    _id: ObjectId.createFromHexString(id),
  });
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};

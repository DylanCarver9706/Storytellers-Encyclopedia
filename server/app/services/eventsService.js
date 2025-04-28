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
  const { timelineId, ...rest } = eventData;
  const mongoData = {
    ...rest,
    timelineId: ObjectId.createFromHexString(timelineId),
  };
  const mongoDocument = await createMongoDocument(
    collections.eventsCollection,
    mongoData,
    true
  );
  if (!mongoDocument) {
    throw new Error("Failed to create event");
  }
  return mongoDocument;
};

const updateEvent = async (id, eventData) => {
  return await updateMongoDocument(
    collections.eventsCollection,
    id,
    { $set: eventData },
    true
  );
};

const getEventsByTimelineId = async (timelineId) => {
  return await collections.eventsCollection.find({
    timelineId: ObjectId.createFromHexString(timelineId),
  }).toArray();
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
  getEventsByTimelineId,
};

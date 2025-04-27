const { collections } = require("../../database/mongoCollections");
const { ObjectId } = require("mongodb");
const {
  createMongoDocument,
  updateMongoDocument,
} = require("../../database/middlewares/mongo");

const getAllTimelines = async () => {
  return await collections.timelinesCollection.find().toArray();
};

const getTimelineById = async (id) => {
  return await collections.timelinesCollection.findOne({
    _id: ObjectId.createFromHexString(id),
  });
};

const createTimeline = async (timelineData) => {
  return await createMongoDocument(
    collections.timelinesCollection,
    timelineData
  );
};

const updateTimeline = async (id, timelineData) => {
  return await updateMongoDocument(
    collections.timelinesCollection,
    id,
    timelineData
  );
};

const deleteTimeline = async (id) => {
  return await collections.timelinesCollection.deleteOne({
    _id: ObjectId.createFromHexString(id),
  });
};

module.exports = {
  getAllTimelines,
  getTimelineById,
  createTimeline,
  updateTimeline,
  deleteTimeline,
};

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

const getTimelinesByCampaignId = async (campaignId) => {
  return await collections.timelinesCollection
    .find({
      campaignId: ObjectId.createFromHexString(campaignId),
    })
    .toArray();
};

const createTimeline = async (timelineData) => {
  const { campaignId, ...rest } = timelineData;
  const mongoData = {
    ...rest,
    campaignId: ObjectId.createFromHexString(campaignId),
  };
  const mongoDocument = await createMongoDocument(
    collections.timelinesCollection,
    mongoData,
    true
  );
  if (!mongoDocument) {
    throw new Error("Failed to create timeline");
  }
  return mongoDocument;
};

const updateTimeline = async (id, timelineData) => {
  const updatedDocument = await updateMongoDocument(
    collections.timelinesCollection,
    id,
    {
      $set: timelineData,
    },
    true
  );
  return updatedDocument;
};

const deleteTimeline = async (id) => {
  return await collections.timelinesCollection.deleteOne({
    _id: ObjectId.createFromHexString(id),
  });
};

module.exports = {
  getAllTimelines,
  getTimelineById,
  getTimelinesByCampaignId,
  createTimeline,
  updateTimeline,
  deleteTimeline,
};

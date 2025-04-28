const { collections } = require("../../database/mongoCollections");
const { ObjectId } = require("mongodb");
const {
  createMongoDocument,
  updateMongoDocument,
} = require("../../database/middlewares/mongo");

const getAllCampaigns = async () => {
  return await collections.campaignsCollection.find().toArray();
};

const getCampaignsByOwnerId = async (ownerId) => {
  return await collections.campaignsCollection
    .find({
      ownerId: ObjectId.createFromHexString(ownerId),
    })
    .toArray();
};

const getCampaignById = async (id) => {
  return await collections.campaignsCollection.findOne({
    _id: ObjectId.createFromHexString(id),
  });
};

const createCampaign = async (campaignData) => {
  const { ownerId, ...rest } = campaignData;
  const mongoDocument = {
    ownerId: ObjectId.createFromHexString(ownerId),
    ...rest,
  };
  return await createMongoDocument(collections.campaignsCollection, mongoDocument, true);
};

const updateCampaign = async (id, campaignData) => {
  return await updateMongoDocument(collections.campaignsCollection, id, {
    $set: campaignData,
  });
};

const deleteCampaign = async (id) => {
  return await collections.campaignsCollection.deleteOne({
    _id: ObjectId.createFromHexString(id),
  });
};

module.exports = {
  getAllCampaigns,
  getCampaignsByOwnerId,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
};

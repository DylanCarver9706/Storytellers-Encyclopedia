const { collections } = require("../../database/mongoCollections");
const { ObjectId } = require("mongodb");
const {
  createMongoDocument,
  updateMongoDocument,
} = require("../../database/middlewares/mongo");

const getAllCampaigns = async () => {
  return await collections.campaignsCollection.find().toArray();
};

const getCampaignById = async (id) => {
  return await collections.campaignsCollection.findOne({
    _id: ObjectId.createFromHexString(id),
  });
};

const createCampaign = async (campaignData) => {
  return await createMongoDocument(
    collections.campaignsCollection,
    campaignData
  );
};

const updateCampaign = async (id, campaignData) => {
  return await updateMongoDocument(
    collections.campaignsCollection,
    id,
    campaignData
  );
};

const deleteCampaign = async (id) => {
  return await collections.campaignsCollection.deleteOne({
    _id: ObjectId.createFromHexString(id),
  });
};

module.exports = {
  getAllCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
};

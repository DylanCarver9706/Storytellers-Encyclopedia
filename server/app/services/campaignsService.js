const { collections } = require("../../database/mongoCollections");
const { ObjectId } = require("mongodb");
const {
  createMongoDocument,
  updateMongoDocument,
} = require("../../database/middlewares/mongo");
const { sendEmail } = require("../middlewares/nodemailer");

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
  return await createMongoDocument(
    collections.campaignsCollection,
    mongoDocument,
    true
  );
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

const sendCampaignInvite = async (campaignId, email) => {
  const campaign = await getCampaignById(campaignId);
  if (!campaign) {
    throw new Error("Campaign not found");
  }

  const inviteLink = `${
    process.env.ENV === "production"
      ? process.env.PROD_CLIENT_URLS.split(",")[1]
      : process.env.DEV_CLIENT_URL
  }/Signup?ref=${campaignId}`;

  const emailSubject = `Join ${campaign.title} on Storyteller's Encyclopedia`;
  const emailHtml = `
    <h2>Join ${campaign.title} on Storyteller's Encyclopedia</h2>
    <p>You've been invited to join the campaign "${campaign.title}" on Storyteller's Encyclopedia.</p>
    <p>Click the button below to sign up and join:</p>
    <a href="${inviteLink}" style="
      display: inline-block;
      padding: 10px 20px;
      background-color: #2196f3;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      margin-top: 20px;
    ">Join Campaign</a>
  `;

  await sendEmail(email, emailSubject, null, emailHtml);
  return { success: true };
};

const acceptCampaignInvite = async (campaignId, userId) => {
  const campaign = await getCampaignById(campaignId);
  if (!campaign) {
    throw new Error("Campaign not found");
  }

  // Check if user is already a player
  if (campaign.players && campaign.players.includes(userId)) {
    throw new Error("User is already a player in this campaign");
  }

  return await updateMongoDocument(
    collections.campaignsCollection,
    campaignId,
    {
      $push: { players: ObjectId.createFromHexString(userId) },
    },
    true
  );
};

const getCampaignsByPlayerId = async (playerId) => {
  return await collections.campaignsCollection
    .find({
      players: ObjectId.createFromHexString(playerId),
    })
    .toArray();
};

module.exports = {
  getAllCampaigns,
  getCampaignsByOwnerId,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  sendCampaignInvite,
  acceptCampaignInvite,
  getCampaignsByPlayerId,
};

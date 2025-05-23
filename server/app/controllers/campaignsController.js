const campaignService = require("../services/campaignsService");

const getAllCampaigns = async (req, res, logError) => {
  try {
    const campaigns = await campaignService.getAllCampaigns();
    res.status(200).json(campaigns);
  } catch (error) {
    logError(error);
  }
};

const getCampaignsByOwnerId = async (req, res, logError) => {
  try {
    const campaigns = await campaignService.getCampaignsByOwnerId(
      req.params.ownerId
    );
    res.status(200).json(campaigns);
  } catch (error) {
    logError(error);
  }
};

const getCampaignById = async (req, res, logError) => {
  try {
    const campaign = await campaignService.getCampaignById(req.params.id);
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });
    res.status(200).json(campaign);
  } catch (error) {
    logError(error);
  }
};

const createCampaign = async (req, res, logError) => {
  try {
    const newCampaign = await campaignService.createCampaign(req.body);
    res.status(201).json(newCampaign);
  } catch (error) {
    logError(error);
  }
};

const updateCampaign = async (req, res, logError) => {
  try {
    const updatedCampaign = await campaignService.updateCampaign(
      req.params.id,
      req.body
    );
    res.status(200).json(updatedCampaign);
  } catch (error) {
    logError(error);
  }
};

const deleteCampaign = async (req, res, logError) => {
  try {
    await campaignService.deleteCampaign(req.params.id);
    res.status(200).json({ message: "Campaign deleted successfully" });
  } catch (error) {
    logError(error);
  }
};

const sendCampaignInvite = async (req, res, logError) => {
  try {
    await campaignService.sendCampaignInvite(
      req.params.campaignId,
      req.body.email
    );
    res.status(200).json({ message: "Campaign invite sent successfully" });
  } catch (error) {
    logError(error);
  }
};

const acceptCampaignInvite = async (req, res, logError) => {
  try {
    const { campaignId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const updatedCampaign = await campaignService.acceptCampaignInvite(
      campaignId,
      userId
    );
    res.status(200).json(updatedCampaign);
  } catch (error) {
    logError(error);
    res.status(400).json({ error: error.message });
  }
};

const getCampaignsByPlayerId = async (req, res, logError) => {
  try {
    const campaigns = await campaignService.getCampaignsByPlayerId(
      req.params.playerId
    );
    res.status(200).json(campaigns);
  } catch (error) {
    logError(error);
  }
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
 
const express = require("express");
const router = express.Router();
const campaignController = require("../controllers/campaignsController");
const { verifyFirebaseToken } = require("../middlewares/firebaseAdmin");

router.get("/", verifyFirebaseToken(), campaignController.getAllCampaigns);
router.get(
  "/owner/:ownerId",
  verifyFirebaseToken(),
  campaignController.getCampaignsByOwnerId
);
router.get(
  "/player/:playerId",
  verifyFirebaseToken(),
  campaignController.getCampaignsByPlayerId
);
router.get("/:id", verifyFirebaseToken(), campaignController.getCampaignById);
router.post("/", verifyFirebaseToken(), campaignController.createCampaign);
router.put("/:id", verifyFirebaseToken(), campaignController.updateCampaign);
router.delete("/:id", verifyFirebaseToken(), campaignController.deleteCampaign);
router.post(
  "/:campaignId/invite",
  verifyFirebaseToken(),
  campaignController.sendCampaignInvite
);
router.post(
  "/:campaignId/accept-invite",
  verifyFirebaseToken(),
  campaignController.acceptCampaignInvite
);

module.exports = router;

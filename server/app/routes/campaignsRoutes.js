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
router.get("/:id", verifyFirebaseToken(), campaignController.getCampaignById);
router.post("/", verifyFirebaseToken(), campaignController.createCampaign);
router.put("/:id", verifyFirebaseToken(), campaignController.updateCampaign);
router.delete("/:id", verifyFirebaseToken(), campaignController.deleteCampaign);

module.exports = router;

const express = require("express");
const router = express.Router();
const characterController = require("../controllers/charactersController");
const { verifyFirebaseToken } = require("../middlewares/firebaseAdmin");

router.get("/", verifyFirebaseToken(), characterController.getAllCharacters);
router.get("/:id", verifyFirebaseToken(), characterController.getCharacterById);
router.get(
  "/campaign/:campaignId",
  verifyFirebaseToken(),
  characterController.getCharactersByCampaignId
);
router.post("/", verifyFirebaseToken(), characterController.createCharacter);
router.put("/:id", verifyFirebaseToken(), characterController.updateCharacter);
router.put(
  "/:id/attributes",
  verifyFirebaseToken(),
  characterController.updateCharacterAttributes
);
router.delete(
  "/:id",
  verifyFirebaseToken(),
  characterController.deleteCharacter
);

module.exports = router;

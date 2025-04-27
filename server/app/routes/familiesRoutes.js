const express = require("express");
const router = express.Router();
const familyController = require("../controllers/familiesController");
const { verifyFirebaseToken } = require("../middlewares/firebaseAdmin");

router.get("/", verifyFirebaseToken(), familyController.getAllFamilies);
router.get("/:id", verifyFirebaseToken(), familyController.getFamilyById);
router.post("/", verifyFirebaseToken(), familyController.createFamily);
router.put("/:id", verifyFirebaseToken(), familyController.updateFamily);
router.delete("/:id", verifyFirebaseToken(), familyController.deleteFamily);

module.exports = router;

const express = require("express");
const multer = require("multer");
const firebaseController = require("../controllers/firebaseController");
const { verifyFirebaseToken } = require("../middlewares/firebaseAdmin");

const router = express.Router();

router.get(
  "/storage/identity-verification-images",
  verifyFirebaseToken(true),
  firebaseController.getIdentityVerificationImages
);

// Set up Multer for handling single map image upload
const uploadMap = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
    files: 1, // Only one file per upload
  },
});

router.post(
  "/storage/upload-map",
  verifyFirebaseToken(),
  uploadMap.single("mapImage"),
  firebaseController.uploadMapImage
);

router.post(
  "/storage/delete",
  verifyFirebaseToken(true),
  firebaseController.deleteUserIdvFiles
);

module.exports = router;

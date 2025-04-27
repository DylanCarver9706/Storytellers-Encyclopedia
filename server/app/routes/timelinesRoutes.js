const express = require("express");
const router = express.Router();
const timelineController = require("../controllers/timelinesController");
const { verifyFirebaseToken } = require("../middlewares/firebaseAdmin");

router.get("/", verifyFirebaseToken(), timelineController.getAllTimelines);
router.get("/:id", verifyFirebaseToken(), timelineController.getTimelineById);
router.post("/", verifyFirebaseToken(), timelineController.createTimeline);
router.put("/:id", verifyFirebaseToken(), timelineController.updateTimeline);
router.delete("/:id", verifyFirebaseToken(), timelineController.deleteTimeline);

module.exports = router;

const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventsController");
const { verifyFirebaseToken } = require("../middlewares/firebaseAdmin");

router.get("/", verifyFirebaseToken(), eventController.getAllEvents);
router.get(
  "/timeline/:timelineId",
  verifyFirebaseToken(),
  eventController.getEventsByTimelineId
);
router.get("/:id", verifyFirebaseToken(), eventController.getEventById);
router.post("/", verifyFirebaseToken(), eventController.createEvent);
router.put("/:id", verifyFirebaseToken(), eventController.updateEvent);
router.delete("/:id", verifyFirebaseToken(), eventController.deleteEvent);

module.exports = router;

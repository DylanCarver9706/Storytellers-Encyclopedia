const timelineService = require("../services/timelinesService");

const getAllTimelines = async (req, res, logError) => {
  try {
    const timelines = await timelineService.getAllTimelines();
    res.status(200).json(timelines);
  } catch (error) {
    logError(error);
  }
};

const getTimelineById = async (req, res, logError) => {
  try {
    const timeline = await timelineService.getTimelineById(req.params.id);
    if (!timeline) return res.status(404).json({ error: "Timeline not found" });
    res.status(200).json(timeline);
  } catch (error) {
    logError(error);
  }
};

const getTimelinesByCampaignId = async (req, res, logError) => {
  try {
    const timelines = await timelineService.getTimelinesByCampaignId(
      req.params.campaignId
    );
    res.status(200).json(timelines);
  } catch (error) {
    logError(error);
  }
};

const createTimeline = async (req, res, logError) => {
  try {
    const newTimeline = await timelineService.createTimeline(req.body);
    res.status(201).json(newTimeline);
  } catch (error) {
    logError(error);
  }
};

const updateTimeline = async (req, res, logError) => {
  try {
    const updatedTimeline = await timelineService.updateTimeline(
      req.params.id,
      req.body
    );
    res.status(200).json(updatedTimeline);
  } catch (error) {
    logError(error);
  }
};

const deleteTimeline = async (req, res, logError) => {
  try {
    await timelineService.deleteTimeline(req.params.id);
    res.status(200).json({ message: "Timeline deleted successfully" });
  } catch (error) {
    logError(error);
  }
};

module.exports = {
  getAllTimelines,
  getTimelineById,
  getTimelinesByCampaignId,
  createTimeline,
  updateTimeline,
  deleteTimeline,
};

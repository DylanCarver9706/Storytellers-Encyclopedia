const eventService = require("../services/eventsService");

const getAllEvents = async (req, res, logError) => {
  try {
    const events = await eventService.getAllEvents();
    res.status(200).json(events);
  } catch (error) {
    logError(error);
  }
};

const getEventById = async (req, res, logError) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.status(200).json(event);
  } catch (error) {
    logError(error);
  }
};

const createEvent = async (req, res, logError) => {
  try {
    const newEvent = await eventService.createEvent(req.body);
    res.status(201).json(newEvent);
  } catch (error) {
    logError(error);
  }
};

const updateEvent = async (req, res, logError) => {
  try {
    const updatedEvent = await eventService.updateEvent(
      req.params.id,
      req.body
    );
    res.status(200).json(updatedEvent);
  } catch (error) {
    logError(error);
  }
};

const deleteEvent = async (req, res, logError) => {
  try {
    await eventService.deleteEvent(req.params.id);
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    logError(error);
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};

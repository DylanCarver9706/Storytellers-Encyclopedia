const familyService = require("../services/familiesService");

const getAllFamilies = async (req, res, logError) => {
  try {
    const families = await familyService.getAllFamilies();
    res.status(200).json(families);
  } catch (error) {
    logError(error);
  }
};

const getFamilyById = async (req, res, logError) => {
  try {
    const family = await familyService.getFamilyById(req.params.id);
    if (!family) return res.status(404).json({ error: "Family not found" });
    res.status(200).json(family);
  } catch (error) {
    logError(error);
  }
};

const createFamily = async (req, res, logError) => {
  try {
    const newFamily = await familyService.createFamily(req.body);
    res.status(201).json(newFamily);
  } catch (error) {
    logError(error);
  }
};

const updateFamily = async (req, res, logError) => {
  try {
    const updatedFamily = await familyService.updateFamily(
      req.params.id,
      req.body
    );
    res.status(200).json(updatedFamily);
  } catch (error) {
    logError(error);
  }
};

const deleteFamily = async (req, res, logError) => {
  try {
    await familyService.deleteFamily(req.params.id);
    res.status(200).json({ message: "Family deleted successfully" });
  } catch (error) {
    logError(error);
  }
};

module.exports = {
  getAllFamilies,
  getFamilyById,
  createFamily,
  updateFamily,
  deleteFamily,
};

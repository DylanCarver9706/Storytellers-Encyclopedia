const characterService = require("../services/charactersService");

const getAllCharacters = async (req, res, logError) => {
  try {
    const characters = await characterService.getAllCharacters();
    res.status(200).json(characters);
  } catch (error) {
    logError(error);
  }
};

const getCharacterById = async (req, res, logError) => {
  try {
    const character = await characterService.getCharacterById(req.params.id);
    if (!character)
      return res.status(404).json({ error: "Character not found" });
    res.status(200).json(character);
  } catch (error) {
    logError(error);
  }
};

const getCharactersByCampaignId = async (req, res, logError) => {
  try {
    const characters = await characterService.getCharactersByCampaignId(
      req.params.campaignId
    );
    res.status(200).json(characters);
  } catch (error) {
    logError(error);
  }
};

const createCharacter = async (req, res, logError) => {
  try {
    const newCharacter = await characterService.createCharacter(req.body);
    res.status(201).json(newCharacter);
  } catch (error) {
    logError(error);
  }
};

const updateCharacter = async (req, res, logError) => {
  try {
    const updatedCharacter = await characterService.updateCharacter(
      req.params.id,
      req.body
    );
    res.status(200).json(updatedCharacter);
  } catch (error) {
    logError(error);
  }
};

const deleteCharacter = async (req, res, logError) => {
  try {
    await characterService.deleteCharacter(req.params.id);
    res.status(200).json({ message: "Character deleted successfully" });
  } catch (error) {
    logError(error);
  }
};

const updateCharacterAttributes = async (req, res, logError) => {
  try {
    const { category, attribute, value } = req.body;
    const updated = await characterService.updateCharacterAttributes(
      req.params.id,
      { category, attribute, value }
    );
    res.status(200).json(updated);
  } catch (error) {
    logError(error);
  }
};

module.exports = {
  getAllCharacters,
  getCharacterById,
  getCharactersByCampaignId,
  createCharacter,
  updateCharacter,
  deleteCharacter,
  updateCharacterAttributes,
};

const { collections } = require("../../database/mongoCollections");
const { ObjectId } = require("mongodb");
const {
  createMongoDocument,
  updateMongoDocument,
} = require("../../database/middlewares/mongo");

const getAllCharacters = async () => {
  return await collections.charactersCollection.find().toArray();
};

const getCharacterById = async (id) => {
  return await collections.charactersCollection.findOne({
    _id: ObjectId.createFromHexString(id),
  });
};

const createCharacter = async (characterData) => {
  return await createMongoDocument(
    collections.charactersCollection,
    characterData
  );
};

const updateCharacter = async (id, characterData) => {
  return await updateMongoDocument(
    collections.charactersCollection,
    id,
    characterData
  );
};

const deleteCharacter = async (id) => {
  return await collections.charactersCollection.deleteOne({
    _id: ObjectId.createFromHexString(id),
  });
};

module.exports = {
  getAllCharacters,
  getCharacterById,
  createCharacter,
  updateCharacter,
  deleteCharacter,
};

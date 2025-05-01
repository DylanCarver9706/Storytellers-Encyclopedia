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
  const character = await collections.charactersCollection.findOne({
    _id: ObjectId.createFromHexString(id),
  });
  return {
    ...character,
    campaign: await collections.campaignsCollection.findOne({
      _id: character.campaignId,
    }),
  };
};

const getCharactersByCampaignId = async (campaignId) => {
  return await collections.charactersCollection
    .find({ campaignId: ObjectId.createFromHexString(campaignId) })
    .toArray();
};

const createCharacter = async (characterData) => {
  const { campaignId, ...characterDataWithoutCampaignId } = characterData;
  const mongoDocument = {
    ...characterDataWithoutCampaignId,
    campaignId: ObjectId.createFromHexString(campaignId),
  };
  return await createMongoDocument(
    collections.charactersCollection,
    mongoDocument,
    true
  );
};

const updateCharacter = async (id, characterData) => {
  const { campaignId, ...characterDataWithoutCampaignId } = characterData;
  const mongoDocument = {
    ...characterDataWithoutCampaignId,
    campaignId: ObjectId.createFromHexString(campaignId),
  };
  return await updateMongoDocument(
    collections.charactersCollection,
    id,
    {
      $set: mongoDocument,
    },
    true
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
  getCharactersByCampaignId,
  createCharacter,
  updateCharacter,
  deleteCharacter,
};

const { collections } = require("../../database/mongoCollections");
const { ObjectId } = require("mongodb");
const {
  createMongoDocument,
  updateMongoDocument,
} = require("../../database/middlewares/mongo");
const {
  characterAttributesConfig,
} = require("../config/characterAttributesConfig");

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
    attributes: characterAttributesConfig,
  };
  return await createMongoDocument(
    collections.charactersCollection,
    mongoDocument,
    true
  );
};

const updateCharacter = async (id, characterData) => {
  // console.log("characterData", characterData);
  if (characterData.campaignId) {
    characterData.campaignId = ObjectId.createFromHexString(
      characterData.campaignId
    );
  }
  // Delete the _id from the characterDataWithoutCampaignId if it exists
  if (characterData._id) {
    delete characterData._id;
  }
  const mongoDocument = {
    ...characterData,
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

const updateCharacterAttributes = async (id, attributesPatch) => {
  const { category, attribute, value } = attributesPatch;
  if (process.env.ENV === "development") {
    console.log("attributesPatch", attributesPatch);
  }
  return await updateMongoDocument(
    collections.charactersCollection,
    id,
    { $set: { [`attributes.${category}.${attribute}.value`]: value } },
    true
  );
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

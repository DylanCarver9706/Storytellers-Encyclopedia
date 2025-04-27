const { collections } = require("../../database/mongoCollections");
const { ObjectId } = require("mongodb");
const {
  createMongoDocument,
  updateMongoDocument,
} = require("../../database/middlewares/mongo");

const getAllFamilies = async () => {
  return await collections.familiesCollection.find().toArray();
};

const getFamilyById = async (id) => {
  return await collections.familiesCollection.findOne({
    _id: ObjectId.createFromHexString(id),
  });
};

const createFamily = async (familyData) => {
  return await createMongoDocument(collections.familiesCollection, familyData);
};

const updateFamily = async (id, familyData) => {
  return await updateMongoDocument(
    collections.familiesCollection,
    id,
    familyData
  );
};

const deleteFamily = async (id) => {
  return await collections.familiesCollection.deleteOne({
    _id: ObjectId.createFromHexString(id),
  });
};

module.exports = {
  getAllFamilies,
  getFamilyById,
  createFamily,
  updateFamily,
  deleteFamily,
};

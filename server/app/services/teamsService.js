const { collections } = require("../../database/mongoCollections");
const {
  createMongoDocument,
  updateMongoDocument,
} = require("../../database/middlewares/mongo");
const { ObjectId } = require("mongodb");

const createTeam = async (teamData) => {
  if (!teamData.name) {
    throw new Error("Team name is required.");
  }
  const result = await createMongoDocument(
    collections.teamsCollection,
    teamData
  );
  return { teamId: result.insertedId };
};

const getAllTeamsWithPlayers = async () => {
  const teams = await collections.teamsCollection.find().toArray();
  return await Promise.all(
    teams.map(async (team) => {
      const playerIds = Array.isArray(team.players) ? team.players : [];
      const players = await collections.playersCollection
        .find({ _id: { $in: playerIds } })
        .toArray();
      return { ...team, players };
    })
  );
};

const getAllTeams = async () => {
  return await collections.teamsCollection.find().toArray();
};

const getTeamById = async (id) => {
  return await collections.teamsCollection.findOne({
    _id: ObjectId.createFromHexString(id),
  });
};

const updateTeam = async (id, updateData) => {
  await updateMongoDocument(collections.teamsCollection, id, {
    $set: updateData,
  });
};

const deleteTeam = async (id) => {
  const teamId = ObjectId.createFromHexString(id);

  const team = await getTeamById(id);
  if (!team) throw new Error("Team not found");

  await collections.playersCollection.deleteMany({ team: teamId });
  await collections.teamsCollection.deleteOne({ _id: teamId });
};

module.exports = {
  createTeam,
  getAllTeamsWithPlayers,
  getAllTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
};

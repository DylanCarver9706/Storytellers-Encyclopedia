const { updateMongoDocument } = require("../../database/middlewares/mongo");
const { collections } = require("../../database/mongoCollections");
const { ObjectId } = require("mongodb");
const { getTournamentById } = require("./tournamentsService");

const getAllLeaderboards = async () => {
  const leaderboards = await collections.leaderboardsCollection
    .find()
    .toArray();

  // Populate users for each leaderboard
  return await Promise.all(
    leaderboards.map(async (leaderboard) => {
      const userDocs = await collections.usersCollection
        .find({ _id: { $in: leaderboard.users } })
        .toArray();
      return { ...leaderboard, users: userDocs };
    })
  );
};

const getLeaderboardById = async (id) => {
  const leaderboard = await collections.leaderboardsCollection.findOne({
    _id: ObjectId.createFromHexString(id),
  });
  if (!leaderboard) return null;

  // Populate users
  const userDocs = await collections.usersCollection
    .find({ _id: { $in: leaderboard.users } })
    .toArray();
  return { ...leaderboard, users: userDocs };
};

const createLeaderboard = async (leaderboardData) => {
  const result = await collections.leaderboardsCollection.insertOne(
    leaderboardData
  );
  if (result.insertedId) {
    return await getLeaderboardById(result.insertedId.toString());
  }
  throw new Error("Failed to create leaderboard");
};

const updateLeaderboard = async (id, updateData) => {
  const result = await collections.leaderboardsCollection.updateOne(
    { _id: ObjectId.createFromHexString(id) },
    { $set: updateData }
  );
  if (result.modifiedCount === 0) {
    throw new Error("Failed to update leaderboard or no changes made");
  }
  return await getLeaderboardById(id);
};

const deleteLeaderboard = async (id) => {
  const result = await collections.leaderboardsCollection.deleteOne({
    _id: ObjectId.createFromHexString(id),
  });
  if (result.deletedCount === 0) {
    throw new Error("Leaderboard not found");
  }
};

const getCurrentLeaderboard = async (returnIds = false) => {
  const leaderboard = await collections.leaderboardsCollection.findOne({
    status: { $in: ["Ongoing", "Bettable"] },
  });

  if (!leaderboard) {
    return null;
  }

  // Populate users and sort by earnedCredits
  const userDocs = await collections.usersCollection
    // Only fetch users with active accounts and non-zero lifetimeEarnedCredits
    .find({ _id: { $in: leaderboard.users }, accountStatus: "active", earnedCredits: { $gt: 0 } })
    .project({ name: 1, earnedCredits: 1 }) // Only fetch name and earnedCredits
    .toArray();

  let sortedUsers;

  if (returnIds) {
    sortedUsers = userDocs
      .sort((a, b) => b.earnedCredits - a.earnedCredits);
  } else {
    sortedUsers = userDocs
      .sort((a, b) => b.earnedCredits - a.earnedCredits)
      .map(({ name, earnedCredits }) => ({ name, earnedCredits })); // Exclude _id
  }

  // Update the leaderboard document with the sorted user IDs
  const sortedUserIds = userDocs.map((user) => user._id);
  await updateMongoDocument(
    collections.leaderboardsCollection,
    leaderboard._id.toString(),
    { $set: { users: sortedUserIds } }
  );

  // Return the updated leaderboard with sorted users (name and earnedCredits only)
  const tournament = await getTournamentById(leaderboard.tournament.toString());
  return {
    ...leaderboard,
    tournamentName: tournament.name,
    users: sortedUsers,
  };
};

const getLifetimeLeaderboard = async (returnIds = false) => {
  // Populate users and sort by earnedCredits
  const userDocs = await collections.usersCollection
    // Only fetch users with active accounts and non-zero lifetimeEarnedCredits
    .find({ accountStatus: "active", lifetimeEarnedCredits: { $gt: 0 } })
    .project({ name: 1, lifetimeEarnedCredits: 1 }) // Only fetch name and lifetimeEarnedCredits
    .toArray();

  let sortedUsers;

  if (returnIds) {
    sortedUsers = userDocs
      .sort((a, b) => b.lifetimeEarnedCredits - a.lifetimeEarnedCredits);
  } else {
    sortedUsers = userDocs
      .sort((a, b) => b.lifetimeEarnedCredits - a.lifetimeEarnedCredits)
      .map(({ name, lifetimeEarnedCredits }) => ({
        name,
        lifetimeEarnedCredits,
      })); // Exclude _id
  }

  // Return the updated sorted users (name and earnedCredits only)
  return sortedUsers;
};

module.exports = {
  getAllLeaderboards,
  getLeaderboardById,
  createLeaderboard,
  updateLeaderboard,
  deleteLeaderboard,
  getCurrentLeaderboard,
  getLifetimeLeaderboard,
};

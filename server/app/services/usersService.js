// app/services/userService.js
const { collections } = require("../../database/mongoCollections");
const { ObjectId } = require("mongodb");
const {
  createMongoDocument,
  updateMongoDocument,
} = require("../../database/middlewares/mongo");
const { broadcastUpdate } = require("../middlewares/supabaseAdmin");
const { sendEmail } = require("../middlewares/nodemailer");
const { createUserNotificationLog } = require("./logsService");

const getAllUsers = async () => {
  return await collections.usersCollection.find().toArray();
};

const getUserById = async (id) => {
  return await collections.usersCollection.findOne({
    _id: ObjectId.createFromHexString(id),
  });
};

const getUserByFirebaseId = async (firebaseUserId) => {
  return await collections.usersCollection.findOne({ firebaseUserId });
};

const createUser = async (userData) => {
  let defaultNewUserValues = {
    credits: 0.0,
    earnedCredits: 0.0,
    lifetimeEarnedCredits: 0.0,
    idvStatus: "unverified",
    emailVerificationStatus: "unverified",
    smsVerificationStatus: "unverified",
    userType: "user",
    accountStatus: "active",
    ageValid: false,
    DOB: null,
    phoneNumber: null,
    viewedInstructions: false,
    madeFirstPurchase: false,
  };

  let userDoc = null;

  // Check if a user with the provided email exists and has been deleted
  const existingUser = await collections.usersCollection.findOne({
    email: userData.email,
    // accountStatus: "deleted",
  });

  if (existingUser) {
    console.log("User exists, updating account status to active");
    userDoc = await updateMongoDocument(
      collections.usersCollection,
      existingUser._id.toString(),
      { $set: { ...userData, accountStatus: "active" } },
      true
    );
  } else {
    userDoc = await createMongoDocument(
      collections.usersCollection,
      { ...defaultNewUserValues, ...userData },
      true
    );
  }

  await sendEmail(
    userData.email,
    "Welcome to Storyteller's Encyclopedia",
    `Hello ${userData.name},\n\nWelcome to Storyteller's Encyclopedia! We're excited to have you on board. Your account is now active, and you can start using our services right away.\n\nIf you have any questions or need assistance, please don't hesitate to reach out to our support team.\n\nBest regards,\nThe Storyteller's Encyclopedia Team`,
    null,
    null
  );

  await createUserNotificationLog({
    user: userDoc._id.toString(),
    type: "welcome",
    message:
      "Welcome to Storyteller's Encyclopedia! Feel free to explore our platform and start betting on your favorite teams or players. Good luck!",
  });

  await createUserNotificationLog({
    user: userDoc._id.toString(),
    type: "welcome",
    message:
      "Ready to get in on the action? Enjoy 50% off all credits on your first purchase!",
  });

  return userDoc;
};

const updateUser = async (id, updateData) => {
  // Fields allowed to be updated from the client
  const allowedFields = [
    "pp",
    "tos",
    "emailVerificationStatus",
    "address",
    "DOB",
    "idvStatus",
    "viewedInstructions",
    "emailVerificationStatus",
    "ageValid",
    "phoneNumber",
    "name",
    "email",
    "smsVerificationStatus",
    "accountStatus",
  ];

  // Check if any of the fields in updateData are not allowed
  for (const field in updateData) {
    if (!allowedFields.includes(field)) {
      throw new Error(`Field ${field} is not allowed to be updated`);
    }
  }

  await updateMongoDocument(collections.usersCollection, id, {
    $set: updateData,
  });

  const updatedUser = await collections.usersCollection.findOne({
    _id: ObjectId.createFromHexString(id),
  });

  // Emit updates via Supabase
  const allUsers = await getAllUsers();
  await broadcastUpdate("users", "updateUser", { user: updatedUser });
  await broadcastUpdate("users", "updateUsers", { users: allUsers });

  return updatedUser;
};

const softDeleteUser = async (id) => {
  await updateMongoDocument(collections.usersCollection, id, {
    $set: {
      name: null,
      // email
      // mongoUserId
      credits: 0.0,
      earnedCredits: 0.0,
      lifetimeEarnedCredits: 0.0,
      firebaseUserId: null,
      // userType
      idvStatus: "unverified",
      emailVerificationStatus: "unverified",
      accountStatus: "deleted",
      DOB: null,
      referralCode: null,
      authProvider: null,
      phoneNumber: null,
      tos: null,
      pp: null,
      ageValid: null,
      locationValid: null,
      currentState: null,
      smsVerificationStatus: null,
      viewedInstructions: null,
      userMadeFirstPurchase: null,
      address: null,
    },
  });

  const updatedUser = await collections.usersCollection.findOne({
    _id: ObjectId.createFromHexString(id),
  });

  // Emit updates via Supabase
  const allUsers = await getAllUsers();
  await broadcastUpdate("users", "updateUser", { user: updatedUser });
  await broadcastUpdate("users", "updateUsers", { users: allUsers });
};

const deleteUser = async (id) => {
  const result = await collections.usersCollection.deleteOne({
    _id: ObjectId.createFromHexString(id),
  });
  if (result.deletedCount === 0) throw new Error("User not found");
};

const adminEmailUsers = async (users, subject, body) => {
  // console.log("Sending email to users:", users);
  for (const user of users) {
    await sendEmail(user, subject, null, body, null);
  }
};

const sendIdentityVerificationResults = async (submissionData) => {
  let updateUserObject = {
    idvStatus: submissionData.status,
  };

  if (
    submissionData.status === "denied" &&
    submissionData.reason === "Underage"
  ) {
    updateUserObject.ageValid = false;
  }

  const updatedUser = await updateMongoDocument(
    collections.usersCollection,
    submissionData.userId,
    {
      $set: updateUserObject,
    },
    true
  );

  let bodyHtml = "";
  if (submissionData.status === "verified") {
    bodyHtml = `
    <p>Congratulations! Your identity verification has been approved. You can now start betting on <a href="${process.env.DEV_CLIENT_URL}/Wagers">Storyteller's Encyclopedia</a>!</p>
    </p>
  `;
  } else if (submissionData.status === "denied") {
    bodyHtml = `
    <p>We're sorry, but your identity verification has been denied due to reason: "${submissionData.reason}". Please contact <a href="${process.env.DEV_CLIENT_URL}/Feedback-Form">Support</a> for further assistance.</p>
  `;
  }

  await sendEmail(
    updatedUser.email,
    "Storyteller's Encyclopedia Identity Verification Results",
    null,
    bodyHtml,
    null
  );

  await createUserNotificationLog({
    user: updatedUser._id.toString(),
    type: "info",
    message:
      "Your identity verification status has been updated to: " +
      (submissionData.status === "verified"
        ? "Approved"
        : `Denied due to reason: "${submissionData.reason}"`),
  });
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserByFirebaseId,
  createUser,
  updateUser,
  softDeleteUser,
  deleteUser,
  adminEmailUsers,
  sendIdentityVerificationResults,
};

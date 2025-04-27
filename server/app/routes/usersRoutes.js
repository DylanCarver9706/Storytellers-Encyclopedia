// app/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/usersController");
const { verifyFirebaseToken } = require("../middlewares/firebaseAdmin");

router.get("/", verifyFirebaseToken(true), userController.getAllUsers);
router.get("/:id", verifyFirebaseToken(true), userController.getUserById);
router.get("/firebase/:firebaseUserId", verifyFirebaseToken(), userController.getUserByFirebaseId);
router.post("/send_admin_email", verifyFirebaseToken(true), userController.adminEmailUsers);
router.post("/identity_verification_complete", verifyFirebaseToken(), userController.identityVerificationComplete);
router.post("/", verifyFirebaseToken(), userController.createUser);
router.put("/:id", verifyFirebaseToken(), userController.updateUser);
// The whole purpose of this route is to allow the user to delete their account without a firebase token
router.put("/soft_delete/:id", verifyFirebaseToken(), userController.softDeleteUserStatusUpdate);
router.delete("/:id", verifyFirebaseToken(true), userController.deleteUser);

module.exports = router;
